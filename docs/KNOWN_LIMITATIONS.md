# Known Limitations and Roadmap

## Current limitations

- The rules are hand-authored deterministic patterns. The current pilot still misses three courier/customs scam examples in its grouped held-out partition. Transcription errors, paraphrases, sarcasm, code-switching, speaker ambiguity, and unfamiliar phrasing can cause misses or false alerts.
- Risk bands are heuristic, not calibrated probabilities. The 220-record synthetic text pilot reports high performance on authored templates, including 100% development performance; it is not blind or independent external validation and must not be used as a real-world accuracy claim.
- The grouped partition contains seven scenario families and only 44 records. Record-level confidence intervals do not account for dependence among templated examples. Category counts are eight each; courier/customs warning recall is 62.5% (5/8).
- “Uncertain” is a cautious signal for single indicators, empty input, provider failure, or substantial AI/rules disagreement; it does not resolve all contradictory statements or reliably attribute who said what.
- The backend reports credential configuration, not actual provider health. A successful health response does not prove that analysis integrations are reachable.
- Cohere failure falls back to deterministic rules and marks the result incomplete. Gnani transcription failure still prevents transcript-based analysis.
- Translation and spoken output are optional. If they fail, screen guidance remains available in English; generated speech currently uses a shared local output path without an expiry lifecycle.
- User history and family contact details are stored in browser localStorage. Trusted-contact delivery is not implemented.
- Diagnostic/sample results are prewritten demonstrations and are not analysis of supplied audio.
- Deployment-specific TLS, CORS, edge rate limits, logging, retention, and external provider data handling need operator verification. Upload MIME/signature checks reduce simple spoofing but do not establish media safety.

## Roadmap

1. Obtain a larger independent, consented/licensed evaluation corpus with natural speech, ASR noise, and unseen scenario families before making live-safety claims.
2. Measure false positives and false negatives across English, Hindi, and Hinglish; add adversarial and transcription-noise cases.
3. Expand typed API response contracts, safe provider status reporting, and evidence consistency checks.
4. Usability-test the family-friendly English/Hindi explanation and its preview/copy controls before any real delivery integration.
5. Add short-lived generated audio, distributed rate limiting, and hosting-specific deployment validation.
6. Conduct accessibility and mobile PWA checks with real device/browser testing.
