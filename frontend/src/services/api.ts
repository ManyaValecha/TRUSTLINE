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
 * Demo simulator: returns prewritten scenario content without audio or provider calls.
 */
export async function simulateAnalysis(
  sampleType: 'digital_arrest_scam' | 'legitimate_bank_call' | 'family_emergency_scam',
  targetLanguage = 'hi-IN'
): Promise<AnalyzeAudioResponse> {
  // Simulate honest multi-step latency
  await new Promise((resolve) => setTimeout(resolve, 2400));

  if (sampleType === 'digital_arrest_scam') {
    return {
      success: true,
      simulation: true,
      transcription: {
        success: true,
        provider: 'Simulation',
        transcript:
          'Hello, this is Inspector Rajesh Sharma calling urgently from State Bank Fraud Department. Your debit card and net banking are immediately suspended due to unverified KYC documents. Within 10 minutes, all your funds will be frozen. To prevent permanent deactivation, open your phone immediately and give me the 6-digit OTP code received on SMS right now. Do not inform anyone as this is an active police case.',
        request_id: 'DEMO-SAMPLE',
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
      translated_warning: targetLanguage === 'hi-IN'
        ? 'चेतावनी: यह बैंक धोखाधड़ी की कोशिश हो सकती है। अपना ओटीपी साझा न करें, कॉल काटें और बैंक से आधिकारिक नंबर पर संपर्क करें.'
        : 'Warning: this may be an attempt to defraud you. Do not share your OTP. End the call and contact your bank through its official number.',
      translated_warning_language: targetLanguage === 'hi-IN' ? 'hi-IN' : 'en-IN',
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

  if (sampleType === 'legitimate_bank_call') {
    return {
      success: true,
      simulation: true,
      transcription: {
        success: true,
        provider: 'Simulation',
        transcript:
          'Hello, I am calling from your bank security team. We will never ask you to share an OTP, UPI PIN, or password on a call. Please end this call and use the official number printed on your card if you need help. No payment is due.',
        request_id: 'DEMO-SAMPLE',
        language_code: 'en-IN',
      },
      scam_analysis: {
        risk_level: 'LOW',
        is_scam_likely: false,
        detected_tactics: [
          'Protective credential warning',
          'Independent verification guidance',
        ],
        evidence: [],
        recommended_action:
          'No major warning indicators were found in this sample. Never share an OTP or PIN on a call; verify unexpected requests using the official number on your card.',
        explanation:
          'This simulated bank-security call warns the listener not to disclose credentials and directs them to an independently verifiable contact number.',
      },
      translated_warning: targetLanguage === 'hi-IN'
        ? 'कॉल पर ओटीपी या पिन साझा न करें। जरूरत हो तो कार्ड पर दिए गए आधिकारिक नंबर से बैंक से संपर्क करें।'
        : 'Do not share an OTP or PIN on a call. If needed, contact your bank using the official number printed on your card.',
      translated_warning_language: targetLanguage === 'hi-IN' ? 'hi-IN' : 'en-IN',
      target_language: targetLanguage,
      ai_analysis: {
        confidence_score: 0.99,
        sentiment: 'Extortion / Authoritarian Panic',
        coercion_score: 9.8,
      },
      rule_analysis: {
        rules_triggered: ['RULE_PROTECTIVE_OTP_WARNING', 'RULE_INDEPENDENT_VERIFICATION'],
        critical_flags: false,
      },
    };
  }

  // Family-emergency impersonation simulation
  return {
    success: true,
    simulation: true,
    transcription: {
      success: true,
      provider: 'Simulation',
      transcript:
        'Your son has been detained after an accident. Send 25,000 rupees to this UPI account right now so we can release him. Do not call him or anyone else; there is no time to check.',
      request_id: 'DEMO-SAMPLE',
      language_code: 'en-IN',
    },
    scam_analysis: {
      risk_level: 'HIGH',
      is_scam_likely: true,
      detected_tactics: ['Family emergency impersonation', 'Urgent payment pressure', 'Isolation to prevent verification'],
      evidence: ['Send 25,000 rupees to this UPI account right now', 'Do not call him or anyone else; there is no time to check'],
      recommended_action:
        'Stop and verify the emergency by calling your relative or another trusted person on a number you already know. Do not send money based only on this call.',
      explanation:
        'The caller claims a family emergency, demands an urgent transfer, and discourages independent verification. These are warning indicators, but the example is simulated and not proof of a real incident.',
    },
    translated_warning: targetLanguage === 'hi-IN'
      ? 'रुकें और पहले से भरोसेमंद नंबर पर अपने परिवार से संपर्क करके स्थिति जांचें। केवल इस कॉल के आधार पर पैसे न भेजें।'
      : 'Pause and contact your family using a number you already trust. Do not send money based only on this call.',
    translated_warning_language: targetLanguage === 'hi-IN' ? 'hi-IN' : 'en-IN',
    target_language: targetLanguage,
    ai_analysis: {
      confidence_score: 0.95,
      sentiment: 'Urgent / Coercive',
      coercion_score: 8,
    },
    rule_analysis: {
      rules_triggered: [],
      critical_flags: false,
    },
  };
}
