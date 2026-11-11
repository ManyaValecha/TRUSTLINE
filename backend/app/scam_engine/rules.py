import re


SCAM_RULES = {
    "OTP Request": [
        r"\b(?:share|tell|send|provide|reveal|read out)\b.{0,35}\b(?:otp|one[- ]time password)\b",
        r"\b(?:otp|one[- ]time password)\b.{0,35}\b(?:share|tell|send|provide|reveal)\b",
        r"\b(?:otp|one[- ]time password)\s+(?:batao|bataye|bhejo)\b",
    ],
    "UPI PIN Request": [
        r"\b(?:share|tell|enter|provide)\b.{0,35}\bupi pin\b",
        r"\bupi pin\b.{0,35}\b(?:share|tell|enter|provide)\b",
    ],
    "Payment Pressure": [
        r"\b(?:transfer|send|pay)\b.{0,40}\b(?:money|funds|amount|rupees|rs\.?)\b",
        r"\bpay immediately\b",
    ],
    "Threats": [
        r"\b(?:account|card|service)\b.{0,40}\b(?:blocked|suspended|closed)\b",
        r"\b(?:arrest|police action|legal action)\b",
    ],
    "Secrecy": [
        r"\bdo not tell anyone\b",
        r"\bdon't tell anyone\b",
        r"\bkeep this secret\b",
        r"\bdo not disconnect\b",
    ],
    "Remote Access Request": [
        r"\b(?:install|download)\b.{0,40}\b(?:anydesk|teamviewer|remote access)\b",
        r"\bgive me remote access\b",
    ],
}



def is_protective_context(text: str, match_start: int) -> bool:
    preceding_text = text[max(0, match_start - 40):match_start].lower()
    preceding_text = preceding_text.rstrip()

    protective_phrases = (
        "never",
        "don't",
        "dont",
        "do not",
        "must not",
        "should not",
    )

    return any(
        preceding_text.endswith(phrase)
        for phrase in protective_phrases
    )

def detect_rule_based_risks(transcript: str) -> dict:
    if not transcript or not transcript.strip():
        return {
            "risk_level": "LOW",
            "detected_tactics": [],
            "evidence": [],
        }

    text = transcript.lower()

    detected_tactics = []
    evidence = []

    for tactic, patterns in SCAM_RULES.items():
        for pattern in patterns:
            match = re.search(pattern, text)

            if match:
                if (
                    tactic in ["OTP Request", "UPI PIN Request"]
                    and is_protective_context(text, match.start())
                ):
                    continue

                detected_tactics.append(tactic)
                evidence.append(match.group(0))
                break

    if "OTP Request" in detected_tactics or "UPI PIN Request" in detected_tactics:
        risk_level = "HIGH"
    elif len(detected_tactics) >= 2:
        risk_level = "HIGH"
    elif len(detected_tactics) == 1:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_level": risk_level,
        "detected_tactics": detected_tactics,
        "evidence": evidence,
    }
