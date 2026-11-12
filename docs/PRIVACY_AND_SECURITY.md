# Privacy and Security Notes

## Data handled by the current application

- A recording selected for analysis is uploaded to the configured FastAPI backend. The backend forwards audio to Gnani for transcription.
- Transcript text is sent to Cohere for contextual analysis. The final safety guidance is sent to Sarvam when translation is enabled.
- The frontend stores profile, preferences, trusted-contact details, and up to 30 analysis records in browser localStorage. Analysis records contain the transcript and report. Anyone with access to that browser profile may be able to read them.
- Gnani Timbre may generate warning audio at `backend/storage/audio/trustline_warning.wav`; that file can remain on the backend filesystem. There is no verified automatic deletion or configurable retention policy in this version.
- TRUSTLINE does not send contact invitations, family alerts, or police reports. Contact details remain in local browser state unless a user exports/shares something independently.

Provider retention, processing region, account settings, and hosting logs depend on external services/configuration and have not been verified here. Do not promise deletion from a provider or absolute privacy based only on this application code.

## Implemented safeguards

- Microphone recording requires an explicit consent checkbox and uses browser permission controls.
- Backend provider credentials are loaded from server-side environment variables; the committed frontend example contains only a local API URL.
- Uploads must declare an audio MIME type, cannot be empty, and are capped at 20 MiB. The frontend uses the same cap.
- Cohere output is Pydantic-validated; evidence quotes not present in the transcript are rejected.
- Transcript content is delimited and described as untrusted data in the model prompt.
- Public API errors do not include provider exception text.
- Cohere and Sarvam requests have 30-second client timeouts; Gnani STT uses an HTTP client timeout.

## User controls and current gaps

Users can clear local analysis history and reset local application data in the app. Browser clearing is not a verified deletion mechanism for data already sent to external providers or stored by a deployment host. The generated warning audio currently has no implemented expiry/deletion lifecycle. Server-side rate limiting, production HTTPS, deployment CORS values, and hosting request-body limits must be configured and verified by the operator before public deployment.

Keep API keys in backend environment variables only. Never use `VITE_` variables for provider secrets. Do not commit `.env` files or real recordings/transcripts.
