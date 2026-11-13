# Offline evaluation

This folder contains the synthetic text-only evaluation corpus generator, offline rules-only runner, and generated result artifacts.

From the `backend/` directory:

```bash
PYTHONPATH=.. python -m evaluation.generate_dataset
PYTHONPATH=.. python -m evaluation.run_benchmark
PYTHONPATH=.. python -m evaluation.analyze_errors
```

The runner never calls external providers. It preserves the archived baseline, uses the fixed grouped split configuration, and updates the JSON result, evaluation report, and frontend dashboard artifact. `analyze_errors` regenerates the original baseline's example-by-example error inventory. AI-only, hybrid, and full audio-pipeline results remain unavailable unless implemented as a separately authorized evaluation with eligible data. Read `docs/EVALUATION_METHODOLOGY.md`, `docs/DETECTION_IMPROVEMENTS.md`, and `docs/EVALUATION_REPORT.md` before interpreting any metric.

## Synthetic multilingual audio smoke set

`audio_samples.json` lists three fictional Gnani Timbre-generated code-mix calls (Hinglish, Tanglish, Benglish), their reference text, and corresponding controlled noisy variants. The app offers these samples for download. They contain no real callers or recordings. Generate the 8 kHz, 300–3400 Hz band-limited, 10 dB synthetic-white-noise variants with:

```bash
python evaluation/generate_noisy_samples.py
```

The script requires `ffmpeg` and uses a fixed random seed. The 10 dB white-noise treatment is only one controlled stress condition; it does not reproduce reverberation, clipping, competing speakers, packet loss, or the range of real cellular paths.

Observed on 2026-11-13 with configured provider credentials: Timbre v3.0 generated one short warning in each of its ten documented language locales; three clean synthetic code-mix samples completed the local transcription/Cohere/Sarvam/TTS pipeline; and all three clean plus all three 8 kHz/10 dB variants produced an OTP rule signal with a HIGH band in a single STT/rules smoke run. These are small integration checks on authored speech, not accuracy, robustness, user-impact, or competition-performance estimates. The offline benchmark above does not call providers.
