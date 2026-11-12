"""Fast, offline tests for TRUSTLINE's deterministic behavior rules."""

import pytest

from app.scam_engine.rules import detect_rule_based_risks


@pytest.mark.parametrize(
    ("transcript", "expected"),
    [
        ("Please tell me the OTP immediately.", "OTP Request"),
        ("Refund ke liye apna UPI PIN share karo.", "UPI PIN Request"),
        ("Install AnyDesk and give me remote access.", "Remote Access Request"),
        ("You are under digital arrest. Do not disconnect.", "Digital Arrest Intimidation"),
        ("Pay the courier customs clearance fee immediately.", "Courier or Customs Demand"),
        ("This job needs a registration fee before joining.", "Investment or Job Lure"),
        ("Guaranteed returns if you deposit today.", "Investment or Job Lure"),
        ("Your son had an accident; transfer money now.", "Family Emergency Impersonation"),
        ("Install the APK sent to you to receive your parcel.", "Suspicious APK Request"),
    ],
)
def test_detects_behavioral_patterns(transcript: str, expected: str) -> None:
    result = detect_rule_based_risks(transcript)
    assert expected in result["detected_tactics"]
    assert result["risk_level"] in {"MEDIUM", "HIGH"}


@pytest.mark.parametrize(
    "transcript",
    [
        "Never share your OTP with anyone.",
        "अपना ओटीपी किसी को न बताएं।",
        "Do not share your UPI PIN with the caller.",
        "Scammers often ask victims to share an OTP; hang up and call your bank.",
        "I paid my electricity bill through UPI yesterday.",
        "The bank sent me an OTP and I entered it in the official app myself.",
        "Can you explain what an APK file is?",
    ],
)
def test_does_not_flag_protective_or_benign_context(transcript: str) -> None:
    result = detect_rule_based_risks(transcript)
    assert result["detected_tactics"] == []
    assert result["risk_level"] == "LOW"


def test_secrecy_demand_is_not_suppressed_as_a_protective_warning() -> None:
    result = detect_rule_based_risks("Do not tell your family about this bank case.")
    assert "Secrecy and Isolation" in result["detected_tactics"]


def test_patterns_do_not_join_requests_across_sentence_boundaries() -> None:
    result = detect_rule_based_risks(
        "Your funds will be frozen. Do not tell anyone about this warning."
    )
    assert "OTP Request" not in result["detected_tactics"]


def test_evidence_is_an_exact_transcript_span() -> None:
    transcript = "Bank caller said: please share the OTP right now."
    result = detect_rule_based_risks(transcript)
    signal = next(s for s in result["signals"] if s["category"] == "OTP Request")
    assert transcript[signal["start"]:signal["end"]] == signal["evidence"]
    assert signal["source"] == "deterministic_rule"
    assert signal["severity"] == "HIGH"


def test_signal_has_actionable_explanation_and_score_is_ordinal() -> None:
    result = detect_rule_based_risks("Send money right now.")
    assert result["signals"][0]["explanation"]
    assert result["signals"][0]["recommended_action"]
    assert result["score"] > 0
    assert result["uncertainty"] is None


def test_empty_transcript_is_explicitly_uncertain() -> None:
    result = detect_rule_based_risks(" \n ")
    assert result["risk_level"] == "LOW"
    assert result["signals"] == []
    assert result["uncertainty"]


@pytest.mark.parametrize(
    ("transcript", "expected"),
    [
        ("कॉल पर बोला: अपना ओटीपी मुझे अभी बताइए।", "OTP Request"),
        ("कॉल करने वाला कहता है: रिफंड के लिए अपना यूपीआई पिन बताइए।", "UPI PIN Request"),
        ("मैं पुलिस अधिकारी हूं, अभी पैसे भेजो वरना गिरफ्तार कर लूंगा।", "Authority Impersonation"),
        ("आज ही एनीडेस्क इंस्टॉल करो और स्क्रीन शेयर करो।", "Remote Access Request"),
        ("Aapka OTP mujhe abhi batao.", "OTP Request"),
        ("Refund ke liye apna UPI PIN mujhe batao.", "UPI PIN Request"),
        ("Banking password mujhe bhejo.", "Credential Request"),
        ("अपना बैंकिंग पासवर्ड मुझे भेजिए।", "Credential Request"),
        ("This is an officer calling from the police department.", "Authority Impersonation"),
        ("Main police department se officer bol raha hoon.", "Authority Impersonation"),
        ("Aaj fine nahi diya to aapko arrest kiya jayega.", "Threats and Coercion"),
        ("Digital arrest case hai, paise abhi bhejo warna arrest karenge.", "Payment Pressure"),
        ("AnyDesk install karke mujhe remote access do.", "Remote Access Request"),
        ("This job guarantees income; pay the registration deposit first.", "Investment or Job Lure"),
        ("इस नौकरी में पक्की कमाई है, पहले पंजीकरण शुल्क जमा करें।", "Investment or Job Lure"),
        ("Pay a small fee to receive your refund.", "Refund Manipulation"),
        ("रिफंड पाने के लिए पहले एक शुल्क दीजिए।", "Refund Manipulation"),
        ("Your account बंद हो जाएगा, अभी OTP बताइए.", "OTP Request"),
    ],
)
def test_detects_hindi_romanized_and_mixed_language_requests(transcript: str, expected: str) -> None:
    result = detect_rule_based_risks(transcript)
    assert expected in result["detected_tactics"]
    for signal in result["signals"]:
        assert transcript[signal["start"]:signal["end"]] == signal["evidence"]


@pytest.mark.parametrize(
    "transcript",
    [
        "ओटीपी किसी को मत बताइए।",
        "यूपीआई पिन किसी के साथ साझा न करें।",
        "Our security team reminded staff not to install unknown APK files.",
        "Aap apna OTP kisi ko mat batao.",
        "Security team ne unknown APK install na karne ko kaha.",
        "आईटी टीम ने सामने से समस्या ठीक की, मैंने रिमोट ऐप इंस्टॉल नहीं किया।",
        "Refund credit hota hai, bhejne ke liye kisi ko aapka UPI PIN nahi chahiye.",
        "Refund process mein hai, fee dene ya PIN share karne ki zarurat nahi.",
        "Aapka job interview Tuesday ko hai, koi registration fee nahi hai.",
        "Police officer ने केस अपडेट दिया; शिकायतकर्ता को स्टेशन जाना है।",
    ],
)
def test_context_suppresses_hindi_warnings_and_benign_mentions(transcript: str) -> None:
    result = detect_rule_based_risks(transcript)
    assert result["detected_tactics"] == []


def test_independent_coercive_behaviors_can_reach_critical() -> None:
    result = detect_rule_based_risks(
        "I am calling from the police. You will be arrested unless you transfer money now. "
        "Do not contact your family or bank."
    )
    assert result["risk_level"] == "CRITICAL"


def test_weak_single_indicator_is_uncertain_not_critical() -> None:
    result = detect_rule_based_risks("Guaranteed returns if a friend invests.")
    assert result["risk_level"] == "MEDIUM"
    assert result["uncertainty"]


def test_duplicated_patterns_do_not_inflate_score() -> None:
    single = detect_rule_based_risks("Please tell me the OTP immediately.")
    repeated = detect_rule_based_risks("Please tell me the OTP immediately. OTP request: share the OTP now.")
    assert repeated["score"] <= single["score"] * 2
