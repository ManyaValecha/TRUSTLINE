from app.services.gnani_tts import (
    generate_speech,
    GnaniTTSError,
)

warning = (
    "सावधान! यह कॉल धोखाधड़ी हो सकती है। "
    "अपना ओटीपी, यूपीआई पिन या बैंक की जानकारी किसी के साथ साझा न करें। "
    "कृपया कॉल काट दें और अपने बैंक से आधिकारिक नंबर पर संपर्क करें।"
)

print("Generating TRUSTLINE Hindi voice warning...")

try:
    result = generate_speech(
        text=warning,
        language_code="hi-IN",
        voice="Nalini",
    )

    print("\nGNANI TIMBRE TEST SUCCESSFUL")
    print("Provider:", result["provider"])
    print("Voice:", result["voice"])
    print("Language:", result["language"])
    print("Audio file:", result["audio_path"])
    print("Audio size:", result["audio_size"], "bytes")

except GnaniTTSError as error:
    print("\nTTS TEST FAILED:", error)
