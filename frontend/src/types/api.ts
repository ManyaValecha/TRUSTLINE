/**
 * TRUSTLINE API & Data Models
 * Matches FastAPI backend endpoints:
 * - GET /health
 * - POST /api/analyze?speech_language={speech_lang}&target_language={target_lang}
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TranscriptionResult {
  success: boolean;
  provider: string; // e.g., "Gnani"
  transcript: string;
  request_id?: string;
  language_code?: string;
}

export interface ScamAnalysisResult {
  risk_level: RiskLevel;
  is_scam_likely: boolean;
  detected_tactics: string[];
  evidence: string[];
  recommended_action: string;
  explanation: string;
  analysis_complete?: boolean;
  uncertainty?: string | null;
  signals?: DetectionSignal[];
}

export interface DetectionSignal {
  category: string;
  severity: RiskLevel;
  evidence: string;
  start: number;
  end: number;
  explanation: string;
  source: 'deterministic_rule' | 'cohere';
  supporting_signals: string[];
  conflicting_signals: string[];
  recommended_action: string;
}

export interface DetailedAiAnalysis {
  confidence_score?: number;
  sentiment?: string;
  coercion_score?: number;
  reasoning_notes?: string[];
  [key: string]: unknown;
}

export interface DetailedRuleAnalysis {
  rules_triggered?: string[];
  keyword_matches?: string[];
  critical_flags?: boolean;
  [key: string]: unknown;
}

export interface AnalyzeAudioResponse {
  success: boolean;
  /** True when this report is illustrative demo data, not backend analysis. */
  simulation?: boolean;
  transcription: TranscriptionResult;
  scam_analysis: ScamAnalysisResult;
  translated_warning?: string;
  target_language?: string;
  translated_warning_language?: string;
  provider_status?: {
    transcription?: string;
    contextual_analysis?: string;
    translation?: string;
    spoken_guidance?: string;
  };
  spoken_warning?: {
    success: boolean;
    message?: string;
    provider?: string;
    voice?: string;
    language?: string;
    audio_url?: string;
    audio_size?: number;
  };
  // Optional extended backend fields
  ai_analysis?: DetailedAiAnalysis;
  rule_analysis?: DetailedRuleAnalysis;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  note?: string;
  provider_configuration?: {
    gnani?: boolean;
    cohere?: boolean;
    sarvam?: boolean;
  };
}

export interface StoredAnalysisRecord {
  id: string;
  timestamp: number;
  fileName: string;
  durationSeconds?: number;
  riskLevel: RiskLevel;
  summary: string;
  response: AnalyzeAudioResponse;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string; // for Gnani / STT
  targetCode: string; // for Sarvam / Translation
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', speechCode: 'en-IN', targetCode: 'en-IN' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', targetCode: 'hi-IN' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', targetCode: 'bn-IN' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', targetCode: 'ta-IN' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', targetCode: 'te-IN' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', targetCode: 'mr-IN' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', targetCode: 'kn-IN' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', targetCode: 'ml-IN' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', targetCode: 'gu-IN' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', targetCode: 'pa-IN' },
];
