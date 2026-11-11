from app.scam_engine.rules import detect_rule_based_risks

samples = {
    "Protective warning": "Never share your OTP with anyone.",
    "Actual OTP scam": "Tell me the OTP immediately.",
    "UPI warning": "Do not share your UPI PIN with anyone.",
    "Actual UPI scam": "Please share your UPI PIN with me.",
}

for name, transcript in samples.items():
    result = detect_rule_based_risks(transcript)

    print(f"\n{name}")
    print("Risk:", result["risk_level"])
    print("Tactics:", result["detected_tactics"])
