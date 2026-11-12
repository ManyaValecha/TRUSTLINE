# Deployment Guide

TRUSTLINE uses separate Vite static frontend and FastAPI backend processes. This guide prepares a deployment; no hosting account or infrastructure has been configured or changed.

## Backend

1. Deploy `backend/` using Python 3.10+ and install `backend/requirements.txt`.
2. Set server-side environment variables: `GNANI_API_KEY_ID`, `COHERE_API_KEY`, and `SARVAM_API_KEY` as needed. Never expose these through `VITE_` variables.
3. Set `TRUSTLINE_CORS_ORIGINS` to a comma-separated list of exact HTTPS frontend origins.
4. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from `backend/` (adjust `$PORT` for the host's process convention).
5. Configure the host's request-body limit to at least the desired audio limit plus multipart overhead, and its timeout for the transcription workflow.
6. Confirm `/health` returns. It reports process health and credential presence, not external provider connectivity.

## Frontend

1. Set `VITE_API_BASE_URL` to the HTTPS backend origin at build time.
2. From `frontend/`, install locked dependencies with `npm ci` and run `npm run build`.
3. Publish the generated `frontend/dist/` directory on a static HTTPS host.
4. Confirm the deployed frontend can load the PWA manifest/service worker and can call the backend without a CORS error.

## Before public deployment

- Verify HTTPS, exact CORS origins, provider credentials, provider agreements/retention, and host logs.
- Add edge/API rate limiting and verify multipart body limits at the host. No distributed application-level rate limiter is implemented.
- Decide retention and secure deletion for local warning audio and browser history; the current backend warning file has no expiry lifecycle.
- Test actual provider credentials and supported audio formats in a private staging environment. Those integration tests can send sensitive audio/transcripts to providers and should use consented test data.
- Do not claim offline AI analysis. The service worker caches the application shell only; server analysis needs an online backend and provider access.
