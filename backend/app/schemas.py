"""Shared, strictly validated schemas for detection results."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
Severity = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
DetectionSource = Literal["deterministic_rule", "cohere"]


class DetectionSignal(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    category: str = Field(min_length=1, max_length=100)
    severity: Severity
    evidence: str = Field(min_length=1, max_length=500)
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    explanation: str = Field(min_length=1, max_length=500)
    source: DetectionSource
    supporting_signals: list[str] = Field(default_factory=list, max_length=20)
    conflicting_signals: list[str] = Field(default_factory=list, max_length=20)
    recommended_action: str = Field(min_length=1, max_length=500)

    @model_validator(mode="after")
    def span_must_contain_evidence_length(self):
        if self.end - self.start != len(self.evidence):
            raise ValueError("Evidence span length must match the evidence excerpt length")
        return self


class RuleAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    risk_level: RiskLevel
    detected_tactics: list[str] = Field(max_length=30)
    evidence: list[str] = Field(max_length=50)
    signals: list[DetectionSignal] = Field(max_length=50)
    uncertainty: str | None = Field(default=None, max_length=500)
    score: int = Field(ge=0, le=150, description="Ordinal rule weight; not a probability")


class TranscriptionResult(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    success: bool
    provider: str = Field(min_length=1, max_length=80)
    transcript: str
    request_id: str | None = None
    language_code: str | None = None


class CombinedAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    risk_level: RiskLevel
    is_scam_likely: bool
    detected_tactics: list[str] = Field(max_length=50)
    evidence: list[str] = Field(max_length=100)
    recommended_action: str = Field(min_length=1, max_length=1500)
    explanation: str = Field(min_length=1, max_length=2000)
    signals: list[DetectionSignal] = Field(max_length=100)
    analysis_complete: bool
    uncertainty: str | None = Field(default=None, max_length=1000)


class SpokenWarningResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool
    message: str | None = None
    provider: str | None = None
    voice: str | None = None
    language: str | None = None
    audio_url: str | None = None
    audio_size: int | None = Field(default=None, ge=0)


class ProviderStatus(BaseModel):
    model_config = ConfigDict(extra="forbid")

    transcription: str
    contextual_analysis: str
    translation: str
    spoken_guidance: str


class AnalyzeAudioResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool
    transcription: TranscriptionResult
    ai_analysis: dict
    rule_analysis: RuleAnalysisResult
    scam_analysis: CombinedAnalysisResult
    translated_warning: str
    target_language: str
    translated_warning_language: str
    spoken_warning: SpokenWarningResult
    provider_status: ProviderStatus
