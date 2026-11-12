# TRUSTLINE Evaluation Report

**Dataset:** TRUSTLINE synthetic text-only pilot (trustline-synthetic-v1)<br>
**Records:** 220; **scenario families:** 35<br>
**Run:** 2026-11-11T14:05:47.008159+00:00<br>
**Rule version:** `rules-v1-2026-11-11`

> Exploratory synthetic text-only pilot. These figures do not estimate real-world detection performance.

## Rules-only results

| Split | N | Accuracy | Precision | Recall | F1 | False positive rate | False negative rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| All | 220 | 65.5% | 82.4% | 46.7% | 59.6% | 12.0% | 53.3% |
| Held-out families | 21 | 57.1% | 81.8% | 56.2% | 66.7% | 40.0% | 43.8% |
| Development families | 199 | 66.3% | 82.5% | 45.2% | 58.4% | 10.5% | 54.8% |

## Confusion matrix

```json
{
  "true_positive": 56,
  "false_positive": 12,
  "true_negative": 88,
  "false_negative": 64
}
```

## Language and category breakdown

### Language

| Language | N | Accuracy | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| English | 73 | 83.6% | 88.9% | 80.0% | 84.2% |
| Hindi | 74 | 45.9% | Unavailable | 0.0% | Unavailable |
| Hinglish | 73 | 67.1% | 75.0% | 60.0% | 66.7% |

### Scam category recall

| Category | N | Warning recall | Expected signal recall |
|---|---:|---:|---:|
| Authority Impersonation | 8 | 62.5% | 62.5% |
| Bank or KYC Impersonation | 8 | 37.5% | 37.5% |
| Courier or Customs Demand | 8 | 37.5% | 37.5% |
| Credential Request | 8 | 37.5% | 37.5% |
| Digital Arrest Intimidation | 8 | 62.5% | 62.5% |
| Family Emergency Impersonation | 8 | 75.0% | 37.5% |
| Investment or Job Lure | 8 | 25.0% | 25.0% |
| OTP Request | 8 | 37.5% | 37.5% |
| Payment Pressure | 8 | 62.5% | 62.5% |
| Refund Manipulation | 8 | 37.5% | 37.5% |
| Remote Access Request | 8 | 37.5% | 37.5% |
| Secrecy and Isolation | 8 | 37.5% | 37.5% |
| Suspicious APK Request | 8 | 62.5% | 62.5% |
| Threats and Coercion | 8 | 25.0% | 25.0% |
| UPI PIN Request | 8 | 62.5% | 62.5% |

## Latency and failures

- Rules-only mean/median/p95: 0.0779 / 0.0663 / 0.0896 ms per synthetic transcript in this local run.
- Detector failures: 0
- Uncertainty rate: 0.0%
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
- Scenario-family splits prevent closely related variants from crossing splits, but the small number of families limits precision.
- No confidence intervals are shown; the scenario-family count is too small to support strong generalization claims.
- AI-only, hybrid, transcription, and full-pipeline metrics are unavailable rather than inferred.

## Reproduce

```bash
cd backend
PYTHONPATH=.. python -m evaluation.generate_dataset
PYTHONPATH=.. python -m evaluation.run_benchmark
```

The runner writes machine-readable per-record predictions to `evaluation/results/benchmark_results.json` and this report to `docs/EVALUATION_REPORT.md`.
