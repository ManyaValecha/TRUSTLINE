"""Conservative, explainable rules for suspicious conversation behaviour.

Rules are indicators for a human to review, not a fraud verdict.  The score
is an ordinal rule weight (not a probability); callers should use the risk
band and exact transcript spans rather than presenting it as calibrated.
"""

import re
from typing import Any

from app.schemas import RuleAnalysisResult

# Each rule requires an action/request shape, reducing matches on a topic word
# alone. Patterns include common English and Hinglish phrasing.
SCAM_RULES: dict[str, tuple[str, ...]] = {
    "OTP Request": (
        r"\b(?:share|tell|send|provide|reveal|read(?:\s+out)?|give)\b[^.!?;\n]{0,45}\b(?:otp|one[- ]time password|verification code)\b",
        r"\b(?:otp|one[- ]time password|verification code)\b[^.!?;\n]{0,35}\b(?:share|tell|send|provide|reveal|read|give)\b",
        r"\b(?:otp|code)\s+(?:batao|bataye|bhejo|share karo)\b",
        r"(?:ओटीपी|OTP|एक\s*बार\s*का\s*पासवर्ड|सत्यापन\s*कोड)[^.!?;\n]{0,35}(?:बताओ|बताइए|बताएं|बताना|साझा\s*करो|भेजो|भेजिए|पढ़कर\s*सुनाओ|पढ़कर\s*सुनाओ)",
        r"(?:बताओ|बताइए|बताएं|बताना|साझा\s*करो|भेजो|भेजिए|पढ़कर\s*सुनाओ|पढ़कर\s*सुनाओ)[^.!?;\n]{0,35}(?:ओटीपी|एक\s*बार\s*का\s*पासवर्ड|सत्यापन\s*कोड)",
        r"\b(?:otp|verification\s*code)\b[^.!?;\n]{0,35}\b(?:(?:mujhe|abhi|please)\s+){0,2}(?:batao|batayiye|bataye|bhejo|bhejiye|padhkar\s+sunao|share\s+karo)\b",
        r"\b(?:batao|batayiye|bataye|bhejo|bhejiye|share\s+karo)\b[^.!?;\n]{0,35}\b(?:apna\s+)?(?:otp|verification\s*code)\b",
    ),
    "UPI PIN Request": (
        r"\b(?:share|tell|enter|provide|reveal|give)\b[^.!?;\n]{0,40}\bupi\s+pin\b",
        r"\bupi\s+pin\b[^.!?;\n]{0,35}\b(?:share|tell|enter|provide|reveal|give)\b",
        r"\bupi\s+pin\s+(?:batao|bhejo|share karo)\b",
        r"(?:यूपीआई\s*पिन|यूपीआई\s*का\s*पिन|पिन)[^.!?;\n]{0,30}(?:बताओ|बताइए|बताएं|साझा\s*करो|भेजो|दर्ज\s*करो)",
        r"(?:बताओ|बताइए|बताएं|साझा\s*करो|भेजो|दर्ज\s*करो)[^.!?;\n]{0,30}(?:यूपीआई\s*पिन|यूपीआई\s*का\s*पिन)",
        r"\b(?:upi\s+pin|pin)\b[^.!?;\n]{0,30}\b(?:batao|batayiye|bhejo|share\s+karo|darj\s+karo)\b",
    ),
    "Credential Request": (
        r"\b(?:share|tell|send|provide|reveal|give)\b[^.!?;\n]{0,40}\b(?:password|passcode|cvv|card number|login details)\b",
        r"\b(?:password|passcode|cvv|card number|login details)\b[^.!?;\n]{0,30}\b(?:share|tell|send|provide|reveal|give)\b",
        r"(?:पासवर्ड|गुप्त\s*कोड|कार्ड\s*नंबर|सीवीवी)[^.!?;\n]{0,35}(?:बताओ|बताइए|भेजो|भेजिए|साझा\s*करो)",
        r"\b(?:password|passcode|cvv|login\s+details)\b[^.!?;\n]{0,30}\b(?:mujhe\s+)?(?:batao|batayiye|bhejo|share\s+karo)\b",
    ),
    "Digital Arrest Intimidation": (
        r"\b(?:digital arrest|under digital arrest)\b",
        r"\b(?:stay|remain|keep)\s+(?:on )?(?:the )?call\b[^.!?;\n]{0,45}\b(?:police|arrest|case)\b",
        r"(?:डिजिटल\s*अरेस्ट|डिजिटल\s*गिरफ्तारी|गिरफ्तार\s*करने|गिरफ़्तार\s*करने)[^.!?;\n]{0,45}(?:कॉल|फोन|लाइन|वीडियो|मामला|पुलिस)",
        r"\b(?:digital\s+arrest|arrest\s+kar(?:ne|enge)|giraftaar\s+kar(?:enge|dunga))\b",
    ),
    "Authority Impersonation": (
        r"\b(?:i am|this is)\s+(?:calling )?(?:from|the)\s+(?:police|cyber crime|customs|court|rbi|bank fraud department)\b",
        r"(?:मैं|हम)\s*(?:पुलिस|साइबर\s*क्राइम|सीबीआई|कस्टम्स|कोर्ट|आरबीआई|बैंक\s*अधिकारी)(?:\s*(?:से|का|की|में))?",
        r"\b(?:police|cyber\s*crime|customs|court|rbi|bank)\s+(?:officer|department)\b[^.!?;\n]{0,40}\b(?:i am|this is|calling from)\b",
        r"\bthis is an?\s+(?:police\s+)?officer\s+calling\s+from\s+(?:the\s+)?(?:police|cyber\s+crime|customs|court|bank)\s+department\b",
        r"\b(?:main|mai)\s+(?:police|cyber\s*crime|customs|court|bank)(?:\s+department)?\s+(?:se|ka|ki)\s+(?:bol|baat|officer)\b",
    ),
    "Bank or KYC Impersonation": (
        r"\b(?:bank|kyc)\b[^.!?;\n]{0,45}\b(?:verify|update|reactivate|unblock)\b[^.!?;\n]{0,35}\b(?:now|immediately|account|card|details)\b",
        r"\b(?:account|card)\b[^.!?;\n]{0,40}\b(?:blocked|suspended|frozen)\b[^.!?;\n]{0,35}\b(?:unless|pay|verify|immediately|otherwise)\b",
        r"(?:बैंक|केवाईसी|खाता)[^.!?;\n]{0,40}(?:बंद|ब्लॉक|फ्रीज़|जमा|अपडेट|सत्यापित)[^.!?;\n]{0,30}(?:अभी|तुरंत|वरना|नहीं तो)",
        r"\b(?:bank|kyc|account)\b[^.!?;\n]{0,35}\b(?:block|band|freeze|update)\b[^.!?;\n]{0,25}\b(?:abhi|turant|warna|nahito)\b",
    ),
    "Payment Pressure": (
        r"\b(?:transfer|send|pay|deposit)\b[^.!?;\n]{0,45}\b(?:money|funds|amount|rupees|rs\.?|₹|upi)\b",
        r"\b(?:pay|transfer|send)\s+(?:it )?(?:now|immediately|right now|within \d+ minutes)\b",
        r"\b(?:paise|paisa|payment)\s+(?:bhejo|karo|transfer karo)\b",
        r"(?:पैसे|रुपये|रकम|जुर्माना|फीस)[^.!?;\n]{0,35}(?:अभी|तुरंत|जमा|भेजो|भेजिए|ट्रांसफर|देना|करो|करिए)",
        r"(?:भेजो|भेजिए|जमा\s*करो|ट्रांसफर\s*करो|देना\s*होगा)[^.!?;\n]{0,30}(?:पैसे|रुपये|रकम|जुर्माना|फीस)",
        r"\b(?:paise|paisa|rupaye|rakam|fine|fees?)\b[^.!?;\n]{0,30}\b(?:abhi|turant|bhejo|bhejiye|jama|transfer|do)\b",
        r"\b(?:bhejo|bhejiye|jama\s+karo|transfer\s+karo)\b[^.!?;\n]{0,25}\b(?:paise|paisa|rupaye|rakam|fine|fees?)\b",
    ),
    "Threats and Coercion": (
        r"\b(?:you will be|you are under threat of)\s+(?:arrested|arrest|jailed)\b",
        r"\b(?:arrest|police action|legal action)\b[^.!?;\n]{0,45}\b(?:unless|if you do not|agar nahi)\b",
        r"\b(?:account|card|service)\b[^.!?;\n]{0,35}\b(?:blocked|suspended|closed|frozen)\b[^.!?;\n]{0,35}\b(?:unless|pay|verify|immediately|otherwise|or else)\b",
        r"(?:गिरफ्तार|गिरफ़्तार|जेल|पुलिस\s*कार्रवाई|खाता\s*बंद)[^.!?;\n]{0,45}(?:करेंगे|होगा|नहीं\s*तो|वरना|अगर\s*नहीं|नुकसान)",
        r"\b(?:arrest|jail|police\s+action|account\s+block)\b[^.!?;\n]{0,35}\b(?:warna|nahito|nahi\s+to|agar\s+nahi|otherwise)\b",
        r"(?:जुर्माना|फाइन|भुगतान|रकम)[^.!?;\n]{0,30}नहीं\s*(?:दिया|भरा|किया)[^.!?;\n]{0,35}(?:गिरफ्तार|गिरफ़्तार|जेल|पुलिस\s*कार्रवाई)",
        r"\b(?:fine|payment|amount)\b[^.!?;\n]{0,25}\b(?:nahi|not)\s+(?:diya|bhara|paid)\b[^.!?;\n]{0,35}\b(?:arrest|jail|police\s+action)\b",
    ),
    "Urgency Pressure": (
        r"\b(?:within \d+ minutes?|right now|immediately|urgent|today only)\b[^.!?;\n]{0,55}\b(?:pay|transfer|share|send|verify|install)\b",
        r"\b(?:pay|transfer|share|send|verify|install)\b[^.!?;\n]{0,45}\b(?:immediately|right now|within \d+ minutes?|today only)\b",
        r"(?:अभी|तुरंत|आज\s*ही|कुछ\s*मिनटों\s*में)[^.!?;\n]{0,35}(?:भेजो|भेजिए|बताओ|साझा|जमा|ट्रांसफर|इंस्टॉल|भुगतान)",
        r"(?:भेजो|भेजिए|बताओ|साझा|जमा|ट्रांसफर|इंस्टॉल|भुगतान)[^.!?;\n]{0,35}(?:अभी|तुरंत|आज\s*ही|कुछ\s*मिनटों\s*में)",
        r"\b(?:abhi|turant|aaj\s+hi|jaldi)\b[^.!?;\n]{0,35}\b(?:bhejo|batao|share|jama|transfer|install|payment)\b",
    ),
    "Secrecy and Isolation": (
        r"\b(?:do not|don't|dont|never)\s+(?:tell|inform|contact|call)\s+(?:anyone|your family|the bank|the police)\b",
        r"\bkeep this (?:secret|confidential)\b",
        r"\bdo not disconnect\b",
        r"(?:परिवार|घरवालों|बैंक|पुलिस)[^.!?;\n]{0,25}(?:मत\s*बताओ|नहीं\s*बताएं|मत\s*कहना|संपर्क\s*मत|फोन\s*मत)",
        r"(?:मत\s*बताओ|नहीं\s*बताएं|मत\s*कहना|संपर्क\s*मत|फोन\s*मत)[^.!?;\n]{0,25}(?:परिवार|घरवालों|बैंक|पुलिस)",
        r"\b(?:gharwalo|parivaar|bank|police)\b[^.!?;\n]{0,25}\b(?:mat\s+batao|mat\s+batana|call\s+mat|phone\s+mat)\b",
    ),
    "Remote Access Request": (
        r"\b(?:install|download)\b[^.!?;\n]{0,45}\b(?:anydesk|teamviewer|quick support|remote access app)\b",
        r"\b(?:give|grant) me remote access\b",
        r"(?:एनीडेस्क|टीमव्यूअर|क्विक\s*सपोर्ट|रिमोट\s*ऐप)[^.!?;\n]{0,30}(?:इंस्टॉल|डाउनलोड|खोलो|करो)",
        r"\b(?:install|download)\b[^.!?;\n]{0,25}\b(?:anydesk|teamviewer|quick\s+support|remote\s+app)\b",
        r"\b(?:anydesk|teamviewer|quick\s+support)\b[^.!?;\n]{0,25}\b(?:install\s+karo|download\s+karo|open\s+karo)\b",
        r"\b(?:anydesk|teamviewer|quick\s+support)\b[^.!?;\n]{0,35}\binstall\s+karke\b[^.!?;\n]{0,25}\b(?:remote\s+access|screen\s+share|access\s+do)\b",
    ),
    "Suspicious APK Request": (
        r"\b(?:install|download|open)\b[^.!?;\n]{0,45}\b(?:apk|application package)\b",
        r"\b(?:apk|application package)\b[^.!?;\n]{0,35}\b(?:install|download)\b",
        r"(?:एपीके|ऐप)[^.!?;\n]{0,25}(?:इंस्टॉल|डाउनलोड|खोलो)",
        r"\b(?:apk|application)\b[^.!?;\n]{0,25}\b(?:install\s+karo|download\s+karo|open\s+karo)\b",
    ),
    "Courier or Customs Demand": (
        r"\b(?:courier|parcel|customs)\b[^.!?;\n]{0,60}\b(?:pay|transfer|deposit|fine|clearance fee)\b",
        r"\b(?:parcel|package)\b[^.!?;\n]{0,45}\b(?:drugs|passport|illegal items)\b",
        r"(?:कूरियर|पार्सल|कस्टम्स)[^.!?;\n]{0,45}(?:जुर्माना|फीस|पैसे|भुगतान|ड्रग्स|गैरकानूनी)",
        r"\b(?:courier|parcel|customs)\b[^.!?;\n]{0,40}\b(?:fine|fees?|paise|pay|transfer|drugs|illegal)\b",
    ),
    "Investment or Job Lure": (
        r"\b(?:guaranteed|assured)\s+(?:returns?|profit|income)\b",
        r"\b(?:job|work from home)\b[^.!?;\n]{0,45}\b(?:registration fee|pay upfront|deposit)\b",
        r"(?:नौकरी|जॉब|घर\s*से\s*काम)[^.!?;\n]{0,35}(?:रजिस्ट्रेशन\s*फीस|पहले\s*पैसे|जमा\s*करो|भुगतान)",
        r"(?:नौकरी|जॉब)[^.!?;\n]{0,35}(?:पक्की\s*कमाई|गारंटी\s*वाली\s*आय)[^.!?;\n]{0,35}(?:पंजीकरण\s*शुल्क|शुल्क|जमा\s*करें|जमा\s*करिए)",
        r"\b(?:pay|deposit)\b[^.!?;\n]{0,30}\b(?:registration\s+deposit|registration\s+fee)\b",
        r"\b(?:job|work\s+from\s+home)\b[^.!?;\n]{0,30}\b(?:registration\s+fee|pay\s+upfront|deposit\s+first)\b",
    ),
    "Refund Manipulation": (
        r"\b(?:refund|reversal)\b[^.!?;\n]{0,55}\b(?:pay|transfer|share|enter|upi pin|otp)\b",
        r"\b(?:pay|transfer|share|enter)\b[^.!?;\n]{0,45}\b(?:to receive|for your)\s+(?:your\s+)?(?:refund|reversal)\b",
        r"(?:रिफंड|पैसे\s*वापस)[^.!?;\n]{0,35}(?:फीस|शुल्क|पिन|ओटीपी|भेजो|बताओ|दर्ज|जमा)",
        r"\b(?:refund|reversal)\b[^.!?;\n]{0,30}\b(?:fee|pin|otp|send|tell|pay|enter)\b",
    ),
    "Family Emergency Impersonation": (
        r"\b(?:your son|your daughter|your child|your mother|your father)\b[^.!?;\n]{0,60}\b(?:accident|arrested|hospital|urgent|money)\b",
        r"\b(?:accident|hospital)\b[^.!?;\n]{0,55}\b(?:send|transfer|pay)\b[^.!?;\n]{0,35}\b(?:money|funds|amount)\b",
        r"(?:आपके|तुम्हारे)\s*(?:बेटे|बेटी|बच्चे|मां|पिता)[^.!?;\n]{0,45}(?:दुर्घटना|अस्पताल|गिरफ्तार|पैसे|खतरे)",
        r"(?:दुर्घटना|अस्पताल|खतरे\s*में)[^.!?;\n]{0,40}(?:पैसे|रुपये)[^.!?;\n]{0,25}(?:भेजो|भेजिए|ट्रांसफर|अभी)",
        r"\b(?:beta|beti|bachcha|maa|pita)\b[^.!?;\n]{0,40}\b(?:accident|hospital|danger|arrest)\b[^.!?;\n]{0,35}\b(?:paise|rupaye|bhejo|transfer)\b",
    ),
}

