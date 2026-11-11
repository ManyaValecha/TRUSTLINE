from app.services.sarvam_translator import (
    translate_text,
    SarvamTranslationError,
)

sample = (
    "Your bank account will be blocked. "
    "Never share your OTP with anyone."
)

print("Sending English text to Sarvam...")
print("Target language: Hindi")

try:
    result = translate_text(
        text=sample,
        source_language_code="en-IN",
        target_language_code="hi-IN",
    )

    print("\nSARVAM TRANSLATION SUCCESSFUL")
    print("Provider:", result["provider"])
    print("Original:", result["original_text"])
    print("Translated:", result["translated_text"])
    print("Request ID:", result["request_id"])

except SarvamTranslationError as error:
    print("\nSARVAM TEST FAILED:", error)
