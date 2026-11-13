# Evaluation Methodology and Current State

## Current implementation

The offline runner includes a deliberately naive keyword-only reference-text baseline alongside the deterministic behavior rules. It searches for OTP, UPI, PIN, and password tokens without negation or conversational context and reports per-example matches plus overall and held-out metrics. It does not run on ASR output. Transcription-plus-keyword, Cohere-only, and full audio/contextual pipeline results remain unavailable without eligible audio and real provider predictions.

The repository now contains a 220-record, authored synthetic **text-only** pilot at `evaluation/dataset/trustline-synthetic-v1.jsonl`, a deterministic generator, an offline rules-only runner, machine-readable predictions, a Markdown report, and an in-app dashboard. This corpus is deliberately not presented as representative real-world data. The unit tests remain separate software checks.

The corpus contains 120 scam-intent and 100 legitimate examples across English, Hindi, and Hinglish. It includes protective OTP/UPI warnings, routine banking and payment discussion, awareness examples, and other difficult negative contexts. Every row records an ID, label, category/topic, language, transcript, synthetic provenance, permission basis, expected signals/action, scenario family, and split.

Related variants stay in the same `scenario_family` split. The original partition placed only three families (N=21; two scam families and one legitimate family) in the held-out group, so the archived baseline report retains that exact historical result. For the current comparison, `evaluation/splits/trustline-synthetic-v1-grouped-seed-20261111.json` defines a stratified, reproducible re-partition with seven whole families (N=44; three scam and four legitimate families) held out. The runner verifies that the family selection matches the fixed seed and keeps every family intact. The detector is a rules system, not a trained model; the re-partition improves class/family coverage but remains the same author-written corpus and is not blind independent validation. The pilot also does not meet the larger per-category allocation suggested in the competition prompt.

## Corpus and evaluation design

- Use only synthetic transcripts or material with documented license, consent, and provenance. Do not add private recordings.
- Use stable record IDs and labels (`scam`, `legitimate`, or `uncertain`), scam category, language, transcript, source/provenance, expected indicators, and safety action.
- Cover English, Hindi, and Hinglish, plus legitimate examples that mention scam vocabulary (OTP warnings, routine UPI payments, bank security instructions, and scam-awareness discussion).
- Keep related scenario families in a single split. Never put paraphrases of the same underlying call scenario in both model-development and held-out evaluation sets.
- Freeze rule/model versions and dataset versions before comparing results. Report sample counts and unavailable metrics where denominators are empty.
- Record provider failures, transcription failures, latency, and uncertainty separately from wrong classifications.

## Metrics reported by the pilot

The current report computes precision, recall, F1, accuracy, false-positive rate, and false-negative rate from the scam/legitimate confusion matrix, plus per-language/per-category results, local rules latency, detector failures, and uncertainty. Record-level metrics include 95% Wilson intervals when a denominator exists. These intervals assume independent records and do not account for related records within scenario families, so they understate uncertainty. Transcription failure is unavailable because there is no audio.

## Ablation plan

1. Rules only: deterministic rule output on the same transcript set.
2. AI only: validated Cohere result on the same transcript set.
3. Hybrid: combined result on the same transcripts.
4. Full audio-to-guidance: only on a consented, licensed audio subset with provider status and latency recorded.

If provider credentials or eligible data are unavailable, label an ablation as unavailable. Do not substitute mock results or infer full-pipeline quality from text-only tests.

## Run the pilot

From `backend/`:

```bash
PYTHONPATH=.. python -m evaluation.generate_dataset
PYTHONPATH=.. python -m evaluation.run_benchmark
PYTHONPATH=.. python -m evaluation.analyze_errors
```

The benchmark writes per-record outputs to `evaluation/results/benchmark_results.json`, copies the generated artifact to `frontend/public/evaluation-results.json`, and regenerates `docs/EVALUATION_REPORT.md` for the dashboard. It compares current predictions to the immutable `evaluation/results/baseline-rules-v1-2026-11-11.json` by record ID and uses the current grouped split for both rows. `analyze_errors` regenerates the complete baseline error inventory in `docs/DETECTION_ERROR_ANALYSIS.md`. Metrics include per-language/per-category breakdown, local rules-only latency, detector failures, and uncertainty. Transcription failure is unavailable because the dataset has no audio.

The original archived rules-only baseline and current complete deterministic rules-only detector are measured. Context-only and multilingual-only ablations were not preserved as separate runnable detector revisions; those isolated stages are unavailable rather than inferred. AI-only, provider-backed hybrid, and full audio-to-guidance ablations are also unavailable; the runner makes no provider calls. Current rules were iterated using the development partition and regression cases. The grouped held-out split is for one final diagnostic comparison and is not used to select rules. The unchanged corpus and small family counts mean even this grouped result is not independent generalization evidence.

Run offline software tests with `cd backend && PYTHONPATH=. python -m pytest -q -p no:cacheprovider`. These validate selected rule behavior, schema grounding, API limits, provider failure handling, and benchmark bookkeeping. They do not estimate real-world detection performance.
