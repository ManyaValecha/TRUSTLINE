from app.services.cohere_analyzer import analyze_transcript

transcript = """
Hello, I am calling from your bank's fraud department.
Your bank account will be blocked in the next 10 minutes.
To prevent this, tell me the OTP you just received.
Do not disconnect the call or tell anyone.
"""

print("Testing TRUSTLINE with a suspicious call...")

try:
    result = analyze_transcript(transcript)

    for key, value in result.items():
        print(f"{key}: {value}")

except Exception as error:
    print("TEST FAILED:", error)
