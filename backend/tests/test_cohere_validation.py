"""Tests for rejecting malformed and ungrounded model output."""

import pytest
from pydantic import ValidationError

from app.services.cohere_analyzer import (
    CohereAnalysisError,
    validate_analysis_payload,
)


def valid_payload() -> dict:
    return {
        "risk_level": "HIGH",
        "is_scam_likely": True,
        "detected_tactics": ["OTP Request"],
        "evidence": ["share the OTP"],
        "recommended_action": "Do not share the code.",
        "explanation": "The caller asks for a one-time code.",
    }


def test_valid_output_and_exact_quote_are_accepted_case_insensitively() -> None:
    result = validate_analysis_payload(valid_payload(), "Please SHARE the OTP now.")
    assert result["risk_level"] == "HIGH"
    assert result["evidence"] == ["share the OTP"]


def test_quote_not_in_transcript_is_rejected() -> None:
    with pytest.raises(CohereAnalysisError, match="not present"):
        validate_analysis_payload(valid_payload(), "Please verify your account.")


def test_invalid_risk_value_is_rejected() -> None:
    payload = valid_payload()
    payload["risk_level"] = "CERTAIN"
    with pytest.raises(ValidationError):
        validate_analysis_payload(payload, "Please share the OTP.")


def test_unexpected_fields_are_rejected() -> None:
    payload = valid_payload()
    payload["confidence_score"] = 0.99
    with pytest.raises(ValidationError):
        validate_analysis_payload(payload, "Please share the OTP.")


def test_single_quote_cannot_remain_critical_even_with_several_claimed_tactics() -> None:
    payload = valid_payload()
    payload["risk_level"] = "CRITICAL"
    payload["detected_tactics"] = ["OTP Request", "Threat", "Payment Pressure"]
    result = validate_analysis_payload(payload, "Please share the OTP.")
    assert result["risk_level"] == "HIGH"
    assert "reduced to High" in result["explanation"]


def test_multiple_distinct_grounded_behaviors_can_remain_critical() -> None:
    payload = valid_payload()
    payload["risk_level"] = "CRITICAL"
    payload["detected_tactics"] = ["Authority Impersonation", "Threat", "Payment Pressure"]
    payload["evidence"] = ["I am from police", "pay the fine today"]
    transcript = "I am from police. You are under arrest. Please pay the fine today."
    result = validate_analysis_payload(payload, transcript)
    assert result["risk_level"] == "CRITICAL"
