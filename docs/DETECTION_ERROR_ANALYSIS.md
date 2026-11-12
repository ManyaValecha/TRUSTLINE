# TRUSTLINE Detection Error Analysis — Original Baseline

**Source:** `evaluation/results/baseline-rules-v1-2026-11-11.json`; original rules-only predictions, preserved unchanged.
**Errors:** 76 of 220 records (64 false negatives; 12 false positives).

> This is example-level analysis of the authored synthetic text pilot. It is not a sample of real calls. Root-cause labels describe verified detector/data behavior, not a claim about real scam prevalence.

## Recurring patterns

- Scam false negatives are concentrated in Hindi and Hinglish, where requested actions and threat wording use Devanagari or Romanized Hindi absent from the original English-first rules.
- The remaining misses are category/formulation gaps: the behavior is present but not expressed in the specific lexical order required by a rule.
- False positives come from topic-word adjacency and incomplete polarity/context handling: police roles, job interviews, refund status, PIN safety advice, and security warnings were read as requests.
- A rule match is not a verified speaker identity or intent. The baseline did not have a speaker/target model.

## Error summary by language and type

| Error type | English | Hindi | Hinglish | Total |
|---|---:|---:|---:|---:|
| False negative | 8 | 40 | 16 | 64 |
| False positive | 4 | 0 | 8 | 12 |

## All baseline errors by recurring behavior group

### Bank or KYC Impersonation (5 errors)

#### S06-01 — Hinglish / Bank or KYC Impersonation

- **Group:** Bank or KYC Impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Caller bolta hai: Aapka bank account block hai, abhi KYC update karo.
- **Triggered rules:** None
- **Missing rules:** Bank or KYC Impersonation
- **Evidence detected:** None
- **Root cause:** Localized account-block/KYC urgency and code-switched account wording were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S06-03 — Hindi / Bank or KYC Impersonation

- **Group:** Bank or KYC Impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: आपका बैंक खाता बंद है, अभी केवाईसी अपडेट करें।
- **Triggered rules:** None
- **Missing rules:** Bank or KYC Impersonation
- **Evidence detected:** None
- **Root cause:** Localized account-block/KYC urgency and code-switched account wording were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S06-04 — Hinglish / Bank or KYC Impersonation

- **Group:** Bank or KYC Impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call ke dauran bola gaya: Aapka bank account block hai, abhi KYC update karo.
- **Triggered rules:** None
- **Missing rules:** Bank or KYC Impersonation
- **Evidence detected:** None
- **Root cause:** Localized account-block/KYC urgency and code-switched account wording were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S06-06 — Hindi / Bank or KYC Impersonation

- **Group:** Bank or KYC Impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: आपका बैंक खाता बंद है, अभी केवाईसी अपडेट करें।
- **Triggered rules:** None
- **Missing rules:** Bank or KYC Impersonation
- **Evidence detected:** None
- **Root cause:** Localized account-block/KYC urgency and code-switched account wording were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S06-07 — Hinglish / Bank or KYC Impersonation

- **Group:** Bank or KYC Impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Phone par awaaz bolti hai: Aapka bank account block hai, abhi KYC update karo.
- **Triggered rules:** None
- **Missing rules:** Bank or KYC Impersonation
- **Evidence detected:** None
- **Root cause:** Localized account-block/KYC urgency and code-switched account wording were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Courier and customs scams (5 errors)

#### S12-02 — English / Courier or Customs Demand

- **Group:** Courier and customs scams
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** On the call, I hear: Your parcel is held by customs; pay the clearance fee now.
- **Triggered rules:** None
- **Missing rules:** Courier or Customs Demand
- **Evidence detected:** None
- **Root cause:** Localized parcel/customs vocabulary and payment demands were not matched as a combined behavior.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S12-03 — Hindi / Courier or Customs Demand

- **Group:** Courier and customs scams
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: आपका पार्सल कस्टम में रुका है, अभी शुल्क जमा करें।
- **Triggered rules:** None
- **Missing rules:** Courier or Customs Demand
- **Evidence detected:** None
- **Root cause:** Localized parcel/customs vocabulary and payment demands were not matched as a combined behavior.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S12-05 — English / Courier or Customs Demand

- **Group:** Courier and customs scams
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** The caller says: Your parcel is held by customs; pay the clearance fee now.
- **Triggered rules:** None
- **Missing rules:** Courier or Customs Demand
- **Evidence detected:** None
- **Root cause:** Localized parcel/customs vocabulary and payment demands were not matched as a combined behavior.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S12-06 — Hindi / Courier or Customs Demand

