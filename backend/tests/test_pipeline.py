"""Offline tests for degraded but useful provider-failure behavior."""

import asyncio

from app.services import pipeline
from app.services.cohere_analyzer import CohereAnalysisError
from app.services.gnani_tts import GnaniTTSError
from app.services.sarvam_translator import SarvamTranslationError


def test_combined_analysis_keeps_high_risk_when_models_disagree_and_reports_uncertainty() -> None:
    ai_result = {
        "risk_level": "LOW",
        "is_scam_likely": False,
        "detected_tactics": [],
        "evidence": [],
        "recommended_action": "Verify independently.",
        "explanation": "No contextual indicator was found.",
    }
    rule_result = {
        "risk_level": "HIGH",
        "detected_tactics": ["OTP Request"],
        "evidence": ["share the OTP"],
        "signals": [],
        "uncertainty": None,
    }
    combined = pipeline.combine_analysis(
        ai_result,
        rule_result,
        transcript="Please share the OTP now.",
        complete=True,
    )
    assert combined["risk_level"] == "HIGH"
    assert combined["uncertainty"]
    assert "disagree" in combined["uncertainty"]


def test_pipeline_keeps_rule_result_when_optional_providers_fail(monkeypatch) -> None:
    observed_transcription_options = {}

    async def transcribe(**_kwargs):
        observed_transcription_options.update(_kwargs)
        return {
            "success": True,
            "provider": "Gnani",
            "transcript": "Please share the OTP immediately.",
            "language_code": "en-IN",
        }

    def cohere_fails(_transcript):
        raise CohereAnalysisError("private provider detail")

    def translation_fails(**_kwargs):
        raise SarvamTranslationError("private translation detail")

    def speech_fails(**_kwargs):
        raise GnaniTTSError("private speech detail")

    monkeypatch.setattr(pipeline, "transcribe_audio", transcribe)
    monkeypatch.setattr(pipeline, "analyze_transcript", cohere_fails)
    monkeypatch.setattr(pipeline, "translate_text", translation_fails)
    monkeypatch.setattr(pipeline, "generate_speech", speech_fails)

    result = asyncio.run(pipeline.analyze_audio(b"test audio", audio_content_type="audio/mpeg"))

    assert observed_transcription_options["content_type"] == "audio/mpeg"
    assert observed_transcription_options["language_code"] == "indic-auto"
    assert observed_transcription_options["language_candidates"] is None
    assert result["success"] is True
    assert result["scam_analysis"]["risk_level"] == "HIGH"
    assert "OTP Request" in result["scam_analysis"]["detected_tactics"]
    assert result["scam_analysis"]["analysis_complete"] is False
    assert result["provider_status"] == {
        "transcription": "complete",
        "contextual_analysis": "unavailable",
        "translation": "unavailable",
        "spoken_guidance": "unavailable",
    }
    assert result["translated_warning"] == result["scam_analysis"]["recommended_action"]
    assert result["spoken_warning"]["success"] is False


def test_pipeline_returns_generated_warning_audio_inline(monkeypatch):
    async def transcribe(**_kwargs):
        return {
            "success": True,
            "provider": "Gnani",
            "transcript": "Please share the OTP now.",
            "language_code": "en-IN",
        }

    def cohere_succeeds(_transcript):
        return {
            "success": True,
            "provider": "Cohere",
            "risk_level": "HIGH",
            "is_scam_likely": True,
            "detected_tactics": ["OTP Request"],
            "evidence": ["share the OTP"],
            "recommended_action": "Stop and verify the caller.",
            "explanation": "The caller requests a one-time password.",
        }

    def translate(**_kwargs):
        return {"translated_text": "अपना ओटीपी साझा न करें।"}

    def speak(**kwargs):
        assert kwargs["output_path"] is None
        return {
            "provider": "Gnani Timbre",
            "voice": "Shivani",
            "language": "hi-IN",
            "audio_base64": "d2F2",
            "audio_mime_type": "audio/mpeg",
            "audio_size": 3,
        }

    monkeypatch.setattr(pipeline, "transcribe_audio", transcribe)
    monkeypatch.setattr(pipeline, "analyze_transcript", cohere_succeeds)
    monkeypatch.setattr(pipeline, "translate_text", translate)
    monkeypatch.setattr(pipeline, "generate_speech", speak)

    result = asyncio.run(pipeline.analyze_audio(b"test audio"))

    assert result["provider_status"]["contextual_analysis"] == "complete"
    assert result["provider_status"]["spoken_guidance"] == "complete"
    assert result["spoken_warning"]["audio_url"] == "data:audio/mpeg;base64,d2F2"


def test_code_switch_profiles_pass_expected_language_hints_to_gnani(monkeypatch):
    observed = {}

    async def transcribe(**kwargs):
        observed.update(kwargs)
        return {
            "success": True,
            "provider": "Gnani",
            "transcript": "Please share the OTP.",
            "language_code": "hi-IN",
        }

    def cohere_fails(_transcript):
        raise CohereAnalysisError("offline")

    def translation_fails(**_kwargs):
        raise SarvamTranslationError("offline")

    def speech_fails(**_kwargs):
        raise GnaniTTSError("offline")

    monkeypatch.setattr(pipeline, "transcribe_audio", transcribe)
    monkeypatch.setattr(pipeline, "analyze_transcript", cohere_fails)
    monkeypatch.setattr(pipeline, "translate_text", translation_fails)
    monkeypatch.setattr(pipeline, "generate_speech", speech_fails)

    asyncio.run(pipeline.analyze_audio(b"audio", speech_language="ta-en"))

    assert observed["language_code"] == "indic-auto"
    assert observed["language_candidates"] == ["ta-IN", "en-IN"]


def test_speech_profile_resolution_rejects_unsupported_language():
    from app.services.gnani_stt import resolve_speech_profile

    try:
        resolve_speech_profile("xx-IN")
    except ValueError as error:
        assert "Unsupported" in str(error)
    else:
        raise AssertionError("unsupported locale should be rejected")
