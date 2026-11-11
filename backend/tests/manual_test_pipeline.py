import asyncio
from pathlib import Path

from app.services.pipeline import analyze_audio


async def main():
    audio_path = Path("tests/audio/sample_fixed.wav")

    print("Starting TRUSTLINE full pipeline...")

    result = await analyze_audio(
        audio_bytes=audio_path.read_bytes(),
        filename=audio_path.name,
        speech_language="en-IN",
        target_language="hi-IN",
    )

    print("\n========== TRUSTLINE RESULT ==========")

    print("\nTRANSCRIPT:")
    print(result["transcription"]["transcript"])

    print("\nRISK LEVEL:")
    print(result["scam_analysis"]["risk_level"])

    print("\nSCAM LIKELY:")
    print(result["scam_analysis"]["is_scam_likely"])

    print("\nDETECTED TACTICS:")
    print(result["scam_analysis"]["detected_tactics"])

    print("\nRECOMMENDED ACTION:")
    print(result["scam_analysis"]["recommended_action"])

    print("\nHINDI WARNING:")
    print(result["translated_warning"])

    print("\n======================================")
    print("FULL PIPELINE SUCCESSFUL!")


if __name__ == "__main__":
    asyncio.run(main())
