# TRUSTLINE Competition Readiness Audit

**Verified on:** 2026-11-11<br>
**Checkout:** `/Users/manyavalecha/Trustline/trustline-app`<br>
**Repository:** `https://github.com/ManyaValecha/TRUSTLINE`<br>
**Revision:** `aaa1fd2` (`main`, `origin/main`)

## Repository verification and status

- Confirmed the Git remote is `https://github.com/ManyaValecha/TRUSTLINE.git`.
- Local `main` and `origin/main` both point to `aaa1fd2` (`Improve TRUSTLINE frontend performance and API reliability`).
- Working tree was clean at the start of this audit.
- Repository has `README.md`, a React/TypeScript/Vite PWA under `frontend/`, and a FastAPI/Python backend under `backend/`.
- No `AGENTS.md` or existing in-repository competition readiness audit was present.
- The prior audit in the task outputs folder was not treated as source evidence.

## Implemented features verified from code

- Audio file upload and browser microphone recording with explicit UI consent.
- Backend `/health`, `/api/analyze`, and warning audio endpoints.
- Integrations for Gnani transcription and speech, Cohere analysis, and Sarvam translation.
- Rule-based signals for OTP/UPI PIN requests, payment pressure, threats, secrecy, and remote access.
- A combined LOW/MEDIUM/HIGH result, frontend analysis report, local settings/history, family-contact configuration preview, and PWA build configuration.
- Frontend routes are lazy-loaded and the frontend TypeScript check succeeds.

The README describes the intended pipeline; provider calls were not exercised during this audit, so live integration health is unverified.

## Incomplete or missing features

- Detection rules are a small keyword-pattern set; evidence is unstructured strings, context checks are limited to a short preceding window, and there is no explicit uncertainty state or calibrated scoring definition.
- Cohere output is parsed as JSON but not validated against a typed application schema or checked to ensure quotations occur in the transcript.
- At baseline, existing backend “tests” were manual scripts; no benchmark runner or evaluation page was present. (The later implementation pass adds an offline synthetic pilot and software tests; see the latest status below.)
- Family contacts are saved locally; no consent-based alert preview/sharing flow or real notification service is implemented. The UI calls automated alerts a future feature, but some descriptions still imply upcoming delivery.
- Frontend history persists full analysis responses in localStorage; retention and deletion behavior need clear user-facing documentation.
- API error responses may include exception/provider details. Health output lists providers without checking configuration or availability.
- Backend accepts only the declared audio MIME prefix, has a 20 MB limit while the frontend allows 25 MB, and currently reads the whole upload before checking size.
- Frontend simulator returns invented sample analyses and should be clearly labeled as simulated wherever used.
- Separate architecture, detection, evaluation, limitations, deployment, and demo documentation were missing at baseline; the implementation passes added these documents, with remaining gaps listed below.

## Bugs and risks observed

- Rule false-positive risk: a short preceding-word check can miss protective phrasing and does not distinguish educational/scam-discussion text from an active request.
- Potential false reassurance: LOW is rendered as “Conversation Safe” even though the README correctly says a low-risk result does not guarantee safety.
- The async analysis route calls synchronous Cohere/translation/TTS functions, which can block the event loop.
- All analysis failures become HTTP 502 with the raw exception message in `detail`.
- Warning speech is written to a shared persistent path; concurrent requests can overwrite it, and prior generated audio can remain available.
- The current rules do not implement most taxonomy items named in the product prompt (for example digital arrest, courier/customs, investment/job, refund reversal, family emergency, or coercive isolation variants).

These are code review findings, not confirmed production incidents.

## Existing checks and baseline results

| Check | Result |
|---|---|
| `frontend/npm run lint` | Passed (`tsc --noEmit`) |
| `frontend/npm run build` | Could not run: sandbox denied Vite’s temporary config write under ignored `node_modules/.vite-temp` (`EPERM`) |
| `backend/venv/bin/python -m pytest -q` | Exit 5: no pytest tests collected; pytest also could not create its cache directory under the restricted checkout |
| Existing `manual_test_rules.py` / `manual_test_combination.py` | Not run at baseline: direct script invocation failed to resolve the `app` module because the repository’s documented `PYTHONPATH`/module invocation is not configured in those scripts |

