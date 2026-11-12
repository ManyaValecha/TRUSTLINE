import os

from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()


class SarvamTranslationError(Exception):
    """Raised when Sarvam translation fails."""


def translate_text(
    text: str,
    source_language_code: str = "en-IN",
    target_language_code: str = "hi-IN",
) -> dict:

    api_key = os.getenv("SARVAM_API_KEY")

    if not api_key:
        raise SarvamTranslationError(
            "Sarvam API credentials are not configured."
        )

    if not text or not text.strip():
        raise SarvamTranslationError("Input text is empty.")

    if len(text) > 2000:
        raise SarvamTranslationError(
            "Text exceeds Sarvam's 2000-character limit."
        )

    try:
        client = SarvamAI(
            api_subscription_key=api_key,
            timeout=30.0,
        )

        response = client.text.translate(
            input=text,
            source_language_code=source_language_code,
            target_language_code=target_language_code,
            model="sarvam-translate:v1",
        )

        return {
            "success": True,
            "provider": "Sarvam",
            "original_text": text,
            "translated_text": response.translated_text,
            "source_language": source_language_code,
            "target_language": target_language_code,
            "request_id": getattr(response, "request_id", None),
        }

    except Exception as exc:
        raise SarvamTranslationError(
            f"Sarvam translation failed: {exc}"
        ) from exc
