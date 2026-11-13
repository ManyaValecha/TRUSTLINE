# DPDFNet fit for TRUSTLINE (candidate; not integrated)

## Assessment

DPDFNet is a plausible optional speech-enhancement stage for narrow-band/noisy recordings. Its official project documents pretrained 8 kHz models, ONNX/TFLite inference, and a CPU-only ONNX Python package. The package README lists Python 3.11+, ONNX Runtime, librosa, NumPy, soundfile, and other dependencies; model files are downloaded separately. See the [DPDFNet repository](https://github.com/ceva-ip/DPDFNet) and [package README](https://github.com/ceva-ip/DPDFNet/blob/main/package/README.md).

It can target noise before Gnani transcription, but it does not establish language identification, scam intent, transcription confidence, or end-to-end scam-detection accuracy. Speech enhancement may also suppress quiet consonants, short OTP/PIN words, or negation. Therefore it should remain optional with the original recording preserved until TRUSTLINE-specific paired tests show a benefit.

## Proposed evaluation before integration

1. Freeze the current STT adapter, detection rules, and sample scripts as the baseline.
2. Run the exact same authorized clips through two branches: original audio → Gnani; and DPDFNet-enhanced audio → Gnani. Do not change speech profile, STT version, or transcript rules between branches.
3. Start with bundled synthetic clean, 8 kHz/10 dB, −24 dB, and 16 kbps clips. These are controlled fixtures only. Add a separately consented real-noisy-call set before any real-call robustness claim.
4. Score transcription against human-reviewed references (WER/CER where script handling is appropriate) and separately count preservation of OTP/PIN/password terms, negation, urgency, speaker turns, and exact evidence spans.
5. Report each language and condition, failure/timeout rate, wall-clock latency and peak memory. Include samples where enhancement makes output worse. Have fluent reviewers judge transcript fidelity and advisory clarity; do not treat ASR text metrics as scam-classification precision.
6. Keep enhancement disabled by default unless a predeclared acceptance rule shows reliable gains without safety-critical regressions. Preserve access to the raw audio and a clear raw-audio fallback.

## Deployment constraints

The repository does not bundle ONNX weights. The official DPDFNet model profile lists 8 kHz ONNX models around 9.7 MB and Python dependencies include native/runtime packages; the overall function bundle, cold start, memory use, processing time, and compatibility with TRUSTLINE's Vercel Python runtime have not been tested. Do not fetch model weights dynamically in a user request. First benchmark the package and model in an isolated local worker. If serverless limits are exceeded, use a separately managed CPU worker or omit enhancement; do not silently send audio to an unreviewed third-party enhancer.

The repository license is Apache-2.0 according to the upstream README. Preserve applicable notices and verify dependency/model artifact terms before redistribution.

## Current status

DPDFNet is **not installed, called, or deployed** in TRUSTLINE. The local waveform check is only advisory amplitude/clipping/silence information; it is not denoising. No claim of improved speech recognition or real noisy-call robustness is made.
