from app.services.pipeline import combine_analysis


ai_result = {
    "risk_level": "LOW",
    "is_scam_likely": False,
    "detected_tactics": [],
    "evidence": [],
    "recommended_action": "No action needed",
    "explanation": "No suspicious behaviour detected.",
}

rule_result = {
    "risk_level": "HIGH",
    "detected_tactics": ["OTP Request"],
    "evidence": ["tell me the otp"],
}

result = combine_analysis(ai_result, rule_result)

print("COHERE RISK:", ai_result["risk_level"])
print("RULE ENGINE RISK:", rule_result["risk_level"])
print("FINAL TRUSTLINE RISK:", result["risk_level"])
print("SCAM LIKELY:", result["is_scam_likely"])
print("DETECTED TACTICS:", result["detected_tactics"])
print("RECOMMENDED ACTION:", result["recommended_action"])

assert result["risk_level"] == "HIGH"
assert result["is_scam_likely"] is True
assert "OTP Request" in result["detected_tactics"]

print("\nSUCCESS: Rules engine correctly overrode the LOW AI assessment!")
