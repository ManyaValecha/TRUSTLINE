from pathlib import Path
import asyncio
import re

from app.services.gnani_stt import transcribe_audio, resolve_speech_profile
from app.services.cohere_analyzer import analyze_transcript, CohereAnalysisError
from app.services.sarvam_translator import translate_text
from app.services.sarvam_translator import SarvamTranslationError
from app.services.gnani_tts import generate_speech, GnaniTTSError
from app.scam_engine.rules import detect_rule_based_risks
from app.schemas import DetectionSignal


BASE_DIR = Path(__file__).resolve().parents[2]
WARNING_AUDIO = BASE_DIR / "storage" / "audio" / "trustline_warning.wav"


def combine_analysis(
    ai_result: dict,
    rule_result: dict,
    *,
    transcript: str = "",
    complete: bool = True,
) -> dict:
    priority = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

    ai_risk = ai_result["risk_level"].upper()
    rule_risk = rule_result["risk_level"].upper()

    final_risk = max(
        [ai_risk, rule_risk],
        key=lambda risk: priority.get(risk, 1),
    )

    tactics = list(dict.fromkeys(
        ai_result["detected_tactics"] +
        rule_result["detected_tactics"]
    ))

    evidence = list(dict.fromkeys(
        ai_result["evidence"] +
        rule_result["evidence"]
    ))

    signals = list(rule_result.get("signals", []))
    for excerpt in ai_result.get("evidence", []):
        match = re.search(re.escape(excerpt), transcript, flags=re.IGNORECASE)
        if not match:
            # Evidence is validated at the Cohere boundary. Keep this second
            # guard so ungrounded evidence can never reach the report.
            continue
        signals.append(DetectionSignal(
            category="Contextual AI indicator",
            severity=ai_risk,
            evidence=excerpt,
            start=match.start(),
            end=match.end(),
            explanation="Contextual analysis flagged this exact transcript excerpt.",
            source="cohere",
            recommended_action="Pause and independently verify before sharing information or sending money.",
        ).model_dump())

    if final_risk in {"HIGH", "CRITICAL"}:
        action = (
            "Stop the conversation immediately. Do not share OTPs, "
            "UPI PINs, passwords or money. Contact your bank using "
            "its official customer service number."
        )
    elif final_risk == "MEDIUM":
        action = (
            "Be cautious. Do not share personal or financial information "
            "until you independently verify the caller."
        )
    else:
        action = ai_result["recommended_action"]

    uncertainties: list[str] = []
    if rule_result.get("uncertainty"):
        uncertainties.append(rule_result["uncertainty"])
    if abs(priority[ai_risk] - priority[rule_risk]) >= 2:
        uncertainties.append(
            "Contextual AI and deterministic rules disagree substantially. The higher indicated risk is retained; verify the request independently."
        )
    if not complete:
        uncertainties.append(
            "Contextual AI analysis did not complete. This result uses deterministic rules only."
        )

    return {
        "risk_level": final_risk,
        "is_scam_likely": (
            ai_result["is_scam_likely"] or final_risk in {"HIGH", "CRITICAL"}
        ),
        "detected_tactics": tactics,
        "evidence": evidence,
        "recommended_action": action,
        "explanation": ai_result["explanation"],
        "signals": signals,
        "analysis_complete": complete,
        "uncertainty": " ".join(dict.fromkeys(uncertainties)) or None,
    }


async def analyze_audio(
    audio_bytes: bytes,
    filename: str = "recording.wav",
    speech_language: str = "indic-auto",
    target_language: str = "hi-IN",
    audio_content_type: str = "audio/wav",
) -> dict:

    # 1. Speech-to-text
    gnani_language, language_candidates = resolve_speech_profile(speech_language)
    transcription = await transcribe_audio(
        audio_bytes=audio_bytes,
        filename=filename,
        language_code=gnani_language,
        content_type=audio_content_type,
        language_candidates=language_candidates,
    )

    transcript = transcription["transcript"]

    provider_status = {
        "transcription": "complete",
        "contextual_analysis": "complete",
        "translation": "complete",
        "spoken_guidance": "not_requested",
    }

    # Provider SDKs below are synchronous, so move them off the ASGI event loop.
    try:
        ai_analysis = await asyncio.to_thread(analyze_transcript, transcript)
    except CohereAnalysisError:
        provider_status["contextual_analysis"] = "unavailable"
        ai_analysis = {
            "success": False,
            "provider": "Cohere",
            "risk_level": "LOW",
            "is_scam_likely": False,
            "detected_tactics": [],
            "evidence": [],
            "recommended_action": (
                "Contextual analysis is unavailable. Pause and independently "
                "verify any request for money, credentials, or urgent action."
            ),
            "explanation": "This result uses deterministic rules only because contextual analysis did not complete.",
        }

    # 3. Independent rules analysis
    rule_analysis = detect_rule_based_risks(transcript)

    # 4. Combine risk assessments
    final_analysis = combine_analysis(
        ai_analysis,
        rule_analysis,
        transcript=transcript,
        complete=provider_status["contextual_analysis"] == "complete",
    )

    # 5. Translate warning
    try:
        translated_warning = await asyncio.to_thread(
            translate_text,
            text=final_analysis["recommended_action"],
            source_language_code="en-IN",
            target_language_code=target_language,
        )
        translated_text = translated_warning["translated_text"]
    except SarvamTranslationError:
        provider_status["translation"] = "unavailable"
        translated_text = final_analysis["recommended_action"]

    # 6. Generate spoken warning
    spoken_warning = {
        "success": False,
        "message": "Spoken guidance is unavailable; read the safety guidance shown on screen.",
    }

    try:
        if target_language != "hi-IN":
            raise GnaniTTSError(
                "The current configured Timbre voice is for Hindi warnings."
            )

        tts_result = await asyncio.to_thread(
            generate_speech,
            text=translated_text,
            language_code=target_language,
            voice="Nalini",
            # Vercel function filesystems are read-only outside /tmp. Return
            # the compact audio payload with this result instead of persisting it.
            output_path=None,
        )

        spoken_warning = {
            "success": True,
            "provider": tts_result["provider"],
            "voice": tts_result["voice"],
            "language": tts_result["language"],
            "audio_url": f"data:audio/wav;base64,{tts_result['audio_base64']}",
            "audio_size": tts_result["audio_size"],
        }
        provider_status["spoken_guidance"] = "complete"

    except GnaniTTSError:
        provider_status["spoken_guidance"] = "unavailable"

    return {
        "success": True,
        "transcription": transcription,
        "ai_analysis": ai_analysis,
        "rule_analysis": rule_analysis,
        "scam_analysis": final_analysis,
        "translated_warning": translated_text,
        "spoken_warning": spoken_warning,
        "target_language": target_language,
        "translated_warning_language": (
            target_language if provider_status["translation"] == "complete" else "en-IN"
        ),
        "provider_status": provider_status,
    }
