/**
 * TRUSTLINE API Service
 * Communicates with the FastAPI backend.
 * Base URL fallback: http://127.0.0.1:8000
 */

import { AnalyzeAudioResponse, HealthCheckResponse } from '../types/api';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  // Check localStorage override first, then env variable, then default
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('trustline_api_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
}

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;
  isTimeout: boolean;

  constructor(message: string, status?: number, isNetworkError = false, isTimeout = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
  }
}

/**
 * Health check endpoint: GET /health
 */
export async function checkBackendHealth(timeoutMs = 6000): Promise<HealthCheckResponse> {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new ApiError(`Backend health check failed with status ${res.status}`, res.status);
    }
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Backend health check timed out. FastAPI server might be busy or unreachable.', undefined, false, true);
    }
    throw new ApiError(`Cannot connect to FastAPI backend at ${baseUrl}. Ensure your server is running on http://127.0.0.1:8000.`, undefined, true);
  }
}

/**
 * Audio analysis endpoint: POST /api/analyze?speech_language=...&target_language=...
 * Accepts multipart/form-data with "audio" field.
 * Content-Type header must NOT be manually set so browser includes multipart boundary.
 */
export async function analyzeAudio(
  audioFile: File | Blob,
  speechLanguage = 'en-IN',
  targetLanguage = 'hi-IN',
  timeoutMs = 90000 // Voice processing with STT & LLM can take up to 90s
): Promise<AnalyzeAudioResponse> {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const formData = new FormData();
  // Name the file properly if it is a raw blob
  const filename = audioFile instanceof File ? audioFile.name : 'recorded_call.webm';
  formData.append('audio', audioFile, filename);

  const queryParams = new URLSearchParams({
    speech_language: speechLanguage,
    target_language: targetLanguage,
  });

  try {
    const response = await fetch(`${baseUrl}/api/analyze?${queryParams.toString()}`, {
      method: 'POST',
      body: formData,
      // NOTE: Do not set Content-Type header! Let the browser handle the multipart boundary.
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = `Server responded with status ${response.status} (${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          errorDetail = errorJson.message;
        }
      } catch {
        // response was not JSON
      }
      throw new ApiError(errorDetail, response.status);
    }

    const data: AnalyzeAudioResponse = await response.json();
    
    // Validate core expected structure safely
    if (!data || typeof data !== 'object') {
      throw new ApiError('Received empty or non-JSON response from backend.');
    }

    // Fallback normalization in case fields are missing
    if (!data.scam_analysis) {
      throw new ApiError('Backend response was missing the authoritative "scam_analysis" object.');
    }

    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('The analysis request timed out after 90 seconds. Audio transcription or AI evaluation took too long.', undefined, false, true);
    }
    throw new ApiError(
      `Failed to communicate with FastAPI backend at ${baseUrl}. Ensure CORS is enabled and the server is running.`,
      undefined,
      true
    );
  }
}

/**
 * Diagnostic Simulator:
 * Provides realistic Gnani + Cohere + Sarvam + TRUSTLINE results
 * for testing and demonstration when the user doesn't have the Python backend running locally.
 */
export async function simulateAnalysis(
  sampleType: 'bank_kyc_scam' | 'courier_threat_scam' | 'safe_hospital_call',
  targetLanguage = 'hi-IN'
): Promise<AnalyzeAudioResponse> {
  // Simulate honest multi-step latency
  await new Promise((resolve) => setTimeout(resolve, 2400));

  if (sampleType === 'bank_kyc_scam') {
    return {
      success: true,
      transcription: {
        success: true,
        provider: 'Gnani',
        transcript:
          'Hello, this is Inspector Rajesh Sharma calling urgently from State Bank Fraud Department. Your debit card and net banking are immediately suspended due to unverified KYC documents. Within 10 minutes, all your funds will be frozen. To prevent permanent deactivation, open your phone immediately and give me the 6-digit OTP code received on SMS right now. Do not inform anyone as this is an active police case.',
        request_id: 'gnani-req-984210',
        language_code: 'en-IN',
      },
      scam_analysis: {
        risk_level: 'HIGH',
        is_scam_likely: true,
        detected_tactics: [
          'OTP requests',
          'Bank impersonation',
          'Threats of account suspension',
          'Artificial urgency (10-minute window)',
          'Secrecy demand (Do not inform anyone)',
        ],
        evidence: [
          'give me the 6-digit OTP code received on SMS right now',
          'calling urgently from State Bank Fraud Department',
          'Within 10 minutes, all your funds will be frozen',
          'Do not inform anyone as this is an active police case',
        ],
        recommended_action:
          'DISCONNECT IMMEDIATELY. Never share your OTP with anyone. Your bank will never call demanding an OTP or threatening instant police action. Immediately report to National Cyber Crime helpline at 1930.',
        explanation:
          'The caller employs severe psychological coercion, impersonates official bank law enforcement, establishes an extreme false deadline (10 minutes), demands confidentiality, and directly attempts to harvest a one-time password (OTP) to drain bank accounts.',
      },
      translated_warning:
        'चेतावनी: यह एक बहुत खतरनाक बैंक धोखाधड़ी कॉल है। अपना ओटीपी किसी के साथ साझा न करें। तुरंत फोन काट दें और साइबर क्राइम हेल्पलाइन 1930 पर सूचित करें।',
      target_language: targetLanguage,
      ai_analysis: {
        confidence_score: 0.98,
        sentiment: 'High Hostility / Coercive',
        coercion_score: 9.6,
        reasoning_notes: [
          'Aggressive bank impersonation detected',
          'Direct OTP extraction command identified',
          'Extreme urgency threshold triggered',
        ],
      },
      rule_analysis: {
        rules_triggered: ['RULE_OTP_DEMAND_DETECTED', 'RULE_BANK_IMPERSONATION', 'RULE_URGENCY_THREAT'],
        critical_flags: true,
      },
    };
  }

  if (sampleType === 'courier_threat_scam') {
    return {
      success: true,
      transcription: {
        success: true,
        provider: 'Gnani',
        transcript:
          'Greetings, this is FedEx Customs Express. A package sent in your name containing 5 passports and illegal contraband was seized at Mumbai airport. A CBI warrant has been issued against your Aadhaar number. Transfer a security deposit of 25,000 rupees via UPI to this clearing account immediately to cancel the arrest warrant. You are under digital arrest; stay on this line.',
        request_id: 'gnani-req-739112',
        language_code: 'en-IN',
      },
      scam_analysis: {
        risk_level: 'HIGH',
        is_scam_likely: true,
        detected_tactics: [
          'Digital Arrest / Law Enforcement Extortion',
          'UPI Payment Pressure',
          'Courier / Customs Impersonation',
          'Threat of arrest warrant',
          'Coercive isolation (Stay on the line)',
        ],
        evidence: [
          'Transfer a security deposit of 25,000 rupees via UPI',
          'CBI warrant has been issued against your Aadhaar',
          'You are under digital arrest; stay on this line',
        ],
        recommended_action:
          'HANG UP NOW. There is NO legal provision for "digital arrest" in India. Law enforcement, customs, and police NEVER conduct arrests or demand money via video or phone calls. Block the number and dial 1930.',
        explanation:
          'Classic courier digital arrest scam. The caller manufactures legal panic by claiming a contraband parcel was seized, fabricates a CBI arrest warrant, and attempts to extort an instant UPI fund transfer under duress.',
      },
      translated_warning:
        'सावधान: "डिजिटल अरेस्ट" नाम की कोई कानूनी व्यवस्था नहीं है। यह गंभीर ब्लैकमेल और ठगी है। कोई पैसा या यूपीआई ट्रांसफर न करें। तुरंत कॉल काटें।',
      target_language: targetLanguage,
      ai_analysis: {
        confidence_score: 0.99,
        sentiment: 'Extortion / Authoritarian Panic',
        coercion_score: 9.8,
      },
      rule_analysis: {
        rules_triggered: ['RULE_DIGITAL_ARREST_EXTORTION', 'RULE_UPI_DEMAND', 'RULE_LEGAL_THREAT'],
        critical_flags: true,
      },
    };
  }

  // Safe sample
  return {
    success: true,
    transcription: {
      success: true,
      provider: 'Gnani',
      transcript:
        'Hello Mr. Sharma, this is Priya calling from City Apollo Clinic to confirm your routine health checkup scheduled for tomorrow at 10:30 AM with Dr. Verma. Please remember to fast for 8 hours prior to the blood test. No advance payment is needed; you may pay at the hospital reception when you arrive. Have a wonderful day!',
      request_id: 'gnani-req-412891',
      language_code: 'en-IN',
    },
    scam_analysis: {
      risk_level: 'LOW',
      is_scam_likely: false,
      detected_tactics: [],
      evidence: [],
      recommended_action:
        'Safe conversational behavior. No sensitive credentials requested, no artificial urgency, and standard clinic appointment confirmation protocol followed.',
      explanation:
        'The call follows normal healthcare appointment confirmation etiquette. No OTPs, passwords, bank details, or urgent money transfers were requested.',
    },
    translated_warning:
      'यह बातचीत सुरक्षित प्रतीत होती है। डॉक्टर की अपॉइंटमेंट की सामान्य पुष्टि है। कोई व्यक्तिगत गोपनीय जानकारी नहीं मांगी गई।',
    target_language: targetLanguage,
    ai_analysis: {
      confidence_score: 0.95,
      sentiment: 'Polite / Professional Confirmation',
      coercion_score: 0.2,
    },
    rule_analysis: {
      rules_triggered: [],
      critical_flags: false,
    },
  };
}