No external API tests were run, to avoid making provider calls or relying on credentials.

## Highest-priority improvements

1. Add contextual deterministic signals with exact transcript spans, explicit uncertainty, and tests for harmful requests, protective warnings, benign transactions, and discussion of scams.
2. Add typed result schemas and validate all model evidence against the transcript; make provider failure states explicit and safe.
3. Add a reproducible, clearly labeled synthetic benchmark and evaluation runner before presenting performance metrics.
4. Align upload constraints, enforce request limits before buffering, and remove sensitive provider details from public errors.
5. Correct user-facing uncertainty language, clarify local data retention, and keep trusted-contact delivery clearly in preview until a real consent-gated channel exists.
6. Document architecture, detection, privacy/security, evaluation, limitations, deployment, and demo setup based on verified behavior.

## Implementation progress (2026-11-11)

The following work was completed after the initial audit:

- Expanded deterministic behavior rules and added Pydantic `DetectionSignal`, `RuleAnalysisResult`, and typed analysis response schemas.
- Added exact excerpt offsets, category/severity, source, explanation, supporting/conflicting signal fields, action guidance, an ordinal score, and an explicit empty-transcript uncertainty.
- Restricted multi-part patterns to a single sentence after a smoke check exposed a cross-sentence OTP false positive; added a regression test for that case.
- Added schema validation for Cohere output and rejection of unsupported transcript quotations; transcript is explicitly treated as untrusted data in the prompt.
- Added provider fallback behavior: Cohere outages preserve deterministic analysis and mark it incomplete; translation falls back to the on-screen English action; speech failure does not fail the analysis. Synchronous Cohere/Sarvam/TTS calls are moved off the ASGI event loop; Cohere and Sarvam clients have 30-second timeouts.
- Added a 20 MiB bounded upload read, configuration-aware health response (clearly not a provider connectivity test), configurable CORS origins, and generic public provider-failure responses.
- Labeled simulated reports, corrected LOW-risk language, clarified that family contacts are local only, matched the frontend upload cap to the backend, and lazy-loaded the Three.js landing illustration.
- Added offline tests and architecture, detection, evaluation-methodology, privacy/security, limitations, deployment, and competition-demo documentation.
- Removed broken screenshot placeholders from the README and updated claims about data handling, contacts, test status, and provider state.

### Checks run after changes

| Check | Result |
|---|---|
| `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=. venv/bin/python -m pytest -q -p no:cacheprovider` (from `backend/`) | **30 passed**. Includes rules, evidence/schema checks, upload rejection, typed response validation, and mocked provider failures. Pytest emits an existing `pytest-asyncio` default-loop-scope deprecation warning. |
| `npm run lint` (from `frontend/`) | **Passed** (`tsc --noEmit`). |
| `npm run build` (from `frontend/`) | **Passed**, Vite/PWA generated output. Warning remains: the lazy Three.js illustration chunk is 582.22 kB minified, above Vite's 500 kB warning threshold. Initial route chunk is 262.33 kB; service worker precache is about 1,060.94 KiB. |
| `git diff --check` | Passed. |

No live provider calls, external data evaluation, production deployment, or browser/device PWA install test was run. Therefore model performance, provider uptime, and production privacy behavior remain unverified.

## Phased execution plan

1. Repository audit and baseline (complete; this document).
2. Detection engine, typed evidence, and deterministic offline tests (implemented; more adversarial cases remain).
3. Synthetic benchmark, metrics runner, and ablation reporting (method documented; dataset/runner/page remain to be built).
4. Evidence-centered report and family-friendly explanation mode (evidence/status UI improved; family-friendly language mode remains).
5. English/Hindi/Hinglish support and safe fallbacks (partial; limited deterministic coverage, external language behavior unverified).
6. Privacy, security, request/provider reliability, and consent review (partial; no rate limiter, no backend warning-audio expiry, provider/host retention not verified).
7. PWA/offline behavior and performance verification (build works and PWA artifacts are generated; browser/device offline/install tests remain; Three.js chunk warning remains at 582.38 kB minified).
8. Deployment configuration and health checks (configuration documented; production deployment not performed).
9. Technical documentation, demo script, pitch outline, judge Q&A, and truthful limitations (core docs/demo materials added; no screenshots or evaluation report yet).

## Current limitations

