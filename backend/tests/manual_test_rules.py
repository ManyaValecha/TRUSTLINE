from app.scam_engine.rules import detect_rule_based_risks


test_cases = [
    {
        "name": "Bank OTP scam",
        "transcript": (
            "I am calling from your bank. "
            "Your account will be blocked. "
            "Tell me the OTP immediately. "
            "Do not tell anyone."
        ),
    },
    {
        "name": "UPI PIN scam",
        "transcript": (
            "Please share your UPI PIN to receive your refund."
        ),
    },
    {
        "name": "Normal conversation",
        "transcript": (
            "Hello, your appointment is confirmed for tomorrow."
        ),
    },
]

for case in test_cases:
    result = detect_rule_based_risks(case["transcript"])

    print("\nTEST:", case["name"])
    print("Risk:", result["risk_level"])
    print("Tactics:", result["detected_tactics"])
    print("Evidence:", result["evidence"])
