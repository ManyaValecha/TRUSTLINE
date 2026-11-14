# TRUSTLINE — Voice Scam Intelligence for India

> **Live Demo → [trustline-teal.vercel.app](https://trustline-teal.vercel.app)**
> Built solo for the [Great Indian AI Internship Challenge](https://www.gnani.ai/internship) by Gnani.ai

---

## 🏆 Award Targets

| Award | Category | How TRUSTLINE qualifies |
|---|---|---|
| 🌐 **Main Character Award** | #01 · Regional / Low-Resource Indian Language | 10+ Indic locales (Prisma v3), Odia (`or-IN`) added as a deliberately low-resource target |
| ⚡ **Mixed Vibes Award** | #02 · Code-Mixed Voice Experience | Hinglish, Tanglish & Benglish synthetic scam clips with dedicated STT profiles, bilingual transcripts, and 3 acoustic stress variants each |
| 🥷 **Solo Ninja Award** | #07 · Best Solo Project | Entire stack conceived, designed, coded, and deployed by one person: React/Vite + FastAPI + 4 AI providers |
| 🧠 **Jugaad Genius Award** | #06 · Most Creative Use of Gnani AI | Repurposes STT (built for transcription) as a **real-time behavioural coercion detector** — an unexpected safety-first pivot |

---

## What it does

TRUSTLINE is an end-to-end voice scam detection system for India. Upload a suspicious call recording (or record live), choose your language profile, and TRUSTLINE will:

1. **Transcribe** the audio with Gnani Prisma v3 (supports auto-detect + 10 Indic locales + Hinglish / Tanglish / Benglish code-mix profiles)
2. **Detect behavioural coercion** with Cohere — OTP demands, urgency framing, false authority, secrecy commands
3. **Apply deterministic rules** — keyword triggers and pattern matching for common Indian scam scripts
4. **Synthesize a risk verdict** (LOW / MEDIUM / HIGH / CRITICAL) with evidence signals
5. **Translate the warning** into the user's preferred language via Sarvam
6. **Speak the alert** aloud using Gnani Timbre v3 TTS so even low-literacy users can act

---

## Mixed Vibes: Code-Mixed Demo Clips

Three fictional Gnani-generated recordings of **the same OTP-demand bank-impersonation scam** rendered in India's three most common code-switched speech patterns:

| Variant | STT Profile | Native Script |
|---|---|---|
| 🇮🇳 Hinglish | `hi-en` | Hindi words + English banking terms |
| 🌊 Tanglish | `ta-en` | Tamil script + English banking terms |
| 🌸 Benglish | `bn-en` | Bengali script + English banking terms |

Each clip ships with **three acoustic stress variants** to demonstrate real-world telephony robustness:
- 📞 8 kHz telephony + 10 dB white noise
- 🔇 Low-level recording (−24 dB)
- 📱 Compressed MP3 (8 kHz / 16 kbps)

---

## Architecture

```
┌────────────────────────────────────┐
│          React / Vite Frontend      │
│  LandingPage · Dashboard · HowItWorks│
│  SignatureDemo (3 code-mix clips)   │
└────────────────┬───────────────────┘
                 │  POST /api/analyze (FormData)
                 ▼
┌────────────────────────────────────┐
│          FastAPI Backend            │
│                                    │
│  ① Gnani Prisma v3 (STT)           │
│     indic-auto / hi-en / ta-en     │
│     bn-en / or-IN + 9 other locales│
│                                    │
│  ② Cohere Command R+               │
│     Behavioural coercion analysis  │
│     Evidence extraction            │
│                                    │
│  ③ Deterministic Rules Engine      │
│     OTP keywords, deadline threats │
│     impersonation patterns         │
│                                    │
│  ④ Sarvam Translation              │
│     Warning → 10 Indic languages   │
│                                    │
│  ⑤ Gnani Timbre v3 (TTS)          │
│     Spoken warning in target lang  │
└────────────────────────────────────┘
```

---

## Solo Build — Full Stack Owned

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.11+), httpx, pydantic |
| STT | Gnani Prisma v3 — `api.vachana.ai/stt/v3` |
| TTS | Gnani Timbre v3 |
| Analysis | Cohere Command R+ |
| Translation | Sarvam API |
| Deployment | Vercel (frontend) + API keys wired via env vars |

No team. No boilerplate starter kit. Every component from scratch.

---

## Jugaad: The Creative Pivot

> STT is for transcription. TRUSTLINE uses it as a **scam DNA extractor**.

The model hears "OTP", "police case", "account block" across Hindi, Tamil, Bengali — and TRUSTLINE maps those signals to a behavioural coercion taxonomy, not just a word list. The Jugaad is the **combination of Gnani STT → evidence signals → risk synthesis → TTS spoken alert** in a single pipeline that no existing Indian consumer app offers.

---

## Supported Languages

| Language | Speech (Gnani STT) | Translation target (Sarvam) |
|---|---|---|
| Hindi | `hi-IN` / `hi-en` Hinglish | ✅ |
| Tamil | `ta-IN` / `ta-en` Tanglish | ✅ |
| Bengali | `bn-IN` / `bn-en` Benglish | ✅ |
| Telugu | `te-IN` | ✅ |
| Marathi | `mr-IN` | ✅ |
| Kannada | `kn-IN` | ✅ |
| Malayalam | `ml-IN` | ✅ |
| Gujarati | `gu-IN` | ✅ |
| Punjabi | `pa-IN` | ✅ |
| **Odia** ⭐ | `or-IN` (low-resource) | ✅ |
| English (India) | `en-IN` | ✅ |

---

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # add GNANI_API_KEY_ID, COHERE_API_KEY, SARVAM_API_KEY
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

**Production**: [https://trustline-teal.vercel.app](https://trustline-teal.vercel.app) — API keys live in Vercel environment variables.

---

## Why it matters

India loses **₹7,000 crore+ per year** to voice scams. The targets are often elderly, rural, and multilingual — the exact population for whom English-only cybersecurity tools fail. TRUSTLINE meets them in their own language and speaks the warning aloud.

---

*Built with ❤️ for the Great Indian AI Internship Challenge 2024 — Gnani.ai*
