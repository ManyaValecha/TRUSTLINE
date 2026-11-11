import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-side initialization of GoogleGenAI with mandatory telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface GroundedHeadline {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  category: 'Digital Arrest' | 'Bank KYC' | 'Courier Impersonation' | 'Emergency Fraud' | 'General Alert';
  severity: 'HIGH' | 'MEDIUM' | 'CRITICAL';
  preventionTip: string;
  url?: string;
}

// Fallback verified headlines from national cyber crime advisories (RBI, CERT-In, FTC)
const FALLBACK_HEADLINES: GroundedHeadline[] = [
  {
    id: 'h-1',
    title: 'Supreme Court & Police Issue National Advisory on "Digital Arrest" Phone Extortion',
    source: 'National Cyber Crime Reporting Portal (I4C)',
    date: 'Recent Alert',
    category: 'Digital Arrest',
    severity: 'CRITICAL',
    summary: 'Fraudsters impersonating police, CBI, or customs officials place video calls claiming illegal contraband was found under victim’s Aadhaar. Victims are coerced into staying on video for hours and transferring lakhs to "verification clearing accounts".',
    preventionTip: 'There is NO provision for "digital arrest" under Indian law. Police or courts never arrest people or demand security deposits over phone or video calls. Hang up and dial 1930.',
    url: 'https://cybercrime.gov.in',
  },
  {
    id: 'h-2',
    title: 'Surge in Telecom Deactivation Warnings & Urgent APK Downloads',
    source: 'Department of Telecommunications (DoT)',
    date: 'Recent Advisory',
    category: 'Bank KYC',
    severity: 'HIGH',
    summary: 'Automated voice calls warn that mobile numbers will be disconnected within 2 hours due to illegal activities. Callers pressure victims to install malicious APKs or share banking passwords to keep lines active.',
    preventionTip: 'DoT and TRAI never call subscribers threatening immediate disconnection. Never download unknown APK files received via WhatsApp or SMS.',
    url: 'https://sancharsaathi.gov.in',
  },
  {
    id: 'h-3',
    title: 'Courier Parcel Seizure Scam Targets Online Shoppers with Fake Customs Demands',
    source: 'Cyber Security Agency / CERT-In',
    date: 'Recent Warning',
    category: 'Courier Impersonation',
    severity: 'HIGH',
    summary: 'Scammers posing as international courier representatives claim packages contain confiscated narcotics or expired passports, intimidating victims into immediate UPI settlements to avoid criminal prosecution.',
    preventionTip: 'Authentic logistics companies like FedEx or BlueDart never call demanding personal UPI transfers to personal or clearing accounts.',
    url: 'https://www.cert-in.org.in',
  },
  {
    id: 'h-4',
    title: 'Family Distress & Fake Kidnapping Voice Scam Targeting Elderly Parents',
    source: 'Consumer Protection Advisory',
    date: 'Active Trend',
    category: 'Emergency Fraud',
    severity: 'CRITICAL',
    summary: 'Callers impersonate panicked children, police officers, or hospital doctors claiming an immediate emergency or arrest, ordering parents to rush UPI or cash transfers without verifying.',
    preventionTip: 'Always maintain a pre-agreed "Family Safe Word" with relatives. Hang up immediately and call back your relative on their known personal number.',
    url: 'https://cybercrime.gov.in',
  },
  {
    id: 'h-5',
    title: 'Bank KYC Expiry Panic: False 24-Hour Account Freeze Warnings',
    source: 'Reserve Bank of India (RBI Kehta Hai)',
    date: 'Ongoing Bulletin',
    category: 'Bank KYC',
    severity: 'HIGH',
    summary: 'Scammers send panic messages and voice prompts stating bank accounts or credit cards are frozen due to pending Re-KYC. Callers demand OTPs or net-banking PINs to "re-verify".',
    preventionTip: 'Banks NEVER ask for OTP, UPI PIN, CVV, or passwords over phone or SMS. Re-KYC is only performed at official branches or verified netbanking portals.',
    url: 'https://rbi.org.in',
  },
  {
    id: 'h-6',
    title: 'Remote Desktop App Takeovers: AnyDesk and TeamViewer Screen-Sharing Lures',
    source: 'Indian Cyber Crime Coordination Centre',
    date: 'Security Alert',
    category: 'General Alert',
    severity: 'HIGH',
    summary: 'Fraudsters masquerading as tech support or electricity bill clearance agents convince victims to install remote access applications, granting full control over banking apps.',
    preventionTip: 'Never install remote assistance applications (AnyDesk, QuickSupport, RustDesk) at the behest of an unknown phone caller.',
    url: 'https://cybercrime.gov.in',
  },
];


// Headline cache and Gemini quota cooldown
const HEADLINE_CACHE_TTL_MS = 15 * 60 * 1000;
const HEADLINE_QUOTA_COOLDOWN_MS = 10 * 60 * 1000;
const HEADLINE_ERROR_COOLDOWN_MS = 60 * 1000;