This audit verifies repository contents and local static checks only. It does not verify external providers, production hosting, data deletion on a deployed host, or real-world detection performance. The current synthetic pilot is now reported below. It does not establish external or real-world performance.


## Latest implementation pass (2026-11-11)

### Added and changed

- Added `evaluation/dataset/trustline-synthetic-v1.jsonl` with 220 original synthetic text-only examples (120 scam-intent, 100 legitimate), 15 scam categories, English/Hindi/Hinglish labels, expected indicators/actions, provenance, and deterministic scenario-family splits across 35 families.
- Added a deterministic generator, offline rules-only runner, per-record predictions, metric/report generation, and frontend evaluation dashboard. AI-only, hybrid-provider, and full audio pipeline ablations remain explicitly unavailable; the runner makes no provider calls.
- Recorded the current pilot: overall accuracy 65.5%, precision 82.4%, recall 46.7%, F1 59.6%, FPR 12.0%, FNR 53.3% (N=220). Held-out scenario families: N=21, accuracy 57.1%, recall 56.2%, FPR 40.0%. Hindi recall is 0% (N=40 scam examples). This synthetic author-written pilot is diagnostic, not a real-world performance estimate.
- Added simple English/Hindi family explanation mode with the original risk band, an exact evidence excerpt when available, three verification steps, an editable preview, and explicit user-triggered copy. No message is sent automatically.
- Replaced built-in demo scenarios with clearly labeled simulated digital-arrest, legitimate-bank-security, and family-emergency examples. No audio is uploaded or provider contacted by selecting these examples.
- Added supported MIME allowlisting and common audio container signature checks before provider forwarding, retaining the 20 MiB read cap. Added an API regression case for spoofed MIME content.
- Added offline caution text to the network status banner, corrected unverified language/provider/accuracy claims surfaced in the browser smoke check, and changed the default landing visual to the lightweight illustrative call card. The 3D illustration remains available on user selection.
- Added or updated `docs/FINAL_IMPLEMENTATION_PLAN.md`, `docs/SECURITY_AND_PRIVACY.md`, `docs/EVALUATION_REPORT.md`, `docs/DEMO_SCRIPT.md`, and `docs/PITCH_DECK_OUTLINE.md`; updated README, limitations, deployment, and evaluation guidance.

### Latest verification

| Check | Result |
|---|---|
| `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=. venv/bin/python -m pytest -q -p no:cacheprovider` (`backend/`) | **35 passed**; pytest emits the existing `pytest-asyncio` loop-scope deprecation warning. |
| `npm run lint` (`frontend/`) | Passed (`tsc --noEmit`). |
| `npm run build` (`frontend/`) | Passed; PWA generated 31 precache entries (~1,060.94 KiB). Main entry 263.03 kB minified; 3D shield remains a separately deferred 582.38 kB minified chunk and still triggers Vite's 500 kB warning. |
| `PYTHONPATH=.. venv/bin/python -m evaluation.run_benchmark` (`backend/`) | Completed offline; generated the 220-record pilot report and JSON artifact. |
| `git diff --check` | Passed. |
| Local browser smoke check | Loaded the production preview and exposed stale claims on the landing page; those claims were corrected. A clean-origin browser smoke test verified the landing page, evaluation dashboard, upload-cap text, no-consent local simulation progress, HIGH report, and family explanation steps. A full mobile/accessibility/offline/install or provider-connected browser test remains unverified. |

### Remaining before public deployment or strong competition claims

- Add distributed/API-edge rate limiting, authentication as appropriate, temporary warning-audio expiry, and hosting request-size/retention controls.
- Improve Hindi and Hinglish detection; current Hindi pilot misses all scam-labeled examples. Grow an independently authored or consented licensed corpus and re-evaluate without tuning the held-out set.
- Add frontend automated interaction/accessibility tests; only static TypeScript/build plus a limited browser smoke check were run.
- Verify installability, service-worker update behavior, offline shell and offline safety resources in a real browser/device; the app has not had an end-to-end offline/device test.
- Test provider integrations only with authorized credentials and consented sample audio. Provider availability, quality, and data retention are unverified.
- Optimize the optional Three.js chunk further if needed; it is deferred but remains large. No performance target or field latency study has been established.
- Capture real screenshots after completing a full UI review. The README intentionally contains no placeholder screenshots.