- **Group:** Courier and customs scams
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: आपका पार्सल कस्टम में रुका है, अभी शुल्क जमा करें।
- **Triggered rules:** None
- **Missing rules:** Courier or Customs Demand
- **Evidence detected:** None
- **Root cause:** Localized parcel/customs vocabulary and payment demands were not matched as a combined behavior.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S12-08 — English / Courier or Customs Demand

- **Group:** Courier and customs scams
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** This was said during a call: Your parcel is held by customs; pay the clearance fee now.
- **Triggered rules:** None
- **Missing rules:** Courier or Customs Demand
- **Evidence detected:** None
- **Root cause:** Localized parcel/customs vocabulary and payment demands were not matched as a combined behavior.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Digital arrest and threats (9 errors)

#### S04-02 — Hindi / Digital Arrest Intimidation

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: आप डिजिटल गिरफ्तारी में हैं, कॉल पर बने रहिए।
- **Triggered rules:** None
- **Missing rules:** Digital Arrest Intimidation
- **Evidence detected:** None
- **Root cause:** Digital-arrest wording and coercive call-continuation expressions were not covered in this language/formulation.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S04-05 — Hindi / Digital Arrest Intimidation

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: आप डिजिटल गिरफ्तारी में हैं, कॉल पर बने रहिए।
- **Triggered rules:** None
- **Missing rules:** Digital Arrest Intimidation
- **Evidence detected:** None
- **Root cause:** Digital-arrest wording and coercive call-continuation expressions were not covered in this language/formulation.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S04-08 — Hindi / Digital Arrest Intimidation

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: आप डिजिटल गिरफ्तारी में हैं, कॉल पर बने रहिए।
- **Triggered rules:** None
- **Missing rules:** Digital Arrest Intimidation
- **Evidence detected:** None
- **Root cause:** Digital-arrest wording and coercive call-continuation expressions were not covered in this language/formulation.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S08-01 — Hindi / Threats and Coercion

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: आज जुर्माना नहीं दिया तो आपको गिरफ्तार किया जाएगा।
- **Triggered rules:** None
- **Missing rules:** Threats and Coercion
- **Evidence detected:** None
- **Root cause:** Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S08-02 — Hinglish / Threats and Coercion

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call par maine suna: Aaj fine nahi diya to aapko arrest kiya jayega.
- **Triggered rules:** None
- **Missing rules:** Threats and Coercion
- **Evidence detected:** None
- **Root cause:** Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S08-04 — Hindi / Threats and Coercion

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: आज जुर्माना नहीं दिया तो आपको गिरफ्तार किया जाएगा।
- **Triggered rules:** None
- **Missing rules:** Threats and Coercion
- **Evidence detected:** None
- **Root cause:** Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S08-05 — Hinglish / Threats and Coercion

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Caller bolta hai: Aaj fine nahi diya to aapko arrest kiya jayega.
- **Triggered rules:** None
- **Missing rules:** Threats and Coercion
- **Evidence detected:** None
- **Root cause:** Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S08-07 — Hindi / Threats and Coercion

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: आज जुर्माना नहीं दिया तो आपको गिरफ्तार किया जाएगा।
- **Triggered rules:** None
- **Missing rules:** Threats and Coercion
- **Evidence detected:** None
- **Root cause:** Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S08-08 — Hinglish / Threats and Coercion

- **Group:** Digital arrest and threats
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call ke dauran bola gaya: Aaj fine nahi diya to aapko arrest kiya jayega.
- **Triggered rules:** None
- **Missing rules:** Threats and Coercion
- **Evidence detected:** None
- **Root cause:** Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Family emergency impersonation (2 errors)

#### S15-03 — Hindi / Family Emergency Impersonation

- **Group:** Family emergency impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: आपके बेटे का हादसा हुआ है, अस्पताल में अभी पैसे भेजिए।
- **Triggered rules:** None
- **Missing rules:** Family Emergency Impersonation
- **Evidence detected:** None
- **Root cause:** Family relationship, emergency, and urgent transfer cues in Hindi/Romanized Hindi were not combined.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S15-06 — Hindi / Family Emergency Impersonation

