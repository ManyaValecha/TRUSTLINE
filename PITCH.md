# TRUSTLINE — 1-Page Solution Pitch

**India's first real-time voice scam guardian — in your language, spoken aloud.**

🚀 Live: https://trustline-teal.vercel.app | 💻 GitHub: https://github.com/ManyaValecha/TRUSTLINE

---

## The Problem
India loses **₹7,000+ crore every year** to voice scams. Victims are called by someone impersonating a bank officer, RBI, or police — speaking Hindi, Tamil, or Bengali — and pressured into sharing their OTP. Existing tools like Truecaller only check the caller's number. A scammer with a spoofed number or fresh SIM bypasses it entirely. **No Indian tool analyses what the caller is actually saying.**

## What TRUSTLINE Does
Upload a suspicious call recording. TRUSTLINE runs a 5-stage AI pipeline:

1. **Gnani Prisma v3 (STT)** — Transcribes audio across 10+ Indic languages including Hinglish, Tanglish, and Benglish code-mix profiles
2. **Cohere Command R+** — Detects behavioural coercion: OTP demands, false authority, deadline threats, secrecy commands
3. **Deterministic Rules Engine** — Keyword and pattern matching across common Indian scam scripts
4. **Sarvam Translation** — Translates the warning into the user's preferred language
5. **Gnani Timbre v3 (TTS)** — Speaks the alert aloud so low-literacy users can act without reading

## Why It's Different
| Truecaller / Spam ID | TRUSTLINE |
|---|---|
| "Is this number reported bad?" | "Is this caller **behaving** like a scammer?" |
| Blocked by SIM spoofing | Analyses spoken content |
| English UI only | 10+ Indic languages, warning spoken aloud |

## Award Alignment
- 🌐 **Main Character** — 10+ Indian languages, Odia as low-resource target
- ⚡ **Mixed Vibes** — Native Hinglish/Tanglish/Benglish clips with bilingual transcripts
- 🥷 **Solo Ninja** — Entire stack built and deployed solo (React + FastAPI + 4 AI providers)
- 🧠 **Jugaad Genius** — Repurposed STT (built for transcription) as a behavioural coercion detector

## Tech Stack
React/Vite · FastAPI · Gnani Prisma v3 · Gnani Timbre v3 · Cohere · Sarvam · Vercel

---
*Built solo by Manya Valecha for the Great Indian AI Internship Challenge — Gnani.ai*
