# One scam. Three languages. Zero confusion.

## What the demo shows

The dashboard's signature-demo panel presents three fictional, Gnani Timbre-generated clips for one authored bank-impersonation scenario: threatened account blocking, a request for an OTP, and an instruction to keep the call secret. “Zero confusion” is an aspiration for comparing the same intended behavior across the three scripts, not a measured error-rate claim. Each card includes audio playback, the authored reference script, a clean clip, and an optional 8 kHz/10 dB synthetic variant.

The displayed script is the reference used to produce the clip. It is not a transcription result. To run the actual pipeline, choose **Use clean clip** or the noisy variant, review the selected audio in the uploader, confirm the explicit provider-processing consent, and choose **Analyse Recording with TRUSTLINE AI**. The request then follows the same backend path as other user-selected audio. Inspect the returned transcript; no result is prewritten into this demonstration.

## Walkthrough

1. Open the dashboard and play the Hinglish, Tanglish, or Benglish sample.
2. Read the reference script, noting that it is generated speech and not a real call.
3. Load the clean clip or its controlled 8 kHz phone-band/10 dB noise variant. The matching Prisma speech profile and target language are selected for the request.
4. Confirm audio processing consent in the upload panel. This sends the selected sample to configured providers.
5. Start analysis and review the actual provider transcript, detected language, rule signals, contextual analysis status, risk band, translated warning, and optional spoken guidance.
6. Repeat with the other two clips to compare the same authored intent across code-mix profiles.

If a provider is unavailable, inspect the provider status and uncertainty on the report. Do not call a failed or rules-only result a complete contextual analysis. Provider output is not a ground-truth label.

## Provider boundary

| Stage | Responsibility |
|---|---|
| Gnani Prisma v3 | Speech-to-text; language hints are supplied for the three code-switch profiles |
| TRUSTLINE deterministic rules | Predefined explainable transcript patterns and evidence spans |
| Cohere | Optional contextual interpretation with transcript-grounded excerpts |
| TRUSTLINE pipeline | Combines available signals and marks contextual-analysis failure as incomplete |
| Sarvam | Optional translation of the safety recommendation |
| Gnani Timbre v3 | Optional speech synthesis of the recommendation |

The transcription response currently used by TRUSTLINE does not expose a confidence score to the app. TRUSTLINE does not infer confidence from provider availability or risk level. Review the transcript; short, garbled, or incomplete text is inconclusive. A LOW risk band does not mean a call is safe.

## Reproducible audio variants

The generated fixture manifest is `evaluation/audio_samples.json`. Recreate the noisy variants with `python evaluation/generate_noisy_samples.py` from the repository root. The script applies mono 8 kHz PCM conversion, a 300–3400 Hz band-pass, and deterministic white noise at 10 dB SNR. This controlled degradation is synthetic and must not be described as real-call evaluation.

The offline benchmark (`python -m evaluation.run_benchmark` from `backend/`, with `PYTHONPATH=..`) evaluates authored text examples against deterministic rules only. It does not measure transcription quality, Cohere, full-pipeline behavior, or the three audio samples. No audio benchmark or real-world noise robustness estimate is currently available.