- **Group:** Family emergency impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: आपके बेटे का हादसा हुआ है, अस्पताल में अभी पैसे भेजिए।
- **Triggered rules:** None
- **Missing rules:** Family Emergency Impersonation
- **Evidence detected:** None
- **Root cause:** Family relationship, emergency, and urgent transfer cues in Hindi/Romanized Hindi were not combined.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Legitimate banking and UPI safety (2 errors)

#### L14-02 — Hinglish / upi_refund_safety

- **Group:** Legitimate banking and UPI safety
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Normal baat mein: Refund credit hota hai, bhejne ke liye kisi ko aapka UPI PIN nahi chahiye.
- **Triggered rules:** Refund Manipulation
- **Missing rules:** None
- **Evidence detected:** Refund credit hota hai, bhejne ke liye kisi ko aapka UPI PIN
- **Root cause:** Adjacent refund and PIN terms matched although the statement explicitly said the PIN was unnecessary.
- **Proposed correction:** Model polarity and who needs the PIN; a warning that nobody needs it is protective evidence.

#### L14-05 — Hinglish / upi_refund_safety

- **Group:** Legitimate banking and UPI safety
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Office mein maine suna: Refund credit hota hai, bhejne ke liye kisi ko aapka UPI PIN nahi chahiye.
- **Triggered rules:** Refund Manipulation
- **Missing rules:** None
- **Evidence detected:** Refund credit hota hai, bhejne ke liye kisi ko aapka UPI PIN
- **Root cause:** Adjacent refund and PIN terms matched although the statement explicitly said the PIN was unnecessary.
- **Proposed correction:** Model polarity and who needs the PIN; a warning that nobody needs it is protective evidence.

### Legitimate banking and refund status (1 errors)

#### L10-03 — Hinglish / refund_status

- **Group:** Legitimate banking and refund status
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Family ki baat thi: Refund process mein hai, fee dene ya PIN share karne ki zarurat nahi.
- **Triggered rules:** Refund Manipulation
- **Missing rules:** None
- **Evidence detected:** Refund process mein hai, fee dene ya PIN share
- **Root cause:** The rule matched refund/payment or credential vocabulary without resolving the explicit no-payment/no-PIN context.
- **Proposed correction:** Interpret negation over the complete sentence and require a positive request to pay or disclose data.

### Legitimate security awareness (3 errors)

#### L16-01 — English / workplace_security

- **Group:** Legitimate security awareness
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** A colleague says: Our security team reminded staff not to install unknown APK files.
- **Triggered rules:** Suspicious APK Request
- **Missing rules:** None
- **Evidence detected:** install unknown APK
- **Root cause:** An install/APK phrase matched in a sentence instructing staff not to install it.
- **Proposed correction:** Evaluate the installation verb with its negation and awareness framing before emitting a signal.

#### L16-03 — Hinglish / workplace_security

- **Group:** Legitimate security awareness
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Family ki baat thi: Security team ne unknown APK install na karne ko kaha.
- **Triggered rules:** Suspicious APK Request
- **Missing rules:** None
- **Evidence detected:** APK install
- **Root cause:** An install/APK phrase matched in a sentence instructing staff not to install it.
- **Proposed correction:** Evaluate the installation verb with its negation and awareness framing before emitting a signal.

#### L16-04 — English / workplace_security

- **Group:** Legitimate security awareness
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** The notice explains: Our security team reminded staff not to install unknown APK files.
- **Triggered rules:** Suspicious APK Request
- **Missing rules:** None
- **Evidence detected:** install unknown APK
- **Root cause:** An install/APK phrase matched in a sentence instructing staff not to install it.
- **Proposed correction:** Evaluate the installation verb with its negation and awareness framing before emitting a signal.

### OTP and UPI PIN solicitation (13 errors)