**Readiness assessment:** The repository now has a credible, testable engineering demo foundation with explainable offline rules, safe failure handling, evidence validation, synthetic evaluation artifacts, and a family-oriented report. It is not ready for public production or any claim of real-world detection accuracy. Its clearest competition strength is engineering transparency; its largest technical weakness is missed scam examples in the synthetic multilingual pilot, especially Hindi.

## Detection intelligence pass (2026-11-12)

This section supersedes earlier numeric status above for the current implementation. Earlier figures remain as historical baseline records.

- Preserved the original 220-row dataset, baseline predictions (`evaluation/results/baseline-rules-v1-2026-11-11.json`), and baseline report (`docs/EVALUATION_BASELINE_REPORT.md`). No commit or push was performed.
- Added contextual Hindi/Devanagari, Romanized Hindi, and mixed Hindi-English patterns; expanded sentence-level negation/safety context; narrowed generic authority/account-block matches; and preserved transcript offsets.
- Rule scoring now counts each tactic category once. Risk levels include Critical with a multi-behavior gate; Cohere Critical outputs require at least three distinct tactics and two grounded excerpts. Single-indicator and material AI/rules disagreement uncertainty is surfaced.
- Added a reproducible stratified seven-family split (`N=44`) because the original held-out partition had only three scenario families (`N=21`). Baseline predictions are remapped by stable record ID for direct comparison; dataset text and historical predictions are preserved.
- Final synthetic rules-only result: N=220, accuracy 98.6%, precision 100.0%, recall 97.5%, F1 98.7%, FPR 0.0%, FNR 2.5%; confusion TP=117, FP=0, TN=100, FN=3. On the grouped family partition, N=44, accuracy 93.2%, recall 87.5%, FPR 0.0%; all three missed records are courier/customs scam examples. Development scores are 100% on authored variants and clearly show template-fit risk.
- Hindi recall on this pilot is 100% (40/40 scam records); English recall 92.5% (37/40); Hinglish recall 100% (40/40). These small authored sets are not estimates of language performance in real calls.
- Added `docs/DETECTION_ERROR_ANALYSIS.md` with every original-baseline FN/FP and `docs/DETECTION_IMPROVEMENTS.md` with comparisons, current category results, confidence intervals, limitations, and demo readiness.
- Updated generated evaluation report and dashboard data from the final runner. AI-only, hybrid-provider, and audio-to-guidance metrics remain unavailable; no provider calls were made.
- Verification on 2026-11-12: backend **71 passed**; frontend TypeScript/lint passed; production build passed with the pre-existing 582.38 kB optional Three.js chunk warning; benchmark generated 220 results with zero detector exceptions. Provider-connected tests and full browser/device PWA checks remain unrun.

**Current readiness:** suitable for a clearly labeled simulated hackathon demo; not validated for real callers, production safety decisions, or a claim of real-world accuracy. The grouped held-out set remains small and from the same authored corpus, so no claim of generalization is justified.

## Multilingual voice readiness update (2026-11-13)

- Verified against Gnani's current official SDK documentation: Prisma v3.0 is an opt-in multilingual REST model for ten documented languages; it supports `indic-auto`, two-to-four language hints, `format="codemix"`, and a 30-second REST audio limit. Source: [Gnani Vachana SDK documentation](https://github.com/Gnani-AI-Mintlify/Gnani-Vachana).
- Added a user-selectable speech profile for Indic auto-detection, the ten documented Prisma v3 locales (Bengali, Indian English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu), and Hinglish, Tanglish, and Benglish language-hint pairs. The backend maps those choices to Prisma v3.0 and requests code-mix transcription.
- Added server-side profile validation and tests for language hint mapping and unsupported profiles. Updated browser and API feedback to honor the documented 30-second model limit.
- Recording requests browser echo cancellation, noise suppression, and automatic gain control where available. Supported WAV, MP3, FLAC, OGG, and M4A uploads are preserved to retain source sampling and codec, including native 8 kHz call audio; unsupported browser recordings are converted to mono 16 kHz WAV. TRUSTLINE does not apply denoising to uploaded clips. No noisy real-call dataset or language-by-language production accuracy results are available.
- The existing synthetic rules benchmark remains English, Hindi, and Hinglish oriented. It does not validate detection quality for Tamil, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, or Telugu. Code-mix transcription support must not be presented as verified scam-detection performance in those languages.
- Verification on 2026-11-13: backend **78 passed**; frontend TypeScript/lint and production build passed; Vite still reports the existing optional Three.js chunk above 500 kB. A production request using the synthetic English scam sample and the Hinglish language-hint profile returned HTTP 200; Prisma transcription and Sarvam translation completed, Cohere was unavailable, and spoken guidance was unavailable. The report was marked incomplete. This is one synthetic request, not a language or noisy-audio benchmark.
- The backend deployment was updated to commit `2a84b77`. The frontend deployment was not updated: the Vercel CLI could not refresh its local authentication session, and the authenticated Vercel dashboard shows the frontend project is not connected to Git. No repository access integration was added.

