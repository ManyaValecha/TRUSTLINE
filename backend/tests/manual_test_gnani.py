import asyncio
from pathlib import Path

from app.services.gnani_stt import transcribe_audio, GnaniSTTError


async def main():
    audio_path = Path("tests/audio/sample_fixed.wav")

    if not audio_path.exists():
        print("ERROR: Audio file not found.")
        return

    audio_bytes = audio_path.read_bytes()

    print("Sending sample audio to Gnani...")
    print(f"Audio size: {len(audio_bytes)} bytes")

    try:
        result = await transcribe_audio(
            audio_bytes=audio_bytes,
            filename=audio_path.name,
            language_code="en-IN",
        )

        print("\nTRANSCRIPTION SUCCESSFUL")
        print("Provider:", result["provider"])
        print("Transcript:", result["transcript"])
        print("Request ID:", result.get("request_id"))

    except GnaniSTTError as error:
        print("\nTRANSCRIPTION FAILED:", error)


if __name__ == "__main__":
    asyncio.run(main())