#### S01-02 — Hindi / OTP Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: अपना ओटीपी मुझे अभी बताइए।
- **Triggered rules:** None
- **Missing rules:** OTP Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized action verbs and mixed-language ordering for requests to disclose an OTP.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S01-03 — Hinglish / OTP Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Phone par awaaz bolti hai: Apna OTP mujhe abhi batao.
- **Triggered rules:** None
- **Missing rules:** OTP Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized action verbs and mixed-language ordering for requests to disclose an OTP.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S01-05 — Hindi / OTP Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: अपना ओटीपी मुझे अभी बताइए।
- **Triggered rules:** None
- **Missing rules:** OTP Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized action verbs and mixed-language ordering for requests to disclose an OTP.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S01-06 — Hinglish / OTP Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call par maine suna: Apna OTP mujhe abhi batao.
- **Triggered rules:** None
- **Missing rules:** OTP Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized action verbs and mixed-language ordering for requests to disclose an OTP.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S01-08 — Hindi / OTP Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: अपना ओटीपी मुझे अभी बताइए।
- **Triggered rules:** None
- **Missing rules:** OTP Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized action verbs and mixed-language ordering for requests to disclose an OTP.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S02-01 — Hindi / UPI PIN Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: रिफंड पाने के लिए अपना यूपीआई पिन बताइए।
- **Triggered rules:** None
- **Missing rules:** UPI PIN Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized UPI PIN disclosure verbs and refund-context variants.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S02-04 — Hindi / UPI PIN Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: रिफंड पाने के लिए अपना यूपीआई पिन बताइए।
- **Triggered rules:** None
- **Missing rules:** UPI PIN Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized UPI PIN disclosure verbs and refund-context variants.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S02-07 — Hindi / UPI PIN Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: रिफंड पाने के लिए अपना यूपीआई पिन बताइए।
- **Triggered rules:** None
- **Missing rules:** UPI PIN Request
- **Evidence detected:** None
- **Root cause:** The rule set lacked Hindi/romanized UPI PIN disclosure verbs and refund-context variants.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S03-01 — Hinglish / Credential Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Caller bolta hai: Banking password mujhe bhejo.
- **Triggered rules:** None
- **Missing rules:** Credential Request
- **Evidence detected:** None
- **Root cause:** Credential matching covered a narrow English vocabulary and missed localized banking-password request forms.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S03-03 — Hindi / Credential Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: अपना बैंकिंग पासवर्ड मुझे भेजिए।
- **Triggered rules:** None
- **Missing rules:** Credential Request
- **Evidence detected:** None
- **Root cause:** Credential matching covered a narrow English vocabulary and missed localized banking-password request forms.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S03-04 — Hinglish / Credential Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call ke dauran bola gaya: Banking password mujhe bhejo.
- **Triggered rules:** None
- **Missing rules:** Credential Request
- **Evidence detected:** None
- **Root cause:** Credential matching covered a narrow English vocabulary and missed localized banking-password request forms.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S03-06 — Hindi / Credential Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: अपना बैंकिंग पासवर्ड मुझे भेजिए।
- **Triggered rules:** None
- **Missing rules:** Credential Request
- **Evidence detected:** None
- **Root cause:** Credential matching covered a narrow English vocabulary and missed localized banking-password request forms.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S03-07 — Hinglish / Credential Request

- **Group:** OTP and UPI PIN solicitation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Phone par awaaz bolti hai: Banking password mujhe bhejo.
- **Triggered rules:** None
- **Missing rules:** Credential Request
- **Evidence detected:** None
- **Root cause:** Credential matching covered a narrow English vocabulary and missed localized banking-password request forms.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Ordinary family/workplace conversation (2 errors)

#### L08-02 — Hinglish / job_interview

- **Group:** Ordinary family/workplace conversation
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Normal baat mein: Aapka job interview Tuesday ko hai, koi registration fee nahi hai.
- **Triggered rules:** Investment or Job Lure
- **Missing rules:** None
- **Evidence detected:** job interview Tuesday ko hai, koi registration fee
- **Root cause:** The job-lure expression matched an interview mention and a negated registration-fee phrase.
- **Proposed correction:** Require an affirmative upfront-fee request; treat an explicit no-fee statement as contradictory context.

#### L08-05 — Hinglish / job_interview

- **Group:** Ordinary family/workplace conversation
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Office mein maine suna: Aapka job interview Tuesday ko hai, koi registration fee nahi hai.
- **Triggered rules:** Investment or Job Lure
- **Missing rules:** None
- **Evidence detected:** job interview Tuesday ko hai, koi registration fee
- **Root cause:** The job-lure expression matched an interview mention and a negated registration-fee phrase.
- **Proposed correction:** Require an affirmative upfront-fee request; treat an explicit no-fee statement as contradictory context.

### Payment manipulation (14 errors)

