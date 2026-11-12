# Deployment Guide

## Current Vercel deployment

TRUSTLINE is deployed as two Vercel projects because the account's CLI project did not have the Services framework preset required for a single-project frontend/backend deployment.

| Service | Production URL | Status |
|---|---|---|
| React + Vite PWA | [trustline-teal.vercel.app](https://trustline-teal.vercel.app) | Deployed; root and deep-link routes return HTTP 200 |
| FastAPI API | [trustline-api-eight.vercel.app](https://trustline-api-eight.vercel.app) | Deployed; `/health` and `/api/scam-headlines` return HTTP 200 |

The frontend build uses `VITE_API_BASE_URL=https://trustline-api-eight.vercel.app`. The API's production CORS allowlist contains the exact frontend origin. Provider credentials are stored as sensitive Production environment variables in the API project; `/health` reports configuration presence only, not provider connectivity. A locally synthesized, non-personal audio probe completed in production through Gnani transcription, Cohere analysis, and Sarvam translation. This verifies one synthetic request, not real-call performance. Spoken warning audio remains unavailable because the optional Gnani TTS SDK is not installed. If the required speech credential is absent, `/api/analyze` returns HTTP 503 with an explicit explanation.

The Vercel deployment explicitly excludes `.env` files, local virtual environments, tests, and generated audio. Keep provider credentials in Vercel's backend project environment only; never put them in `VITE_` variables or frontend files.

Vercel Functions limit request bodies to 4.5 MB. The production frontend therefore limits source uploads to 4 MiB, leaving room for multipart overhead. Before upload, the browser normalizes audio to mono 16 kHz WAV for Gnani STT and rejects clips longer than 60 seconds. Local development retains the 20 MiB source upload limit.

## Deploying updates

From the repository root, deploy the API first, then the frontend so it uses the stable API URL:

```bash
vercel deploy --cwd backend --prod
vercel deploy --cwd frontend --prod \
  --build-env VITE_API_BASE_URL=https://trustline-api-eight.vercel.app
```

The API project has `TRUSTLINE_CORS_ORIGINS` set to `https://trustline-teal.vercel.app` for Production. Add any custom frontend domain to that comma-separated allowlist before using it.

## Production checks still required

- Recheck provider connectivity with consented test audio after provider or deployment changes. Health status only reports whether credentials are present.
- Review provider terms, retention, processing regions, Vercel logs, and deployment data retention before handling real recordings.
- Add server-side rate limiting and abuse controls. The current API does not provide distributed rate limiting.
- Test with consented audio before inviting users. The verified synthetic request does not establish real-call accuracy or production model metrics.
- Install and verify the optional Gnani TTS SDK if generated spoken warnings are required.
- The endpoint `/api/scam-headlines` currently returns clearly labeled curated educational examples; live Google-grounded news search is unavailable in this deployment.
- Verify audio-warning storage cleanup. Generated warning audio currently has no expiry lifecycle.

The deployments were made with the Vercel CLI. GitHub is not configured for automatic Vercel deployments in this setup.
