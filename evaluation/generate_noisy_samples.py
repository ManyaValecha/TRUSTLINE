"""Create repeatable 8 kHz, narrow-band, noisy variants of the synthetic demos.

Requires ffmpeg. The added noise is deterministic white noise, not a model of
every real call channel or a substitute for a real-world audio corpus.
"""

from __future__ import annotations

import math
import random
import struct
import subprocess
import tempfile
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_DIR = ROOT / "frontend" / "public" / "samples"
SNR_DB = 10.0
SEED = 20261113
SAMPLES = (
    "trustline-synthetic-hinglish-call.mp3",
    "trustline-synthetic-tanglish-call.mp3",
    "trustline-synthetic-benglish-call.mp3",
)


def convert_to_telephony_wav(source: Path, destination: Path) -> None:
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(source), "-ac", "1", "-ar", "8000",
            "-af", "highpass=f=300,lowpass=f=3400",
            "-c:a", "pcm_s16le", str(destination),
        ],
        check=True,
    )


def add_white_noise(source: Path, destination: Path, *, seed: int) -> None:
    with wave.open(str(source), "rb") as reader:
        params = reader.getparams()
        if params.sampwidth != 2 or params.nchannels != 1:
            raise ValueError("Expected mono, 16-bit PCM telephony audio")
        raw = reader.readframes(params.nframes)

    samples = struct.unpack(f"<{len(raw) // 2}h", raw)
    signal_rms = math.sqrt(sum(sample * sample for sample in samples) / max(1, len(samples)))
    noise_rms = signal_rms / (10 ** (SNR_DB / 20))
    generator = random.Random(seed)
    mixed = [
        max(-32768, min(32767, round(sample + generator.gauss(0, noise_rms))))
        for sample in samples
    ]
    encoded = struct.pack(f"<{len(mixed)}h", *mixed)
    with wave.open(str(destination), "wb") as writer:
        writer.setparams(params)
        writer.writeframes(encoded)


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="trustline-narrowband-") as tmp:
        temp_dir = Path(tmp)
        for index, name in enumerate(SAMPLES):
            source = SAMPLE_DIR / name
            phone_wav = temp_dir / f"{source.stem}-8khz.wav"
            target = SAMPLE_DIR / f"{source.stem}-telephony-10db.wav"
            convert_to_telephony_wav(source, phone_wav)
            add_white_noise(phone_wav, target, seed=SEED + index)
            print(f"{target.relative_to(ROOT)} ({target.stat().st_size} bytes, 8 kHz, {SNR_DB:g} dB SNR)")


if __name__ == "__main__":
    main()