#### S07-02 — Hindi / Payment Pressure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: खाता चालू रखने के लिए अभी पैसे ट्रांसफर करें।
- **Triggered rules:** None
- **Missing rules:** Payment Pressure
- **Evidence detected:** None
- **Root cause:** Payment action, target, and urgency were expressed with Hindi/Romanized verbs or reversed word order not covered by rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S07-05 — Hindi / Payment Pressure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: खाता चालू रखने के लिए अभी पैसे ट्रांसफर करें।
- **Triggered rules:** None
- **Missing rules:** Payment Pressure
- **Evidence detected:** None
- **Root cause:** Payment action, target, and urgency were expressed with Hindi/Romanized verbs or reversed word order not covered by rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S07-08 — Hindi / Payment Pressure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: खाता चालू रखने के लिए अभी पैसे ट्रांसफर करें।
- **Triggered rules:** None
- **Missing rules:** Payment Pressure
- **Evidence detected:** None
- **Root cause:** Payment action, target, and urgency were expressed with Hindi/Romanized verbs or reversed word order not covered by rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S13-01 — English / Investment or Job Lure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** The caller says: This job guarantees income; pay the registration deposit first.
- **Triggered rules:** None
- **Missing rules:** Investment or Job Lure
- **Evidence detected:** None
- **Root cause:** The localized job/investment lure and upfront-payment wording fell outside the English patterns.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S13-02 — Hindi / Investment or Job Lure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: इस नौकरी में पक्की कमाई है, पहले पंजीकरण शुल्क जमा करें।
- **Triggered rules:** None
- **Missing rules:** Investment or Job Lure
- **Evidence detected:** None
- **Root cause:** The localized job/investment lure and upfront-payment wording fell outside the English patterns.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S13-04 — English / Investment or Job Lure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** This was said during a call: This job guarantees income; pay the registration deposit first.
- **Triggered rules:** None
- **Missing rules:** Investment or Job Lure
- **Evidence detected:** None
- **Root cause:** The localized job/investment lure and upfront-payment wording fell outside the English patterns.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S13-05 — Hindi / Investment or Job Lure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: इस नौकरी में पक्की कमाई है, पहले पंजीकरण शुल्क जमा करें।
- **Triggered rules:** None
- **Missing rules:** Investment or Job Lure
- **Evidence detected:** None
- **Root cause:** The localized job/investment lure and upfront-payment wording fell outside the English patterns.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S13-07 — English / Investment or Job Lure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** The voice on the phone says: This job guarantees income; pay the registration deposit first.
- **Triggered rules:** None
- **Missing rules:** Investment or Job Lure
- **Evidence detected:** None
- **Root cause:** The localized job/investment lure and upfront-payment wording fell outside the English patterns.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S13-08 — Hindi / Investment or Job Lure

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: इस नौकरी में पक्की कमाई है, पहले पंजीकरण शुल्क जमा करें।
- **Triggered rules:** None
- **Missing rules:** Investment or Job Lure
- **Evidence detected:** None
- **Root cause:** The localized job/investment lure and upfront-payment wording fell outside the English patterns.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S14-01 — Hindi / Refund Manipulation

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: रिफंड पाने के लिए पहले एक शुल्क दीजिए।
- **Triggered rules:** None
- **Missing rules:** Refund Manipulation
- **Evidence detected:** None
- **Root cause:** Refund-to-payment manipulation was not recognized in the language or verb order used.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S14-03 — English / Refund Manipulation

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** The voice on the phone says: Pay a small fee to receive your refund.
- **Triggered rules:** None
- **Missing rules:** Refund Manipulation
- **Evidence detected:** None
- **Root cause:** Refund-to-payment manipulation was not recognized in the language or verb order used.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S14-04 — Hindi / Refund Manipulation

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: रिफंड पाने के लिए पहले एक शुल्क दीजिए।
- **Triggered rules:** None
- **Missing rules:** Refund Manipulation
- **Evidence detected:** None
- **Root cause:** Refund-to-payment manipulation was not recognized in the language or verb order used.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S14-06 — English / Refund Manipulation

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** On the call, I hear: Pay a small fee to receive your refund.
- **Triggered rules:** None
- **Missing rules:** Refund Manipulation
- **Evidence detected:** None
- **Root cause:** Refund-to-payment manipulation was not recognized in the language or verb order used.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S14-07 — Hindi / Refund Manipulation

- **Group:** Payment manipulation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: रिफंड पाने के लिए पहले एक शुल्क दीजिए।
- **Triggered rules:** None
- **Missing rules:** Refund Manipulation
- **Evidence detected:** None
- **Root cause:** Refund-to-payment manipulation was not recognized in the language or verb order used.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Police and government impersonation (3 errors)

