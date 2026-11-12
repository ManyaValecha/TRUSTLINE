# Offline evaluation

This folder contains the synthetic text-only evaluation corpus generator, offline rules-only runner, and generated result artifacts.

From the `backend/` directory:

```bash
PYTHONPATH=.. python -m evaluation.generate_dataset
PYTHONPATH=.. python -m evaluation.run_benchmark
PYTHONPATH=.. python -m evaluation.analyze_errors
```

The runner never calls external providers. It preserves the archived baseline, uses the fixed grouped split configuration, and updates the JSON result, evaluation report, and frontend dashboard artifact. `analyze_errors` regenerates the original baseline's example-by-example error inventory. AI-only, hybrid, and full audio-pipeline results remain unavailable unless implemented as a separately authorized evaluation with eligible data. Read `docs/EVALUATION_METHODOLOGY.md`, `docs/DETECTION_IMPROVEMENTS.md`, and `docs/EVALUATION_REPORT.md` before interpreting any metric.
