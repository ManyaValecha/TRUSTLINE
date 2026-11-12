import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GNANI_STT_URL = "https://api.vachana.ai/stt/v3"


class GnaniSTTError(Exception):
    """Raised when Gnani transcription fails."""


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str = "recording.wav",
    language_code: str = "hi-IN",
    content_type: str = "audio/wav",
) -> dict:

    api_key = os.getenv("GNANI_API_KEY_ID")

    if not api_key:
        raise GnaniSTTError("Gnani API credentials are not configured.")

    if not audio_bytes:
        raise GnaniSTTError("Audio file is empty.")

    data = {
        "language_code": language_code,
        "preferred_language": language_code,
        "format": "transcribe",
        "itn_native_numerals": "true",
    }

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
            "language_code": language_code,
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