#### S05-01 — Hindi / Authority Impersonation

- **Group:** Police and government impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: मैं पुलिस विभाग से अधिकारी बोल रहा हूँ।
- **Triggered rules:** None
- **Missing rules:** Authority Impersonation
- **Evidence detected:** None
- **Root cause:** First-person authority claims in Hindi or Romanized Hindi were not recognized consistently.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S05-04 — Hindi / Authority Impersonation

- **Group:** Police and government impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: मैं पुलिस विभाग से अधिकारी बोल रहा हूँ।
- **Triggered rules:** None
- **Missing rules:** Authority Impersonation
- **Evidence detected:** None
- **Root cause:** First-person authority claims in Hindi or Romanized Hindi were not recognized consistently.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S05-07 — Hindi / Authority Impersonation

- **Group:** Police and government impersonation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: मैं पुलिस विभाग से अधिकारी बोल रहा हूँ।
- **Triggered rules:** None
- **Missing rules:** Authority Impersonation
- **Evidence detected:** None
- **Root cause:** First-person authority claims in Hindi or Romanized Hindi were not recognized consistently.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Police and government mentions in routine conversation (4 errors)

#### L12-01 — Hinglish / police_case_update

- **Group:** Police and government mentions in routine conversation
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Colleague bolta hai: Police officer ne routine statement ke liye station aane ko kaha.
- **Triggered rules:** Authority Impersonation
- **Missing rules:** None
- **Evidence detected:** Police officer
- **Root cause:** A generic police/officer mention was treated as authority impersonation without a first-person claim or coercive demand.
- **Proposed correction:** Require a caller identity assertion and an action/pressure cue; do not flag a role noun by itself.

#### L12-02 — English / police_case_update

- **Group:** Police and government mentions in routine conversation
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** In a routine conversation: The police officer asked me to visit the station for a routine statement.
- **Triggered rules:** Authority Impersonation
- **Missing rules:** None
- **Evidence detected:** police officer
- **Root cause:** A generic police/officer mention was treated as authority impersonation without a first-person claim or coercive demand.
- **Proposed correction:** Require a caller identity assertion and an action/pressure cue; do not flag a role noun by itself.

#### L12-04 — Hinglish / police_case_update

- **Group:** Police and government mentions in routine conversation
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** Notice mein bataya: Police officer ne routine statement ke liye station aane ko kaha.
- **Triggered rules:** Authority Impersonation
- **Missing rules:** None
- **Evidence detected:** Police officer
- **Root cause:** A generic police/officer mention was treated as authority impersonation without a first-person claim or coercive demand.
- **Proposed correction:** Require a caller identity assertion and an action/pressure cue; do not flag a role noun by itself.

#### L12-05 — English / police_case_update

- **Group:** Police and government mentions in routine conversation
- **Actual / predicted:** legitimate / scam (MEDIUM)
- **Transcript:** I heard this at work: The police officer asked me to visit the station for a routine statement.
- **Triggered rules:** Authority Impersonation
- **Missing rules:** None
- **Evidence detected:** police officer
- **Root cause:** A generic police/officer mention was treated as authority impersonation without a first-person claim or coercive demand.
- **Proposed correction:** Require a caller identity assertion and an action/pressure cue; do not flag a role noun by itself.

### Remote-access applications (8 errors)