HIGH_RISK_TACTICS = {"OTP Request", "UPI PIN Request", "Credential Request"}
HIGH_SEVERITY_TACTICS = HIGH_RISK_TACTICS | {
    "Digital Arrest Intimidation", "Secrecy and Isolation", "Remote Access Request",
    "Suspicious APK Request", "Threats and Coercion",
}
PROTECTIVE_PREFIX = re.compile(
    r"(?:\bnever\b|\bdo not\b|\bdon't\b|\bdont\b|\bmust not\b|\bshould not\b|"
    r"\bnot to\b|\bavoid\b|\bmat\b|\bnahi\b|\bna\s+share\b)[^.!?;:]{0,100}$",
    re.IGNORECASE,
)
EDUCATIONAL_CONTEXT = re.compile(
    r"\b(?:scammers?|fraudsters?|scam calls?|fraud calls?|safety advice|warning|"
    r"never trust|recognize a scam|how to avoid)\b[^.!?;:]{0,100}$",
    re.IGNORECASE,
)


def _sentence_prefix(text: str, start: int) -> str:
    boundary = max(text.rfind(mark, 0, start) for mark in ".!?;:\n")
    return text[boundary + 1:start]


def _sentence_context(text: str, start: int, end: int) -> tuple[str, int]:
    """Return the containing sentence and its original transcript offset."""
    left = max(text.rfind(mark, 0, start) for mark in ".!?;:\n") + 1
    rights = [text.find(mark, end) for mark in ".!?;:\n"]
    rights = [position for position in rights if position >= 0]
    right = min(rights) if rights else len(text)
    return text[left:right], left


