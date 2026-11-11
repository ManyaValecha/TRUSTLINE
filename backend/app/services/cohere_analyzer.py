import os
import json

import cohere
from dotenv import load_dotenv

load_dotenv()


class CohereAnalysisError(Exception):
    """Raised when Cohere scam analysis fails."""


SCAM_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "risk_level": {
            "type": "string"
        },
        "is_scam_likely": {
            "type": "boolean"
        },
        "detected_tactics": {
            "type": "array",
            "items": {"type": "string"}
        },
        "evidence": {
            "type": "array",
            "items": {"type": "string"}
        },
        "recommended_action": {
            "type": "string"
        },
        "explanation": {
            "type": "string"
        }
    },
    "required": [
        "risk_level",
        "is_scam_likely",
        "detected_tactics",
        "evidence",
        "recommended_action",
        "explanation"
    ]
}


def analyze_transcript(transcript: str) -> dict:
    api_key = os.getenv("COHERE_API_KEY")

    if not api_key:
        raise CohereAnalysisError(
            "Cohere API credentials are not configured."
        )

    if not transcript or not transcript.strip():
        raise CohereAnalysisError("Transcript is empty.")

    try:
        client = cohere.ClientV2(api_key=api_key)

        response = client.chat(
            model=os.getenv("COHERE_MODEL", "command-a-03-2025"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are TRUSTLINE, a voice scam risk analysis "
                        "assistant. Analyse the supplied call transcript. "
                        "Look for OTP or UPI PIN requests, payment pressure, "
                        "impersonation, threats, secrecy, remote access "
                        "requests and suspicious links. Do not assume every "
                        "conversation is a scam. Ordinary discussion about "
                        "audio, translation or technology is not itself a "
                        "scam. Use only evidence present in the transcript. "
                        "If evidence is insufficient, say so. "
                        "Set risk_level to LOW, MEDIUM or HIGH. "
                        "Return the requested JSON object."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        "Analyse this transcript for scam risk and return "
                        "a JSON object following the required schema:\n\n"
                        + transcript
                    )
                }
            ],
            response_format={
                "type": "json_object",
                "schema": SCAM_ANALYSIS_SCHEMA
            }
        )

        result_text = response.message.content[0].text
        result = json.loads(result_text)

        return {
            "success": True,
            "provider": "Cohere",
            **result
        }

    except Exception as exc:
        raise CohereAnalysisError(
            f"Cohere analysis failed: {str(exc)}"
        ) from exc
