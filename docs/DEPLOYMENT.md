# Deployment Guide

## Current Vercel deployment

TRUSTLINE is deployed as two Vercel projects because the account's CLI project did not have the Services framework preset required for a single-project frontend/backend deployment.

| Service | Production URL | Status |
|---|---|---|
| React + Vite PWA | [trustline-teal.vercel.app](https://trustline-teal.vercel.app) | Deployed; root and deep-link routes return HTTP 200 |
| FastAPI API | [trustline-api-eight.vercel.app](https://trustline-api-eight.vercel.app) | Deployed; `/health` and `/api/scam-headlines` return HTTP 200 |

The frontend build uses `VITE_API_BASE_URL=https://trustline-api-eight.vercel.app`. The API's production CORS allowlist contains the exact frontend origin. The public `/health` response currently reports no provider credentials configured. When the required speech provider is absent, `/api/analyze` returns HTTP 503 with an explicit explanation. Provider-backed audio analysis, translation, and speech generation have not been verified in production.

The Vercel deployment explicitly excludes `.env` files, local virtual environments, tests, and generated audio. Keep provider credentials in Vercel's backend project environment only; never put them in `VITE_` variables or frontend files.

Vercel Functions limit request bodies to 4.5 MB. The production frontend therefore limits audio uploads to 4 MiB, leaving room for multipart overhead. Local development retains the 20 MiB limit.

## Deploying updates

From the repository root, deploy the API first, then the frontend so it uses the stable API URL:

```bash
vercel deploy --cwd backend --prod
vercel deploy --cwd frontend --prod \
  --build-env VITE_API_BASE_URL=https://trustline-api-eight.vercel.app
```

The API project has `TRUSTLINE_CORS_ORIGINS` set to `https://trustline-teal.vercel.app` for Production. Add any custom frontend domain to that comma-separated allowlist before using it.

## Production checks still required

- Add provider credentials through the Vercel backend project's protected environment settings if provider-backed analysis is intended; then verify provider connectivity using consented test audio.
- Review provider terms, retention, processing regions, Vercel logs, and deployment data retention before handling real recordings.
- Add server-side rate limiting and abuse controls. The current API does not provide distributed rate limiting.
- Test audio upload and analysis end to end only after credentials are intentionally configured. No real-call accuracy or production model metrics are claimed.
- The endpoint `/api/scam-headlines` currently returns clearly labeled curated educational examples; live Google-grounded news search is unavailable in this deployment.
- Verify audio-warning storage cleanup. Generated warning audio currently has no expiry lifecycle.

The deployments were made with the Vercel CLI. GitHub is not configured for automatic Vercel deployments in this setup.