def _is_negated_or_awareness_context(tactic: str, context: str, candidate_start: int, context_start: int) -> bool:
    """Suppress clear warnings and negation while retaining active scam requests."""
    lower = context.lower()
    prefix = context[:candidate_start - context_start]
    if EDUCATIONAL_CONTEXT.search(prefix):
        return True

    credentials = tactic in {"OTP Request", "UPI PIN Request", "Credential Request"}
    install = tactic in {"Remote Access Request", "Suspicious APK Request"}
    money = tactic in {"Payment Pressure", "Investment or Job Lure", "Refund Manipulation", "Courier or Customs Demand"}
    if credentials and re.search(r"(?:\bnever\b|\bdo not\b|\bdon't\b|\bmust not\b|\bshould not\b|नहीं|मत|(?:^|\s)न(?:\s|$)|कभी\s+भी|mat\s+|nahi\s+)", lower):
        return True
    if install and (re.search(r"(?:\bdo not\b|\bdon't\b|\bnot to\b|\bnever\b|मत\s*|नहीं\s*|mat\s+|nahi\s+).{0,35}(?:install|download|open|इंस्टॉल|डाउनलोड|खोल)", lower)
                    or re.search(r"(?:install|download|open|इंस्टॉल|डाउनलोड|खोल).{0,24}(?:\bnot\b|\bna\b|\bnahi\b|न\s*(?:करने|करें|करना)|नहीं\s*(?:किया|करने|करें|करना))", lower)):
        return True
    if money and (re.search(r"(?:\bno\b|\bnot\b|\bwithout\b|\bdoesn't\b|\bdon't\b|नहीं|बिना).{0,35}(?:fee|payment|pay|share|transfer|फीस|भुगतान|पैसे|upi\s+pin|pin|otp|पिन|ओटीपी)", lower)
                  or re.search(r"(?:fee|payment|pay|share|transfer|फीस|भुगतान|पैसे|upi\s+pin|pin|otp|पिन|ओटीपी).{0,45}(?:\bno\b|\bnot\b|\bnahi\b|\bmat\b|नहीं|जरूरत\s+नहीं|आवश्यक\s+नहीं|nahi\s+chahiye)", lower)):
        return True
    return False


