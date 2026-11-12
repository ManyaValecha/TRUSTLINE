import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


class GnaniTTSError(Exception):
    """Raised when Gnani text-to-speech fails."""


def generate_speech(
    text: str,
    language_code: str = "hi-IN",
    voice: str = "Nalini",
    output_path: str = "tests/audio/trustline_warning_hi.wav",
) -> dict:

    api_key = os.getenv("GNANI_API_KEY_ID")

    if not api_key:
        raise GnaniTTSError("Gnani API credentials are not configured.")

    if not text or not text.strip():
        raise GnaniTTSError("Warning text is empty.")

    try:
        # The provider SDK is optional for read-only API routes and deployments
        # without TTS enabled. Import it only when speech generation is requested.
        try:
            from gnani.tts import GnaniTTSClient, AudioConfig
        except ImportError as exc:
            raise GnaniTTSError("Gnani TTS SDK is not installed.") from exc

        client = GnaniTTSClient(api_key=api_key)

        audio = client.synthesize(
            text,
            voice=voice,
            model="timbre-v2.5",
            language=language_code,
            speed=1.0,
            audio_config=AudioConfig(
                container="wav",
                sample_rate=48000,
            ),
        )

        if not audio:
            raise GnaniTTSError("Gnani returned empty audio.")

        output = Path(output_path)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(audio)

        return {
            "success": True,
            "provider": "Gnani Timbre",
            "voice": voice,
            "language": language_code,
            "audio_path": str(output),
            "audio_size": len(audio),
        }

    except GnaniTTSError:
        raise

    except Exception as exc:
        raise GnaniTTSError(
            f"Gnani speech generation failed: {exc}"
        ) from exc
