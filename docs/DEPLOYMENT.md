# Deployment Guide

## Current Vercel deployment

TRUSTLINE is deployed as two Vercel projects because the account's CLI project did not have the Services framework preset required for a single-project frontend/backend deployment.

| Service | Production URL | Status |
|---|---|---|
| React + Vite PWA | [trustline-teal.vercel.app](https://trustline-teal.vercel.app) | Deployed; root and deep-link routes return HTTP 200 |
| FastAPI API | [trustline-api-eight.vercel.app](https://trustline-api-eight.vercel.app) | Deployed; `/health` and `/api/scam-headlines` return HTTP 200 |

On 2026-11-13, both projects were redeployed from the updated checkout. The API now includes the declared Gnani SDK, Timbre v3.0 multilingual output, compressed inline speech payloads, and regional script OTP rules. A production request using the synthetic 8 kHz Benglish sample completed transcription, Cohere analysis, Sarvam translation, and Gnani speech generation. This verifies an integration path on one generated sample, not real-call robustness or accuracy.

The frontend build uses `VITE_API_BASE_URL=https://trustline-api-eight.vercel.app`. The API's production CORS allowlist contains the exact frontend origin. Provider credentials are stored as sensitive Production environment variables in the API project; `/health` reports configuration presence only, not provider connectivity.

Latest production deployments on 2026-11-13: API `dpl_EGtUAZiAAQdEctt86yeEgcoCosbZ`, frontend `dpl_H9cmocZg2qgXfoRnuKp428ZC9hfL`.

The Vercel deployment explicitly excludes `.env` files, local virtual environments, tests, and generated audio. The repository-level and per-project ignore rules are part of that protection and must remain in place. Keep provider credentials in Vercel's backend project environment only; never put them in `VITE_` variables or frontend files.

Vercel Functions limit request bodies to 4.5 MB. The production frontend therefore limits source uploads to 4 MiB, leaving room for multipart overhead. The browser checks duration and rejects clips longer than 30 seconds (the Prisma v3 REST limit). It preserves supported WAV, MP3, FLAC, OGG, and M4A inputs to avoid changing the original sampling or codec; unsupported browser recordings are converted to mono 16 kHz WAV before upload. Local development retains the 20 MiB source upload limit.

## Deploying updates

From the repository root, deploy the API first, then the frontend so it uses the stable API URL:

```bash
vercel deploy --cwd backend --prod
vercel deploy --cwd frontend --prod \
  --build-env VITE_API_BASE_URL=https://trustline-api-eight.vercel.app
```

The API project has `TRUSTLINE_CORS_ORIGINS` set to `https://trustline-teal.vercel.app` for Production. Add any custom frontend domain to that comma-separated allowlist before using it.

## Production checks still required

- Repeat provider checks with consented, representative audio after provider or deployment changes. The current verified sample is generated speech and does not represent real callers.
- Review provider terms, retention, processing regions, Vercel logs, and deployment data retention before handling real recordings.
- Add server-side rate limiting and abuse controls. The current API does not provide distributed rate limiting.
- Test with consented audio before inviting users. The verified synthetic request does not establish real-call accuracy or production model metrics.
- The endpoint `/api/scam-headlines` currently returns clearly labeled curated educational examples; live Google-grounded news search is unavailable in this deployment.
- The analysis response contains a compressed inline audio payload; include this in browser-local report retention and provider-data reviews.

The deployments were made with the Vercel CLI. GitHub is not configured for automatic Vercel deployments in this setup.
