# TRUSTLINE Evaluation Report

**Dataset:** TRUSTLINE synthetic text-only pilot (trustline-synthetic-v1)<br>
**Records:** 220; **scenario families:** 35<br>
**Run:** 2026-11-12T04:25:50.412905+00:00<br>
**Rule version:** `rules-v5-contextual-multilingual-2026-11-12`

> Exploratory synthetic text-only pilot. These figures do not estimate real-world detection performance.

## Rules-only results

| Split | N | Accuracy | Precision | Recall | F1 | False positive rate | False negative rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| All | 220 | 98.6% | 100.0% | 97.5% | 98.7% | 0.0% | 2.5% |
| Held-out families | 44 | 93.2% | 100.0% | 87.5% | 93.3% | 0.0% | 12.5% |
| Development families | 176 | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% |

### Original versus improved rules (same 220 records)

| Metric | Original baseline | Improved rules | Change |
|---|---:|---:|---:|
| Accuracy | 65.5% | 98.6% | +33.2% |
| Precision | 82.4% | 100.0% | +17.6% |
| Recall | 46.7% | 97.5% | +50.8% |
| F1 | 59.6% | 98.7% | +39.2% |
| False positive rate | 12.0% | 0.0% | -12.0% |
| False negative rate | 53.3% | 2.5% | -50.8% |

Error counts: false negatives 64 → 3; false positives 12 → 0.

#### Same grouped held-out families

| Metric | Original baseline | Improved rules | Change |
|---|---:|---:|---:|
| Accuracy | 68.2% | 93.2% | +25.0% |
| Precision | 91.7% | 100.0% | +8.3% |
| Recall | 45.8% | 87.5% | +41.7% |
| F1 | 61.1% | 93.3% | +32.2% |
| False positive rate | 5.0% | 0.0% | -5.0% |
| False negative rate | 54.2% | 12.5% | -41.7% |

Archived baseline predictions: `evaluation/results/baseline-rules-v1-2026-11-11.json`. Baseline predictions were remapped by record ID to this same family split; the original archived split and report remain unchanged.

### 95% Wilson intervals (record-level)

| Split | Accuracy | Precision | Recall | False positive rate | False negative rate |
|---|---|---|---|---|---|
| All | [96.1%, 99.5%] | [96.8%, 100.0%] | [92.9%, 99.1%] | [0.0%, 3.7%] | [0.9%, 7.1%] |
| Held-out families | [81.8%, 97.7%] | [84.5%, 100.0%] | [69.0%, 95.7%] | [0.0%, 16.1%] | [4.3%, 31.0%] |
| Development families | [97.9%, 100.0%] | [96.2%, 100.0%] | [96.2%, 100.0%] | [0.0%, 4.6%] | [0.0%, 3.8%] |

Intervals use the Wilson binomial method. They treat records as independent; repeated variants within scenario families violate that assumption, so intervals understate uncertainty.

### Current error breakdown

| Error | Category / safe scenario | Count |
|---|---|---:|
| False negative | Courier or Customs Demand | 3 |

## Confusion matrix

```json
{
  "true_positive": 117,
  "false_positive": 0,
  "true_negative": 100,
  "false_negative": 3
}
```

## Language and category breakdown

### Language

| Language | N | Accuracy | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| English | 73 | 95.9% | 100.0% | 92.5% | 96.1% |
| Hindi | 74 | 100.0% | 100.0% | 100.0% | 100.0% |
| Hinglish | 73 | 100.0% | 100.0% | 100.0% | 100.0% |

### Scam category recall

| Category | N | Warning recall | Expected signal recall |
|---|---:|---:|---:|
| Authority Impersonation | 8 | 100.0% | 100.0% |
| Bank or KYC Impersonation | 8 | 100.0% | 62.5% |
| Courier or Customs Demand | 8 | 62.5% | 37.5% |
| Credential Request | 8 | 100.0% | 100.0% |
| Digital Arrest Intimidation | 8 | 100.0% | 100.0% |
| Family Emergency Impersonation | 8 | 100.0% | 62.5% |
| Investment or Job Lure | 8 | 100.0% | 100.0% |
| OTP Request | 8 | 100.0% | 100.0% |
| Payment Pressure | 8 | 100.0% | 100.0% |
| Refund Manipulation | 8 | 100.0% | 100.0% |
| Remote Access Request | 8 | 100.0% | 100.0% |
| Secrecy and Isolation | 8 | 100.0% | 100.0% |
| Suspicious APK Request | 8 | 100.0% | 100.0% |
| Threats and Coercion | 8 | 100.0% | 100.0% |
| UPI PIN Request | 8 | 100.0% | 100.0% |

## Latency and failures

- Rules-only mean/median/p95: 0.1751 / 0.1291 / 0.1769 ms per synthetic transcript in this local run.
- Detector failures: 0
- Uncertainty rate: 34.1%
- Transcription failure rate: unavailable. Unavailable: this corpus contains synthetic text and no audio/transcription stage.

## Ablation status

| Component | Status |
|---|---|
| Rules Only | measured |
| Ai Only | unavailable — No live Cohere calls are made by the offline benchmark. |
| Hybrid | unavailable — Provider credentials/network are not assumed in automated evaluation. |
| Full Audio To Guidance | unavailable — Dataset is synthetic text-only and contains no audio. |

## Limitations

- Synthetic author-written text is not representative of real calls or ASR errors.
- The rule set and corpus share an authoring context; this pilot is exploratory, not independent validation.
- The grouped held-out split contains seven scenario families; record-level Wilson intervals do not account for within-family dependence.
- This is a deterministic re-partition of the same authored pilot, not a newly collected or blind independent validation set.
- AI-only, hybrid, transcription, and full-pipeline metrics are unavailable rather than inferred.

## Reproduce

```bash
cd backend
PYTHONPATH=.. python -m evaluation.generate_dataset
PYTHONPATH=.. python -m evaluation.run_benchmark
```

The runner writes machine-readable per-record predictions to `evaluation/results/benchmark_results.json` and this report to `docs/EVALUATION_REPORT.md`.
