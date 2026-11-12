# Detection Methodology

## Scope

TRUSTLINE checks conversation content for behavioral scam indicators. It does not detect synthetic voices or determine a caller's identity. A result is an aid to a user's decision, not a finding that fraud occurred.

## Current pipeline

1. A user chooses an audio recording and submits it.
2. Gnani STT returns a transcript.
3. Cohere produces a contextual result constrained by a Pydantic schema. Every model evidence excerpt must occur in the supplied transcript (case-insensitive match) or the model result is rejected.
4. Independent deterministic rules scan for request and pressure patterns.
5. The application combines the two risk bands, preserving the higher band, and presents evidence and safety actions.
6. Sarvam translation and Gnani spoken guidance are optional post-processing steps. Their failure does not discard the transcript or detection result.

Transcript text is treated as untrusted quoted data in the model prompt. This prompt defense is useful but cannot guarantee immunity to prompt injection.

## Rule signals currently implemented

The deterministic engine covers OTP, UPI PIN and credential solicitation; digital arrest; authority and bank/KYC impersonation; payment and urgency pressure; threats; secrecy/isolation; remote-access and APK installation; courier/customs demands; investment/job lures; refund manipulation; and family emergencies. It includes hand-authored Devanagari Hindi, Romanized Hindi, and mixed Hindi-English patterns alongside English rules. It is not a trained classifier. A keyword match is only an indicator and can miss paraphrases, ASR errors, sarcasm, or unfamiliar transliteration.

Protective and negated requests are checked against bounded sentence context, including selected Hindi negation forms. Safety-awareness cues, explicit no-fee statements, and negated installation advice can suppress a candidate. Context and intent remain heuristic; the engine does not reliably identify speakers, targets, or quoted/reported speech.

## Evidence and uncertainty

Each deterministic signal is validated with a Pydantic model and includes a category, severity, exact excerpt, start/end offsets into the original transcript string, explanation, source, and recommended action. The transcript is scanned without normalizing or rewriting it, so evidence offsets retain source alignment. Cohere excerpts must occur in the supplied transcript and receive a matching span before display.

An empty transcript is LOW with explicit uncertainty. A single MEDIUM indicator is also marked uncertain. If contextual AI and deterministic risk bands differ by at least two ordinal steps, the higher band is retained and the disagreement is surfaced as uncertainty. A model-proposed CRITICAL band is reduced to HIGH unless at least three distinct tactics and two distinct transcript excerpts are grounded. Provider failure marks the result incomplete. These mechanisms communicate limited evidence; they do not provide calibrated probabilities or solve all contradictory-evidence cases.

## Risk bands and rule score

- `LOW`: no deterministic signal. It does not mean the call is safe.
- `MEDIUM`: signals exist, but the high threshold is not met. One isolated MEDIUM result includes a caution about a possible benign explanation.
- `HIGH`: at least one direct OTP/UPI PIN/credential request, or a category-deduplicated ordinal score of at least four.
- `CRITICAL`: at least one credential request plus two distinct coercive behavior categories, or three distinct coercive behavior categories. Eligible categories include authority claims, digital arrest/threats, payment pressure, isolation, remote-access/APK requests, and family-emergency pressure. A lone keyword or repeated match within one category cannot make a result Critical.
- Severity weights are 3 for HIGH-severity signals, 2 for MEDIUM, and 1 for LOW. The score sums the maximum signal weight once per distinct category; repeated patterns within a category do not add weight. This ordinal heuristic is **not a probability, confidence, or calibrated risk estimate**.
- The combined AI/rules result uses the higher risk band. AI evidence is separately grounded to transcript text. No statistical calibration has been performed.

## Tests and known gaps

Run offline tests from `backend/` with `PYTHONPATH=. python -m pytest -q -p no:cacheprovider`. The software suite covers selected English, Hindi and Romanized/Hinglish requests, protective warnings, benign mentions, exact evidence offsets, score deduplication, Critical gating, AI/rule disagreement, malformed model output, provider outages, and the benchmark. Test passage verifies implementation behavior only; it is not evidence of real-world accuracy. The synthetic evaluation limitations and measured results are documented in `EVALUATION_REPORT.md` and `DETECTION_IMPROVEMENTS.md`.
