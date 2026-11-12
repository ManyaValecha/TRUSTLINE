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

// Curated educational examples shown when live grounded search is unavailable; not current news.
const FALLBACK_HEADLINES: GroundedHeadline[] = [
  {
    id: 'example-digital-arrest',
    title: 'Example pattern: fake authority and digital-arrest threats',
    source: 'TRUSTLINE educational example (not a news report)',
    date: 'Illustrative example',
    category: 'Digital Arrest',
    severity: 'HIGH',
    summary: 'A caller may impersonate an official, use threats, and demand urgent payment. This is a generic example, not a report of a recent incident.',
    preventionTip: 'Pause, end the call, and independently verify through an official number you already trust.',
  },
  {
    id: 'example-bank-kyc',
    title: 'Example pattern: bank KYC urgency and credential requests',
    source: 'TRUSTLINE educational example (not a news report)',
    date: 'Illustrative example',
    category: 'Bank KYC',
    severity: 'HIGH',
    summary: 'A caller may claim an account will be frozen and ask for an OTP, PIN, or password. This is a generic example, not a current bulletin.',
    preventionTip: 'Never disclose an OTP or PIN on a call. Contact the bank using a number from its official materials.',
  },
  {
    id: 'example-courier',
    title: 'Example pattern: courier or customs payment demand',
    source: 'TRUSTLINE educational example (not a news report)',
    date: 'Illustrative example',
    category: 'Courier Impersonation',
    severity: 'MEDIUM',
    summary: 'A caller may claim a parcel is seized and request a fee to avoid consequences. This example is illustrative and does not describe a verified case.',
    preventionTip: 'Do not transfer money under pressure. Contact the courier using its published official channel.',
  },
  {
    id: 'example-family-emergency',
    title: 'Example pattern: family emergency and isolation pressure',
    source: 'TRUSTLINE educational example (not a news report)',
    date: 'Illustrative example',
    category: 'Emergency Fraud',
    severity: 'HIGH',
    summary: 'A caller may claim a loved one is in danger, demand immediate payment, and discourage verification. This is a generic example, not a real incident report.',
    preventionTip: 'Call your relative directly using a number you already trust before sending money.',
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
