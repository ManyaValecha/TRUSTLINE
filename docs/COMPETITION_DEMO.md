# Competition Demo and Pitch Notes

The detailed presentation materials are in [90-second demo script](DEMO_SCRIPT.md) and [10-slide pitch outline](PITCH_DECK_OUTLINE.md). All three built-in examples are prewritten simulations; selecting them does not upload audio or contact providers.

## Judge / interview Q&A

**Does TRUSTLINE detect deepfake voices?** No. It analyzes transcript behavior, not voice authenticity.

**Does it monitor ordinary cellular calls?** No. The app only analyzes audio a user explicitly submits.

**How accurate is it?** The current rules-only authored text pilot reports 97.5% overall recall and 100% Hindi recall, but only 87.5% recall on a 44-record grouped re-partition; three held-out courier/customs examples are missed. The development split reaches 100%, which indicates template fit. These are not real-world estimates. AI-only, hybrid, and full audio metrics are unavailable. See the generated evaluation report and limitations before making claims.

**Why combine rules and an LLM?** Rules make selected behaviors explicit; contextual analysis may interpret language. Model evidence is schema-validated and must match the transcript. Both can fail.

**What happens if Cohere is unavailable?** The pipeline falls back to deterministic rules and marks contextual analysis incomplete. Translation and speech failures leave on-screen guidance.

**Is LOW proof the call is safe?** No. It means the implemented checks found no major indicators.

**Does the app alert family or report scams?** No. Contacts remain local; family text can be copied after a user action. No notification or police-report service is connected.

**What happens to audio and transcripts?** Audio is sent through the backend to Gnani; transcript text to Cohere; safety guidance may go to Sarvam; Hindi voice generation may use Gnani Timbre. Reports are stored in browser localStorage, and generated speech can persist on backend disk. Provider and hosting retention require separate verification.