### Follow-up robustness pass (2026-11-13)

- Changed frontend audio preparation to preserve supported provider formats instead of always decoding and re-encoding them. This keeps uploaded native 8 kHz telephony files intact for Prisma; unsupported browser recording containers are converted to mono 16 kHz WAV. The original filename is retained for preserved files.
- Duration validation still decodes audio in the browser and enforces 30 seconds. Some browser/codec combinations may not decode every accepted provider format; those combinations remain a compatibility risk.
- README now explicitly identifies Manya Valecha as the solo builder. This is a contribution statement from the repository owner, not an independently verified competition status.
- Verification: backend **78 passed**; frontend lint passed; production build passed after granting sandbox access to Vite/PWA output paths. The existing optional Three.js chunk warning (>500 kB) remains. No real 8 kHz noisy-call evaluation was run.

**Readiness judgment:** the project now demonstrates a documented multilingual STT integration with explicit mixed-language profiles. It is not a claim of all-Indian-language coverage, low-resource language coverage beyond Gnani's documented list, or proven performance on noisy telephonic recordings.

### Signature demo and award framing update (2026-11-13)

- Added a dashboard signature-demo panel for the same authored OTP/account-blocking scam scenario in Hinglish, Tanglish, and Benglish. Each card includes playback, the authored reference script, and controls to load either the clean audio or the bundled 8 kHz/10 dB synthetic variant.
- Selecting a clip populates the existing audio upload route and matching speech/translation language profile. It does not call providers by itself: explicit processing consent and the normal Analyze action remain required. The reference script is labeled as authored text, not a transcription.
- Added a “Why this is Jugaad Genius” architecture explanation that separates Gnani speech services from TRUSTLINE detection and uncertainty behavior. Documented that the current STT adapter exposes no confidence score and that real-call audio quality/noise robustness is not measured.
- Added `docs/MIXED_LANGUAGE_DEMO.md`; updated README and architecture docs with demo instructions and evidence boundaries.
- Verification on 2026-11-13: backend **84 passed**; frontend `npm run lint` passed; `npm run build` passed and generated the PWA bundle; all six bundled clean/noisy demo audio assets exist; `git diff --check` passed. The existing optional Three.js chunk-size warning (>500 kB) remains.
- A local browser/server smoke test was not completed: the dev command's `tsx` IPC socket creation failed with OS `EPERM` in this sandbox. No paid/provider API was called. Mobile layout, actual browser interaction, provider-backed three-clip transcription, and Vercel redeployment remain unverified in this pass.

**Readiness judgment:** the signature demonstration now exercises the real upload pipeline by design, but this source change has only been type-checked and production-built. It must not be described as three newly provider-tested recordings or as measured code-mix accuracy.

### Deployment and browser smoke follow-up (2026-11-13)

- Pushed implementation commit `bb09dfe` to `origin/main` and deployed the frontend to Vercel production deployment `dpl_5GyPmhocH63Ww64u31mHdVXgtt7J`, alias `https://trustline-teal.vercel.app` (READY).
- Production frontend returned HTTP 200. The Hinglish MP3 and Benglish 8 kHz noisy WAV sample assets both returned HTTP 200 with audio content types.
- Browser smoke check on the deployed site: the dashboard rendered all three signature cards; selecting Hinglish, Tanglish, and Benglish in turn loaded the matching MP3 and set the expected speech profile and target language. The consent control stayed unchecked and Analyze remained disabled. No audio was submitted and no paid/provider API was called during this smoke check.
- This verifies the UI selection and consent gate, not audio upload to backend, live transcription, contextual analysis, translation, speech generation, or mobile layout. Those remain unverified for this change.