#### S10-02 — Hindi / Remote Access Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: एनीडेस्क इंस्टॉल करके मुझे रिमोट एक्सेस दीजिए।
- **Triggered rules:** None
- **Missing rules:** Remote Access Request
- **Evidence detected:** None
- **Root cause:** The rule set did not recognize the localized app name/action request and remote-access phrasing together.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S10-03 — Hinglish / Remote Access Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Phone par awaaz bolti hai: AnyDesk install karke mujhe remote access do.
- **Triggered rules:** None
- **Missing rules:** Remote Access Request
- **Evidence detected:** None
- **Root cause:** The rule set did not recognize the localized app name/action request and remote-access phrasing together.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S10-05 — Hindi / Remote Access Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: एनीडेस्क इंस्टॉल करके मुझे रिमोट एक्सेस दीजिए।
- **Triggered rules:** None
- **Missing rules:** Remote Access Request
- **Evidence detected:** None
- **Root cause:** The rule set did not recognize the localized app name/action request and remote-access phrasing together.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S10-06 — Hinglish / Remote Access Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call par maine suna: AnyDesk install karke mujhe remote access do.
- **Triggered rules:** None
- **Missing rules:** Remote Access Request
- **Evidence detected:** None
- **Root cause:** The rule set did not recognize the localized app name/action request and remote-access phrasing together.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S10-08 — Hindi / Remote Access Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: एनीडेस्क इंस्टॉल करके मुझे रिमोट एक्सेस दीजिए।
- **Triggered rules:** None
- **Missing rules:** Remote Access Request
- **Evidence detected:** None
- **Root cause:** The rule set did not recognize the localized app name/action request and remote-access phrasing together.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S11-01 — Hindi / Suspicious APK Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल करने वाला कहता है: खाता सत्यापित करने के लिए यह एपीके इंस्टॉल करें।
- **Triggered rules:** None
- **Missing rules:** Suspicious APK Request
- **Evidence detected:** None
- **Root cause:** Devanagari or Romanized APK/install request forms were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S11-04 — Hindi / Suspicious APK Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल के दौरान कहा गया: खाता सत्यापित करने के लिए यह एपीके इंस्टॉल करें।
- **Triggered rules:** None
- **Missing rules:** Suspicious APK Request
- **Evidence detected:** None
- **Root cause:** Devanagari or Romanized APK/install request forms were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S11-07 — Hindi / Suspicious APK Request

- **Group:** Remote-access applications
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: खाता सत्यापित करने के लिए यह एपीके इंस्टॉल करें।
- **Triggered rules:** None
- **Missing rules:** Suspicious APK Request
- **Evidence detected:** None
- **Root cause:** Devanagari or Romanized APK/install request forms were missing.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

### Secrecy and isolation (5 errors)

#### S09-01 — Hinglish / Secrecy and Isolation

- **Group:** Secrecy and isolation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Caller bolta hai: Family ko mat batana aur bank ko call mat karna.
- **Triggered rules:** None
- **Missing rules:** Secrecy and Isolation
- **Evidence detected:** None
- **Root cause:** Family/bank isolation requests in Hindi/Romanized Hindi were not represented in the secrecy rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S09-03 — Hindi / Secrecy and Isolation

- **Group:** Secrecy and isolation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** फोन पर आवाज़ कहती है: अपने परिवार को मत बताइए और बैंक से संपर्क मत कीजिए।
- **Triggered rules:** None
- **Missing rules:** Secrecy and Isolation
- **Evidence detected:** None
- **Root cause:** Family/bank isolation requests in Hindi/Romanized Hindi were not represented in the secrecy rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S09-04 — Hinglish / Secrecy and Isolation

- **Group:** Secrecy and isolation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Call ke dauran bola gaya: Family ko mat batana aur bank ko call mat karna.
- **Triggered rules:** None
- **Missing rules:** Secrecy and Isolation
- **Evidence detected:** None
- **Root cause:** Family/bank isolation requests in Hindi/Romanized Hindi were not represented in the secrecy rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S09-06 — Hindi / Secrecy and Isolation

- **Group:** Secrecy and isolation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** कॉल पर मैंने सुना: अपने परिवार को मत बताइए और बैंक से संपर्क मत कीजिए।
- **Triggered rules:** None
- **Missing rules:** Secrecy and Isolation
- **Evidence detected:** None
- **Root cause:** Family/bank isolation requests in Hindi/Romanized Hindi were not represented in the secrecy rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

#### S09-07 — Hinglish / Secrecy and Isolation

- **Group:** Secrecy and isolation
- **Actual / predicted:** scam / legitimate (LOW)
- **Transcript:** Phone par awaaz bolti hai: Family ko mat batana aur bank ko call mat karna.
- **Triggered rules:** None
- **Missing rules:** Secrecy and Isolation
- **Evidence detected:** None
- **Root cause:** Family/bank isolation requests in Hindi/Romanized Hindi were not represented in the secrecy rules.
- **Proposed correction:** Add language-aware behavior patterns and a regression case while preserving exact source offsets.

## Interpretation

The baseline achieved 0% recall on Hindi scam records in this corpus because the detector lacked Hindi behavior expressions, not because Hindi text failed Unicode decoding or evidence-span extraction. Its existing span offsets index the original Python string correctly. Romanized and mixed-language coverage was also partial. The false positives were primarily context failures, including treating warnings or routine mentions as active instructions.

The complete record-level list above includes every baseline false negative and false positive with its ID, label, language, category, triggered and missing rules, available evidence, root cause, and proposed correction.
