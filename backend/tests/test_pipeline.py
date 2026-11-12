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