### Claims review follow-up (2026-11-13)

- Removed the unsupported “Accent Adaptive” marketing label from the Gnani card and replaced it with the verified Prisma v3/language-hints description.
- Renamed “Verified Safe Calls” to “Low-Risk Reports” and clarified that no major indicator found is not proof of safety.
- Kept the requested “Zero confusion” signature-demo title but explicitly labeled it as a design objective, not a measured error-rate claim.
- Remaining award/pitch claims must stay bounded: no independent speaker/user study, no real-call noise benchmark, no confidence score from the STT adapter, and no provider-backed three-language run in this pass. The synthetic authored corpus metrics remain rules-only diagnostics.
- Follow-up frontend deploy after the claims corrections: production deployment `dpl_6SG1JXxeU6f4xg69gvjMSDMeJuYz` is READY at the existing alias; the live page returns HTTP 200 and the served landing-page bundle contains “Language hints available” with the unsupported “Accent Adaptive” wording removed.

### Provider deployment follow-up (2026-11-13)

- A local authorized smoke call confirmed the Cohere service was reachable, but the model sometimes paraphrased evidence and failed the exact-substring guard. The prompt now explicitly requires verbatim, continuous transcript excerpts; a follow-up smoke call returned grounded evidence.
- Production TTS failed because the Gnani SDK was not declared in `requirements.txt` and serverless app directories are not writable. Added the official `gnani-vachana` SDK dependency, returned generated WAV audio inline with the analysis response, and added a report audio player.
- Verification: backend **79 passed**; frontend lint and build passed (the existing Three.js chunk-size warning remains). One production request using the bundled synthetic sample returned HTTP 200 with transcription, Cohere contextual analysis, Sarvam translation, and Gnani spoken guidance all marked complete. The response contained playable audio. CORS preflight from `https://trustline-teal.vercel.app` succeeded.
- Production redeployed on Vercel: API `dpl_4ffn4K95bXTh1v5JKkonPjLr4rds`; frontend `dpl_Bqr57wKeLo4Y9Th9Xc6TyCiTyDLu`.
- This is one synthetic English scam recording with a Hinglish language-hint profile. It does not establish detection accuracy across Indian languages or noisy real-world phone recordings; the generated TTS response is also larger because audio is returned inline.

### Multilingual and telephony demo pass (2026-11-13)

- Switched spoken guidance to Gnani Timbre v3.0 with compressed MP3 payloads. A local authorized smoke set produced short output in all ten documented language locales. This verifies the integration path and available output only, not pronunciation quality or user comprehension.
- Added Tamil- and Bengali-script OTP rule patterns and Bengali-danda sentence boundaries, with protective-warning regressions. Added downloadable fictional Hinglish, Tanglish, and Benglish samples plus reproducible 8 kHz, 300–3400 Hz, 10 dB white-noise variants.
- A local full-pipeline smoke run completed transcription, Cohere, Sarvam, and Timbre for each of the three clean synthetic code-mix samples. A separate six-condition STT/rules smoke run (clean and synthetic-noisy per mix) retained the OTP indicator and HIGH rule band in all six runs. The sample count is too small and too synthetic to estimate performance.
- Added a 60-second live-demo recording plan. No video has been recorded; town/college eligibility and public-vote results remain unknown and are not claimed.
- Production redeployed: API `dpl_EGtUAZiAAQdEctt86yeEgcoCosbZ`; frontend `dpl_H9cmocZg2qgXfoRnuKp428ZC9hfL`. The live frontend and synthetic sample downloads returned HTTP 200; production CORS preflight allowed the frontend origin.
- One production upload of the synthetic, noisy 8 kHz Benglish sample returned HTTP 200, detected `bn-IN`, marked all four providers complete, returned a HIGH band, and included 42,841 bytes of MP3 speech. This is a single generated stress test, not real-noise performance evidence.
- Final verification for this pass: backend **84 passed**; frontend TypeScript lint and Vite/PWA production build passed. The existing optional Three.js chunk-size warning (>500 kB) remains.