def is_protective_context(text: str, match_start: int) -> bool:
    """True when the action is negated or appears in a clear safety sentence."""
    prefix = _sentence_prefix(text.lower(), match_start)
    return bool(PROTECTIVE_PREFIX.search(prefix) or EDUCATIONAL_CONTEXT.search(prefix))


def _severity(tactic: str) -> str:
    if tactic in HIGH_SEVERITY_TACTICS:
        return "HIGH"
    if tactic in {
        "Payment Pressure", "Threats and Coercion", "Urgency Pressure",
        "Authority Impersonation", "Bank or KYC Impersonation",
        "Courier or Customs Demand", "Investment or Job Lure",
        "Refund Manipulation", "Family Emergency Impersonation",
    }:
        return "MEDIUM"
    return "LOW"


def detect_rule_based_risks(transcript: str) -> dict[str, Any]:
    """Return backwards-compatible summary plus verifiable, structured signals."""
    if not transcript or not transcript.strip():
        return RuleAnalysisResult.model_validate({
            "risk_level": "LOW",
            "detected_tactics": [],
            "evidence": [],
            "signals": [],
            "uncertainty": "No transcript text was available for rule analysis.",
            "score": 0,
        }).model_dump()

    signals: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for tactic, patterns in SCAM_RULES.items():
        for pattern in patterns:
            for match in re.finditer(pattern, transcript, re.IGNORECASE):
                excerpt = match.group(0).strip()
                key = (tactic, excerpt.casefold())
                if key in seen:
                    continue
                context, context_start = _sentence_context(transcript, match.start(), match.end())
                if _is_negated_or_awareness_context(tactic, context, match.start(), context_start):
                    continue
                seen.add(key)
                signals.append({
                    "category": tactic,
                    "severity": _severity(tactic),
                    "evidence": excerpt,
                    "start": match.start(),
                    "end": match.end(),
                    "explanation": f"The transcript contains a request or pressure pattern associated with {tactic.lower()}.",
                    "source": "deterministic_rule",
                    "supporting_signals": [],
                    "conflicting_signals": [],
                    "recommended_action": "Pause and verify through a trusted, independently obtained contact channel.",
                })

    tactics = list(dict.fromkeys(signal["category"] for signal in signals))
    # Count each category once: overlapping patterns for the same behavior
    # must not raise risk by duplicating equivalent evidence.
    weights = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    category_weights = {
        tactic: max(weights[signal["severity"]] for signal in signals if signal["category"] == tactic)
        for tactic in tactics
    }
    score = sum(category_weights.values())
    behaviors = set(tactics)
    coercive = behaviors & {
        "Digital Arrest Intimidation", "Threats and Coercion", "Payment Pressure",
        "Secrecy and Isolation", "Remote Access Request", "Suspicious APK Request",
        "Family Emergency Impersonation", "Authority Impersonation",
    }
    has_credential_request = bool(behaviors & HIGH_RISK_TACTICS)
    if (has_credential_request and len(coercive) >= 2) or len(coercive) >= 3:
        risk_level = "CRITICAL"
    elif has_credential_request or score >= 4:
        risk_level = "HIGH"
    elif signals:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return RuleAnalysisResult.model_validate({
        "risk_level": risk_level,
        "detected_tactics": tactics,
        "evidence": list(dict.fromkeys(signal["evidence"] for signal in signals)),
        "signals": signals,
        "uncertainty": (
            "One indicator was found and may have a benign explanation. Verify the request independently."
            if signals and risk_level == "MEDIUM" and len(tactics) == 1 else None
        ),
        # This is a documented ordinal rule weight, not a calibrated probability.
        "score": score,
    }).model_dump()
