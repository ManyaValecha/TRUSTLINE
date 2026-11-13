# Privacy and Security Notes

## Data handled by the current application

- A recording selected for analysis is uploaded to the configured FastAPI backend. The backend forwards audio to Gnani for transcription.
- Transcript text is sent to Cohere for contextual analysis. Safety guidance is sent to Sarvam when translation is enabled; translated guidance may be sent to Gnani Timbre v3.0 for speech in one of ten supported language locales.
- The frontend stores profile, preferences, trusted-contact details, and up to 30 analysis records in browser localStorage. Records contain transcript/report data and may include inline speech audio. Anyone with access to that browser profile may be able to read them.
- The current analysis pipeline returns generated MP3 warning audio inline and does not write it to shared backend storage. Provider processing and hosting retention have not been independently verified.
- TRUSTLINE does not send contact invitations, family alerts, or police reports. Contact details remain in local browser state unless a user exports/shares something independently.

Provider retention, processing region, account settings, and hosting logs depend on external services/configuration and have not been verified here. Do not promise deletion from a provider or absolute privacy based only on this application code.

## Implemented safeguards

- Microphone recording requires an explicit consent checkbox and uses browser permission controls.
- Backend provider credentials are loaded from server-side environment variables; the committed frontend example contains only a local API URL.
- Uploads must declare an audio MIME type and cannot be empty. The backend cap is 20 MiB; the production frontend cap is 4 MiB for Vercel function compatibility.
- Cohere output is Pydantic-validated; evidence quotes not present in the transcript are rejected.
- Transcript content is delimited and described as untrusted data in the model prompt.
- Public API errors do not include provider exception text.
- Cohere and Sarvam requests have 30-second client timeouts; Gnani STT uses an HTTP client timeout.

## User controls and current gaps

Users can clear local analysis history and reset local application data in the app. Browser clearing is not a verified deletion mechanism for data already sent to external providers or stored by a deployment host. Server-side rate limiting, provider/hosting retention, and data handling in logs/backups still require operator review.

Keep API keys in backend environment variables only. Never use `VITE_` variables for provider secrets. Do not commit `.env` files or real recordings/transcripts.
