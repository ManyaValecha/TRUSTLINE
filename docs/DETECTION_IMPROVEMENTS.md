# TRUSTLINE Detection Improvements

**Detector:** `rules-v5-contextual-multilingual-2026-11-12`<br>
**Dataset:** `trustline-synthetic-v1`, 220 authored synthetic text transcripts<br>
**Evaluation:** offline rules-only; no provider calls

## Changes made

- Added hand-authored Devanagari Hindi, Romanized Hindi, and mixed Hindi-English behavior patterns for credentials, authority claims, threats, payments, remote access, job/courier/refund lures, and family emergencies.
- Replaced generic police-role matching with caller identity assertion patterns. Removed generic account-block mentions as a standalone coercion signal.
- Expanded sentence-scoped polarity checks for Hindi/Romanized negation, no-fee statements, refund safety advice, and instructions not to install software.
- Preserved original transcript text and exact evidence offsets; rule matching does not rewrite/normalize the transcript.
- Deduplicated ordinal risk weight by distinct category. Repeated regex matches for the same category add no extra score.
- Added `CRITICAL`, gated on multiple distinct coercive behavior categories; a single request or repeated phrase cannot make a deterministic result Critical. A model-proposed Critical result is downgraded to High unless it names at least three distinct tactics supported by at least two grounded excerpts.
- Propagated single-indicator uncertainty and substantial AI/rules disagreement into the combined result while retaining the higher indicated risk.
- Added regression tests for multilingual requests, negative/protective context, evidence alignment, category deduplication, Critical gating, and model disagreement.

## Measured comparison

The 220 records and original predictions were preserved. The original result is archived at `evaluation/results/baseline-rules-v1-2026-11-11.json`; its report is `docs/EVALUATION_BASELINE_REPORT.md`. Current metrics below come from the generated run artifact, not hardcoded dashboard values.

| Metric | Original rules | Improved deterministic rules | Change |
|---|---:|---:|---:|
| Accuracy | 65.5% (220) | 98.6% (220) | +33.2 percentage points |
| Precision | 82.4% (68 predicted positive) | 100.0% (117 predicted positive) | +17.6 pp |
| Recall | 46.7% (120 scam records) | 97.5% (120) | +50.8 pp |
| F1 | 59.6% | 98.7% | +39.2 pp |
| False-positive rate | 12.0% (100 legitimate) | 0.0% (100) | −12.0 pp |
| False-negative rate | 53.3% (120 scam records) | 2.5% (120) | −50.8 pp |

Confusion counts changed from TP=56, FP=12, TN=88, FN=64 to TP=117, FP=0, TN=100, FN=3.

### Grouped held-out comparison

The original split had only three held-out scenario families (N=21). For a better class balance, the run uses the fixed SHA-256 family assignment in `evaluation/splits/trustline-synthetic-v1-grouped-seed-20261111.json`: three scam and four legitimate families, N=44. Baseline predictions were remapped by record ID to those exact families.

| Metric | Original rules on same 44 records | Improved rules | Change |
|---|---:|---:|---:|
| Accuracy | 68.2% | 93.2% | +25.0 pp |
| Precision | 91.7% | 100.0% | +8.3 pp |
| Recall | 45.8% | 87.5% | +41.7 pp |
| F1 | 61.1% | 93.3% | +32.2 pp |
| False-positive rate | 5.0% | 0.0% | −5.0 pp |
| False-negative rate | 54.2% | 12.5% | −41.7 pp |

The final grouped holdout still contains **three missed Courier or Customs Demand examples** (N=8 in that category) and no false positives (N=20 legitimate records). Its 95% Wilson recall interval is 68.996%–95.656%; its FPR interval is 0%–16.113%. The interval is record-level and does not account for template-family dependence.

## Per-language results

| Language | N | Scam recall | Legitimate FPR | Accuracy | Original scam recall |
|---|---:|---:|---:|---:|---:|
| English | 73 | 92.5% (37/40) | 0.0% (0/33) | 95.9% | 80.0% |
| Hindi | 74 | 100.0% (40/40) | 0.0% (0/34) | 100.0% | 0.0% |
| Hinglish | 73 | 100.0% (40/40) | 0.0% (0/33) | 100.0% | 60.0% |

These exact results demonstrate coverage on this authored set only. They do not establish reliable Hindi/Hinglish performance on real speakers, varied accents, or speech-recognition output.

## Per-category warning recall

Each scam category has only eight records. The improved detector warned on all records in 14 of 15 categories. Courier/customs recall is 62.5% (5/8); the remaining three records are the held-out misses. The per-record report also distinguishes *warning recall* from *expected-signal recall*: Bank/KYC and Family Emergency warning recall is 100%, while exact tactic-label recall is 62.5% in each. This means the detector often raised a warning but selected another tactic label; that labeling needs further work.

Full category and language tables are generated in `docs/EVALUATION_REPORT.md` and `frontend/public/evaluation-results.json`.

## Error analysis and uncertainty

The original baseline’s complete inventory of 64 false negatives and 12 false positives is in `docs/DETECTION_ERROR_ANALYSIS.md`. After the improvement run, the three remaining errors are all held-out English courier/customs requests. No false positives remain in this small corpus. Single-indicator uncertainty was reported on 34.1% of transcripts; this is a rule-level caution, not a calibrated probability.

Measured mean/median/p95 rule runtime was 0.1650/0.1235/0.1708 ms per text transcript on the local machine. This excludes audio transfer, transcription, provider latency, and rendering. Detector failures: 0/220.

## Ablations and evaluation limits

| Stage | Result |
|---|---|
| Original baseline rules | Measured and archived. |
| Improved complete deterministic rules | Measured above. The engine combines contextual and multilingual patterns. |
| Context-only or multilingual-only isolated ablation | Unavailable; separate frozen detector implementations were not retained, so no isolated numbers are claimed. |
| AI-only / provider-backed hybrid | Unavailable; the offline runner makes no live provider calls. |
| Full audio-to-guidance | Unavailable; this corpus contains no audio. |

The development split is now 100% on this authored corpus, which is evidence of template fit, not a strong generalization result. The held-out partition is a deterministic re-split of the same authored corpus—not newly collected, blind, licensed, or independent validation. Related variants are grouped, but the family count is still small, category counts are eight, and the three held-out scam families are not sufficient for a meaningful real-world claim. Do not present the 98.6% overall score as expected real-world accuracy.

## Demo readiness

TRUSTLINE is suitable for a **simulated hackathon software demonstration** if the transcript and metrics are identified as synthetic and the limits are stated. It is not validated for protecting people during real calls or for a high-stakes live safety demonstration. Real audio involves transcription errors, language variation, speaker attribution, and provider behavior that this text benchmark does not measure. A larger independent, consented/licensed evaluation set and live provider/device validation are required before making operational safety claims.
