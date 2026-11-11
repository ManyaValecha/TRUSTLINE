from pathlib import Path

from app.services.gnani_stt import transcribe_audio
from app.services.cohere_analyzer import analyze_transcript
from app.services.sarvam_translator import translate_text
from app.services.gnani_tts import generate_speech, GnaniTTSError
from app.scam_engine.rules import detect_rule_based_risks


BASE_DIR = Path(__file__).resolve().parents[2]
WARNING_AUDIO = BASE_DIR / "storage" / "audio" / "trustline_warning.wav"


def combine_analysis(ai_result: dict, rule_result: dict) -> dict:
    priority = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}

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

    if final_risk == "HIGH":
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

    return {
        "risk_level": final_risk,
        "is_scam_likely": (
            ai_result["is_scam_likely"] or final_risk == "HIGH"
        ),
        "detected_tactics": tactics,
        "evidence": evidence,
        "recommended_action": action,
        "explanation": ai_result["explanation"],
    }


async def analyze_audio(
    audio_bytes: bytes,
    filename: str = "recording.wav",
    speech_language: str = "en-IN",
    target_language: str = "hi-IN",
) -> dict:

    # 1. Speech-to-text
    transcription = await transcribe_audio(
        audio_bytes=audio_bytes,
        filename=filename,
        language_code=speech_language,
    )

    transcript = transcription["transcript"]

    # 2. Cohere AI analysis
    ai_analysis = analyze_transcript(transcript)

    # 3. Independent rules analysis
    rule_analysis = detect_rule_based_risks(transcript)

    # 4. Combine risk assessments
    final_analysis = combine_analysis(ai_analysis, rule_analysis)

    # 5. Translate warning
    translated_warning = translate_text(
        text=final_analysis["recommended_action"],
        source_language_code="en-IN",
        target_language_code=target_language,
    )

    # 6. Generate spoken warning
    spoken_warning = {
        "success": False,
        "message": "Speech generation was not completed.",
    }

    try:
        if target_language != "hi-IN":
            raise GnaniTTSError(
                "The current configured Timbre voice is for Hindi warnings."
            )

        tts_result = generate_speech(
            text=translated_warning["translated_text"],
            language_code=target_language,
            voice="Nalini",
            output_path=str(WARNING_AUDIO),
        )

        spoken_warning = {
            "success": True,
            "provider": tts_result["provider"],
            "voice": tts_result["voice"],
            "language": tts_result["language"],
            "audio_url": "/api/warnings/audio",
            "audio_size": tts_result["audio_size"],
        }

    except GnaniTTSError as error:
        spoken_warning["message"] = str(error)

    return {
        "success": True,
        "transcription": transcription,
        "ai_analysis": ai_analysis,
        "rule_analysis": rule_analysis,
        "scam_analysis": final_analysis,
        "translated_warning": translated_warning["translated_text"],
        "spoken_warning": spoken_warning,
        "target_language": target_language,
    }
