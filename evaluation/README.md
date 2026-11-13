# Offline evaluation

This folder contains the synthetic text-only evaluation corpus generator, offline rules-only runner, and generated result artifacts.

From the `backend/` directory:

```bash
PYTHONPATH=.. python -m evaluation.generate_dataset
PYTHONPATH=.. python -m evaluation.run_benchmark
PYTHONPATH=.. python -m evaluation.analyze_errors
```

The runner never calls external providers. It preserves the archived baseline, uses the fixed grouped split configuration, and updates the JSON result, evaluation report, and frontend dashboard artifact. It reports current rules-only behavior and a naive keyword-only baseline on authored reference text. The keyword baseline deliberately ignores context and therefore also flags warnings that mention OTP/PIN/password tokens. Neither model uses ASR output: transcription-plus-keyword and full contextual/audio-pipeline results are unavailable because the corpus has no audio or provider-generated predictions. `analyze_errors` regenerates the original baseline's example-by-example error inventory. Read `docs/EVALUATION_METHODOLOGY.md`, `docs/DETECTION_IMPROVEMENTS.md`, and `docs/EVALUATION_REPORT.md` before interpreting any metric.

## Audio signal check

Before submission, the browser may decode the selected recording locally and display duration, RMS level, sampled peak/clipping share, and near-silence share. The thresholds are initial heuristics for warnings only. The feature is not a speech-quality estimator, noise classifier, intelligibility predictor, or calibrated confidence score. It neither changes nor blocks the upload. If decoding is unsupported, the UI says the check is unavailable.

## Synthetic multilingual audio smoke set

`audio_samples.json` lists three fictional Gnani Timbre-generated code-mix calls (Hinglish, Tanglish, Benglish), their reference text, and controlled variants. The app can load the clips directly for analysis after consent. They contain no real callers or recordings. Generate the 8 kHz, 300–3400 Hz band-limited 10 dB white-noise, −24 dB attenuation, and 16 kbps MP3 variants with:

```bash
python evaluation/generate_noisy_samples.py
```

The script requires `ffmpeg` and uses a fixed random seed. The white-noise treatment is one controlled stress condition. The quiet and compressed variants are similarly narrow signal manipulations; none reproduces reverberation, clipping, traffic/TV/competing speakers, packet loss, or real cellular paths.

Historical integration observations from 2026-11-13 used configured provider credentials on authored speech. They are not accuracy, robustness, user-impact, or competition-performance estimates. The later quiet and low-bitrate variants have not been provider-tested. The offline benchmark above does not call providers.