const headlineCache = new Map<
  string,
  { expiresAt: number; payload: Record<string, unknown> }
>();

let geminiCooldownUntil = 0;

// Endpoint: Fetch Google-grounded Voice Scam Headlines
app.get('/api/scam-headlines', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const cacheKey = query.toLowerCase() || '__default__';

  const fallbackResponse = (reason: string) => ({
    success: true,
    groundedWithGoogleSearch: false,
    liveSearchAvailable: false,
    dataMode: 'curated_fallback',
    cached: false,
    timestamp: Date.now(),
    searchSourcesCount: 0,
    groundingSources: [],
    error: reason,
    headlines: FALLBACK_HEADLINES,
  });

  try {
    // Reuse recent successful live results
    const cached = headlineCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({
        ...cached.payload,
        dataMode: 'live_search_cached',
        cached: true,
        timestamp: Date.now(),
      });
    }

    // Avoid repeatedly calling Gemini while quota is exhausted
    if (Date.now() < geminiCooldownUntil) {
      return res.json(
        fallbackResponse('Live search is temporarily paused. Showing curated safety advisories.')
      );
    }

    const searchQuery = query
      ? `Search for current voice scam news, phone fraud reports, and cyber warning headlines regarding: ${query}`
      : 'Search for recent voice scam headlines, phone fraud incidents, cyber crime police warnings, and digital arrest scam trends in India and globally. Focus on bank KYC fraud, digital arrest extortion, courier parcel fraud, and fake emergency calls.';

    const systemInstruction = `You are a cybersecurity news summarizer for TRUSTLINE.
Use Google Search to find recent authentic voice scam incidents, phone fraud alerts, and advisory trends.
Return a JSON array of up to 6 recent, distinct headlines. Each object must contain:
- "id": unique string
- "title": concise headline
- "source": publisher or agency
- "date": publication date or "Recent"
- "category": one of ["Digital Arrest", "Bank KYC", "Courier Impersonation", "Emergency Fraud", "General Alert"]
- "severity": one of ["HIGH", "MEDIUM", "CRITICAL"]
- "summary": 2-3 concise sentences
- "preventionTip": one actionable safety instruction
- "url": specific source URL when available
Return only a valid JSON array. Do not invent incidents, dates, publishers, or URLs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: searchQuery,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const searchUrls = Array.from(new Set(
      groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string | undefined): uri is string => Boolean(uri))
    ));

    let parsedHeadlines: GroundedHeadline[] = [];

    try {
      const cleanJson = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      const jsonStart = cleanJson.indexOf('[');
      const jsonEnd = cleanJson.lastIndexOf(']');

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const parsed: unknown = JSON.parse(
          cleanJson.substring(jsonStart, jsonEnd + 1)
        );

        if (Array.isArray(parsed)) {
          parsedHeadlines = parsed.filter((item: any) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.title === 'string' &&
            typeof item.source === 'string' &&
            typeof item.summary === 'string' &&
            typeof item.preventionTip === 'string' &&
            typeof item.url === 'string'
          ) as GroundedHeadline[];
        }
      }
    } catch (parseError) {
      console.warn('[TRUSTLINE] Could not parse Gemini headline response:', parseError);
    }

    // Only call results live and grounded when both structured headlines
    // and actual Google Search grounding sources are present.
    if (parsedHeadlines.length === 0 || searchUrls.length === 0) {
      return res.json(
        fallbackResponse('Live search did not return verifiable grounded headlines. Showing curated safety advisories.')
      );
    }

    const payload = {
      success: true,
      groundedWithGoogleSearch: true,
      liveSearchAvailable: true,
      dataMode: 'live_search',
      cached: false,
      timestamp: Date.now(),
      searchSourcesCount: searchUrls.length,
      groundingSources: searchUrls.slice(0, 5),
      headlines: parsedHeadlines.slice(0, 6),
    };

    headlineCache.set(cacheKey, {
      expiresAt: Date.now() + HEADLINE_CACHE_TTL_MS,
      payload,
    });

    return res.json(payload);

  } catch (err: unknown) {
    const errorStatus = Number((err as { status?: number })?.status ?? 0);
    const errorMessage = err instanceof Error ? err.message : String(err);

    geminiCooldownUntil =
      Date.now() +
      (errorStatus === 429
        ? HEADLINE_QUOTA_COOLDOWN_MS
        : HEADLINE_ERROR_COOLDOWN_MS);

    console.error(
      `[TRUSTLINE] Headline search unavailable (HTTP ${errorStatus || 'unknown'}):`,
      errorMessage
    );

    return res.json(
      fallbackResponse(
        errorStatus === 429
          ? 'Gemini quota reached. Live search is paused temporarily; showing curated safety advisories.'
          : 'Live search is temporarily unavailable; showing curated safety advisories.'
      )
    );
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRUSTLINE] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
