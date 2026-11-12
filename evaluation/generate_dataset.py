"""Generate an authored, synthetic text-only evaluation corpus deterministically."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "dataset" / "trustline-synthetic-v1.jsonl"
LANGUAGES = ("English", "Hindi", "Hinglish")

# Each family is kept wholly in one split. The transcript variants vary the
# surrounding call framing while retaining the same authored behavior phrase.
SCAM_CASES = [
    ("OTP Request", (
        "Tell me the OTP immediately.",
        "अपना ओटीपी मुझे अभी बताइए।",
        "Apna OTP mujhe abhi batao.",
    )),
    ("UPI PIN Request", (
        "Share your UPI PIN to receive the refund.",
        "रिफंड पाने के लिए अपना यूपीआई पिन बताइए।",
        "Refund ke liye apna UPI PIN batao.",
    )),
    ("Credential Request", (
        "Send me your banking password now.",
        "अपना बैंकिंग पासवर्ड मुझे भेजिए।",
        "Banking password mujhe bhejo.",
    )),
    ("Digital Arrest Intimidation", (
        "You are under digital arrest; stay on this call.",
        "आप डिजिटल गिरफ्तारी में हैं, कॉल पर बने रहिए।",
        "Aap digital arrest mein ho, call par bane raho.",
    )),
    ("Authority Impersonation", (
        "This is an officer calling from the police department.",
        "मैं पुलिस विभाग से अधिकारी बोल रहा हूँ।",
        "Main police department se officer bol raha hoon.",
    )),
    ("Bank or KYC Impersonation", (
        "Your bank account is blocked; verify your KYC immediately.",
        "आपका बैंक खाता बंद है, अभी केवाईसी अपडेट करें।",
        "Aapka bank account block hai, abhi KYC update karo.",
    )),
    ("Payment Pressure", (
        "Transfer the money right now to keep your account open.",
        "खाता चालू रखने के लिए अभी पैसे ट्रांसफर करें।",
        "Account chalu rakhne ke liye abhi paise transfer karo.",
    )),
    ("Threats and Coercion", (
        "You will be arrested unless you pay this fine today.",
        "आज जुर्माना नहीं दिया तो आपको गिरफ्तार किया जाएगा।",
        "Aaj fine nahi diya to aapko arrest kiya jayega.",
    )),
    ("Secrecy and Isolation", (
        "Do not tell your family or contact the bank.",
        "अपने परिवार को मत बताइए और बैंक से संपर्क मत कीजिए।",
        "Family ko mat batana aur bank ko call mat karna.",
    )),
    ("Remote Access Request", (
        "Install AnyDesk and give me remote access.",
        "एनीडेस्क इंस्टॉल करके मुझे रिमोट एक्सेस दीजिए।",
        "AnyDesk install karke mujhe remote access do.",
    )),
    ("Suspicious APK Request", (
        "Download this APK file and install it to verify your account.",
        "खाता सत्यापित करने के लिए यह एपीके इंस्टॉल करें।",
        "Account verify karne ke liye yeh APK install karo.",
    )),
    ("Courier or Customs Demand", (
        "Your parcel is held by customs; pay the clearance fee now.",
        "आपका पार्सल कस्टम में रुका है, अभी शुल्क जमा करें।",
        "Aapka parcel customs mein ruka hai, abhi clearance fee pay karo.",
    )),
    ("Investment or Job Lure", (
        "This job guarantees income; pay the registration deposit first.",
        "इस नौकरी में पक्की कमाई है, पहले पंजीकरण शुल्क जमा करें।",
        "Is job mein guaranteed income hai, pehle registration fee do.",
    )),
    ("Refund Manipulation", (
        "Pay a small fee to receive your refund.",
        "रिफंड पाने के लिए पहले एक शुल्क दीजिए।",
        "Refund lene ke liye pehle ek fee pay karo.",
    )),
    ("Family Emergency Impersonation", (
        "Your son had an accident; transfer money to the hospital now.",
        "आपके बेटे का हादसा हुआ है, अस्पताल में अभी पैसे भेजिए।",
        "Aapke bete ka accident hua hai, hospital mein abhi paise bhejo.",
    )),
]

LEGITIMATE_CASES = [
    ("security_awareness", (
        "Never share your OTP with anyone, even someone claiming to be your bank.",
        "अपना ओटीपी किसी को न बताएं, चाहे वह बैंक से होने का दावा करे।",
        "Apna OTP kisi ko mat batana, chahe woh bank se bol raha ho.",
    )),
    ("routine_upi_payment", (
        "I paid the electricity bill through UPI in the official app.",
        "मैंने आधिकारिक ऐप से बिजली का बिल यूपीआई द्वारा भरा।",
        "Maine official app se electricity bill UPI se pay kiya.",
    )),
    ("bank_otp_notice", (
        "The bank sent an OTP; I entered it myself in the official app.",
        "बैंक का ओटीपी मैंने खुद आधिकारिक ऐप में डाला।",
        "Bank ka OTP maine khud official app mein enter kiya.",
    )),
    ("kyc_appointment", (
        "Please visit the branch next week to update your KYC documents.",
        "केवाईसी दस्तावेज़ अपडेट करने के लिए अगले सप्ताह शाखा आएं।",
        "KYC documents update karne ke liye agle hafte branch aaiye.",
    )),
    ("family_transfer", (
        "I sent my sister money for the groceries we planned to buy.",
        "हमने जो सामान लेने की योजना बनाई थी उसके लिए मैंने बहन को पैसे भेजे।",
        "Jo grocery leni thi uske liye maine apni sister ko paise bheje.",
    )),
    ("work_payroll", (
        "Payroll will transfer your salary to the account on file tomorrow.",
        "वेतन विभाग कल दर्ज खाते में आपकी तनख्वाह भेजेगा।",
        "Payroll kal file wale account mein salary transfer karega.",
    )),
    ("courier_tracking", (
        "Your parcel is out for delivery; check the tracking page for updates.",
        "आपका पार्सल डिलीवरी के लिए निकल गया है, ट्रैकिंग देखें।",
        "Aapka parcel delivery ke liye nikal gaya, tracking check kar lena.",
    )),
    ("job_interview", (
        "Your job interview is scheduled for Tuesday; there is no registration fee.",
        "आपका नौकरी का साक्षात्कार मंगलवार को है, कोई पंजीकरण शुल्क नहीं है।",
        "Aapka job interview Tuesday ko hai, koi registration fee nahi hai.",
    )),
    ("investment_risk_notice", (
        "No investment return is guaranteed; read the documents before deciding.",
        "किसी निवेश का लाभ निश्चित नहीं होता, निर्णय से पहले दस्तावेज़ पढ़ें।",
        "Koi investment return guaranteed nahi hota, decide karne se pehle padho.",
    )),
    ("refund_status", (
        "Your refund is processing; you do not need to pay or share a PIN.",
        "आपका रिफंड आ रहा है, आपको शुल्क देने या पिन बताने की ज़रूरत नहीं।",
        "Refund process mein hai, fee dene ya PIN share karne ki zarurat nahi.",
    )),
    ("hospital_appointment", (
        "Your clinic appointment is tomorrow; payment is due at reception.",
        "आपकी क्लिनिक अपॉइंटमेंट कल है, भुगतान रिसेप्शन पर होगा।",
        "Aapki clinic appointment kal hai, payment reception par hoga.",
    )),
    ("police_case_update", (
        "The police officer asked me to visit the station for a routine statement.",
        "पुलिस अधिकारी ने सामान्य बयान के लिए थाने आने को कहा।",
        "Police officer ne routine statement ke liye station aane ko kaha.",
    )),
    ("otp_security_class", (
        "We are teaching the class why callers should never ask for an OTP.",
        "हम कक्षा में समझा रहे हैं कि कॉल करने वाले को ओटीपी नहीं मांगना चाहिए।",
        "Class mein samjha rahe hain ki caller ko OTP kabhi nahi mangna chahiye.",
    )),
    ("upi_refund_safety", (
        "A refund arrives as a credit; nobody needs your UPI PIN to send it.",
        "रिफंड खाते में आता है, इसे भेजने के लिए किसी को आपका यूपीआई पिन नहीं चाहिए।",
        "Refund credit hota hai, bhejne ke liye kisi ko aapka UPI PIN nahi chahiye.",
    )),
    ("family_wellbeing", (
        "I called my father to check he reached home safely after work.",
        "मैंने पिता को फोन करके पूछा कि वे काम के बाद सुरक्षित घर पहुंचे या नहीं।",
        "Maine papa ko call karke poocha ki woh kaam ke baad safely ghar pahunche.",
    )),
    ("workplace_security", (
        "Our security team reminded staff not to install unknown APK files.",
        "हमारी सुरक्षा टीम ने अज्ञात एपीके इंस्टॉल न करने की सलाह दी।",
        "Security team ne unknown APK install na karne ko kaha.",
    )),
    ("remote_support", (
        "The IT desk fixed the issue in person; I did not install remote access software.",
        "आईटी टीम ने सामने से समस्या ठीक की, मैंने रिमोट ऐप इंस्टॉल नहीं किया।",
        "IT desk ne saamne issue fix kiya, maine remote access app install nahi ki.",
    )),
    ("customs_information", (
        "The customs website lists the official process for checking a parcel.",
        "कस्टम की वेबसाइट पार्सल जांचने की आधिकारिक प्रक्रिया बताती है।",
        "Customs website parcel check karne ka official process batati hai.",
    )),
    ("routine_account_alert", (
        "Your bank app shows the card payment you made at the supermarket.",
        "बैंक ऐप में सुपरमार्केट पर किए गए कार्ड भुगतान की जानकारी है।",
        "Bank app mein supermarket wali card payment dikh rahi hai.",
    )),
    ("family_emergency_drill", (
        "Our family agreed to call each other before sending money during an emergency.",
        "हमारे परिवार ने तय किया है कि आपात स्थिति में पैसे भेजने से पहले फोन करेंगे।",
        "Family mein decide kiya hai emergency mein paise bhejne se pehle call karenge.",
    )),
]


def _split_for_family(family: str) -> str:
    # Keep every language/variant of a related scenario in one split.
    bucket = int(hashlib.sha256(family.encode()).hexdigest()[:8], 16) % 5
    return "held_out_test" if bucket == 0 else "development"


def build_records() -> list[dict]:
    records: list[dict] = []
    framings = (
        ("The caller says: ", "कॉल करने वाला कहता है: ", "Caller bolta hai: "),
        ("On the call, I hear: ", "कॉल पर मैंने सुना: ", "Call par maine suna: "),
        ("The voice on the phone says: ", "फोन पर आवाज़ कहती है: ", "Phone par awaaz bolti hai: "),
        ("This was said during a call: ", "कॉल के दौरान कहा गया: ", "Call ke dauran bola gaya: "),
    )
    for category_index, (category, phrases) in enumerate(SCAM_CASES):
        family = f"scam-{category_index:02d}"
        for variant in range(8):
            language_index = (variant + category_index) % 3
            frame = framings[variant % len(framings)][language_index]
            transcript = frame + phrases[language_index]
            record_id = f"S{category_index + 1:02d}-{variant + 1:02d}"
            records.append({
                "id": record_id,
                "label": "scam",
                "category": category,
                "language": LANGUAGES[language_index],
                "transcript": transcript,
                "audio_provenance": "synthetic_text_only_no_audio",
                "permission": "not_applicable_synthetic",
                "scenario_family": family,
                "split": _split_for_family(family),
                "expected_warning_signals": [category],
                "expected_safety_action": "Stop, do not share credentials or send money, and verify using a trusted contact channel.",
            })

    safe_framings = (
        ("A colleague says: ", "सहकर्मी कहता है: ", "Colleague bolta hai: "),
        ("In a routine conversation: ", "सामान्य बातचीत में: ", "Normal baat mein: "),
        ("The family discussion was: ", "परिवार की बातचीत थी: ", "Family ki baat thi: "),
        ("The notice explains: ", "सूचना में बताया गया: ", "Notice mein bataya: "),
        ("I heard this at work: ", "मैंने काम पर यह सुना: ", "Office mein maine suna: "),
    )
    for topic_index, (topic, phrases) in enumerate(LEGITIMATE_CASES):
        family = f"legitimate-{topic}"
        for variant in range(5):
            language_index = (variant + topic_index) % 3
            frame = safe_framings[variant][language_index]
            transcript = frame + phrases[language_index]
            record_id = f"L{topic_index + 1:02d}-{variant + 1:02d}"
            records.append({
                "id": record_id,
                "label": "legitimate",
                "category": topic,
                "language": LANGUAGES[language_index],
                "transcript": transcript,
                "audio_provenance": "synthetic_text_only_no_audio",
                "permission": "not_applicable_synthetic",
                "scenario_family": family,
                "split": _split_for_family(family),
                "expected_warning_signals": [],
                "expected_safety_action": "No rule warning expected; verify any unexpected request independently.",
            })
    return records


def main() -> None:
    records = build_records()
    assert len(records) == 220, f"Expected 220 records; created {len(records)}"
    assert len({record["id"] for record in records}) == len(records)
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATASET_PATH.write_text(
        "".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records),
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} synthetic text records to {DATASET_PATH}")


if __name__ == "__main__":
    main()
