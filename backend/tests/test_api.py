"""Offline API boundary checks; provider services are mocked."""

from fastapi.testclient import TestClient

from app import main


client = TestClient(main.app)


def wav_bytes() -> bytes:
    return b"RIFF" + b"\x00\x00\x00\x00" + b"WAVE" + b"fmt "


def test_health_reports_configuration_without_claiming_provider_connectivity() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["provider_configuration"]
    assert "connectivity is not checked" in response.json()["note"]


def test_non_audio_and_empty_uploads_are_rejected() -> None:
    wrong_type = client.post(
        "/api/analyze",
        files={"audio": ("memo.txt", b"hello", "text/plain")},
    )
    assert wrong_type.status_code == 400

    empty = client.post(
        "/api/analyze",
        files={"audio": ("empty.wav", b"", "audio/wav")},
    )
    assert empty.status_code == 400


def test_audio_mime_type_must_match_supported_container_signature() -> None:
    response = client.post(
        "/api/analyze",
        files={"audio": ("spoofed.wav", b"not an audio container", "audio/wav")},
    )
    assert response.status_code == 400
    assert "does not match" in response.json()["detail"]


def test_oversized_upload_is_rejected() -> None:
    response = client.post(
        "/api/analyze",
        files={"audio": ("large.wav", b"0" * (main.MAX_AUDIO_BYTES + 1), "audio/wav")},
    )
    assert response.status_code == 413


def test_provider_exception_does_not_leak_details(monkeypatch) -> None:
    async def fail(**_kwargs):
        raise RuntimeError("sensitive provider diagnostic")

    monkeypatch.setattr(main, "analyze_audio", fail)
    response = client.post(
        "/api/analyze",
        files={"audio": ("valid.wav", wav_bytes(), "audio/wav")},
    )
    assert response.status_code == 502
    assert "sensitive provider diagnostic" not in response.text


def test_analysis_response_is_validated_by_the_typed_api_schema(monkeypatch) -> None:
    async def analyze(**_kwargs):
        return {
            "success": True,
            "transcription": {
                "success": True,
                "provider": "Test",
                "transcript": "Routine appointment reminder.",
                "language_code": "en-IN",
            },
            "ai_analysis": {
                "success": True,
                "provider": "Cohere",
                "risk_level": "LOW",
                "is_scam_likely": False,
                "detected_tactics": [],
                "evidence": [],
                "recommended_action": "Verify unexpected requests independently.",
                "explanation": "No contextual indicators were found.",
            },
            "rule_analysis": {
                "risk_level": "LOW",
                "detected_tactics": [],
                "evidence": [],
                "signals": [],
                "uncertainty": None,
                "score": 0,
            },
            "scam_analysis": {
                "risk_level": "LOW",
                "is_scam_likely": False,
                "detected_tactics": [],
                "evidence": [],
                "recommended_action": "Verify unexpected requests independently.",
                "explanation": "No contextual indicators were found.",
                "signals": [],
                "analysis_complete": True,
                "uncertainty": None,
            },
            "translated_warning": "Verify unexpected requests independently.",
            "target_language": "en-IN",
            "translated_warning_language": "en-IN",
            "spoken_warning": {"success": False, "message": "Not requested."},
            "provider_status": {
                "transcription": "complete",
                "contextual_analysis": "complete",
                "translation": "complete",
                "spoken_guidance": "not_requested",
            },
        }

    monkeypatch.setattr(main, "analyze_audio", analyze)
    response = client.post(
        "/api/analyze",
        files={"audio": ("valid.wav", wav_bytes(), "audio/wav")},
    )
    assert response.status_code == 200
    assert response.json()["scam_analysis"]["analysis_complete"] is True
