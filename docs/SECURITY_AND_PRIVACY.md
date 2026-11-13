# TRUSTLINE Security and Privacy

## Data flow

- A user-selected recording or explicitly consented browser recording is uploaded to the configured FastAPI backend.
- Audio is forwarded to Gnani for transcription. The resulting transcript is sent to Cohere for contextual analysis. Safety guidance may be sent to Sarvam for translation; translated guidance may be sent to Gnani Timbre v3.0 for speech in one of ten supported locales.
- The frontend stores profile preferences, trusted-contact fields, and up to 30 analysis records in browser `localStorage`. Records include transcript/report content and may include inline speech audio; anyone with access to that browser profile may be able to read them.
- The current analysis path returns generated speech inline and does not write it to shared backend storage. Provider and Vercel processing/log retention are external and have not been independently verified.
- TRUSTLINE does not send family notifications, police reports, or contact invitations. Family share text is copied only after the user chooses the copy button.

Provider retention, processing region, hosting logs, and server backups depend on external account and deployment configuration and have not been independently verified. This project does not claim zero retention or absolute privacy.

## Implemented safeguards

- Backend credentials are read from server environment variables; provider keys are not placed in `VITE_` frontend variables.
- The analysis endpoint accepts a fixed audio MIME allowlist and checks common WAV, MP3, Ogg, WebM, FLAC, and MP4/M4A signatures before forwarding bytes.
- Backend audio reads are bounded at 20 MiB; the production frontend applies a 4 MiB upload cap to fit the Vercel function request limit.
- Pydantic validates API and Cohere result shapes. Cohere evidence must match the transcript, which is treated as untrusted input in the model prompt.
- Public errors omit provider exception details. Cohere/Sarvam calls have timeouts and failures degrade to deterministic/on-screen guidance where supported.
- CORS origins are configurable through `TRUSTLINE_CORS_ORIGINS`; defaults are local development origins.
- Local history can be cleared from Settings. This only clears browser-local records; it cannot delete data already sent to providers or copied by a recipient.

## Deployment controls still required

- Configure HTTPS, trusted production CORS origins, request-body limits, and rate limiting at the hosting edge or API gateway. The application does not implement a distributed rate limiter; an in-process counter would not safely enforce limits across workers or replicas.
- Set provider keys through the host's secret manager, rotate credentials as needed, and prevent `.env` files and recordings/transcripts from entering Git or logs.
- Decide and verify retention for uploaded audio, browser-local reports/audio, application logs, provider processing, and backups.
- Apply least-privilege provider scopes, monitor provider usage, and test provider failure states without logging sensitive content.
- Review the deployment host's multipart/body buffering behavior. The route bounds its read, but an upstream proxy/server may buffer request bodies before application code runs.

## Threat and limitations notes

MIME and magic-byte checks reduce simple type spoofing but do not prove that a file is safe or decodable; provider parsers still process uploaded media. The current app has no malware scanning, distributed rate limit, authentication, or verified server retention policy. Do not expose it as a public production service until those controls are addressed.
