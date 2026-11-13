import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GNANI_STT_URL = "https://api.vachana.ai/stt/v3"

# Prisma v3 currently documents these ten Indic/Indian locales. The three
# named code-switch profiles provide likely-language hints without pretending
# that the model supports every Indian language or dialect.
SUPPORTED_SPEECH_LANGUAGES = {
    "bn-IN", "en-IN", "gu-IN", "hi-IN", "kn-IN",
    "ml-IN", "mr-IN", "pa-IN", "ta-IN", "te-IN",
}
CODE_SWITCH_PROFILES = {
    "hi-en": ["hi-IN", "en-IN"],
    "ta-en": ["ta-IN", "en-IN"],
    "bn-en": ["bn-IN", "en-IN"],
}


def resolve_speech_profile(profile: str) -> tuple[str, list[str] | None]:
    """Resolve a UI profile to the documented Prisma v3 request fields."""
    if profile == "indic-auto":
        return "indic-auto", None
    if profile in CODE_SWITCH_PROFILES:
        return "indic-auto", CODE_SWITCH_PROFILES[profile]
    if profile in SUPPORTED_SPEECH_LANGUAGES:
        return profile, None
    raise ValueError("Unsupported speech language profile.")


class GnaniSTTError(Exception):
    """Raised when Gnani transcription fails."""


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str = "recording.wav",
    language_code: str = "hi-IN",
    content_type: str = "audio/wav",
    language_candidates: list[str] | None = None,
) -> dict:

    api_key = os.getenv("GNANI_API_KEY_ID")

    if not api_key:
        raise GnaniSTTError("Gnani API credentials are not configured.")

    if not audio_bytes:
        raise GnaniSTTError("Audio file is empty.")

    data = {
        "language_code": language_code,
        "model": "prisma-v3.0",
        "format": "codemix",
    }
    if language_candidates:
        data["language_candidates"] = ",".join(language_candidates)

    files = {
        "audio_file": (
            filename,
            audio_bytes,
            content_type,
        )
    }

    headers = {
        "X-API-Key-ID": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                GNANI_STT_URL,
                headers=headers,
                data=data,
                files=files,
            )

        response.raise_for_status()
        result = response.json()

        transcript = result.get("transcript")

        if not result.get("success") or not transcript:
            raise GnaniSTTError(
                "Gnani did not return a successful transcript."
            )

        return {
            "success": True,
            "provider": "Gnani",
            "transcript": transcript,
            "request_id": result.get("request_id"),
            "language_code": result.get("detected_language_code") or language_code,
        }

    except httpx.HTTPStatusError as exc:
        details = exc.response.text[:1000]
        raise GnaniSTTError(
            f"Gnani returned HTTP {exc.response.status_code}: {details}"
        ) from exc

    except httpx.RequestError as exc:
        raise GnaniSTTError(
            "Could not connect to Gnani."
        ) from exc
