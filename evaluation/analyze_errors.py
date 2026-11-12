"""Create an example-by-example report from the immutable original baseline."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
BASELINE = ROOT / "results" / "baseline-rules-v1-2026-11-11.json"
OUTPUT = ROOT.parent / "docs" / "DETECTION_ERROR_ANALYSIS.md"

FAMILY_INFO = {
    "job_interview": (
        "Ordinary family/workplace conversation",
        "The job-lure expression matched an interview mention and a negated registration-fee phrase.",
        "Require an affirmative upfront-fee request; treat an explicit no-fee statement as contradictory context.",
    ),
    "police_case_update": (
        "Police and government mentions in routine conversation",
        "A generic police/officer mention was treated as authority impersonation without a first-person claim or coercive demand.",
        "Require a caller identity assertion and an action/pressure cue; do not flag a role noun by itself.",
    ),
    "refund_status": (
        "Legitimate banking and refund status",
        "The rule matched refund/payment or credential vocabulary without resolving the explicit no-payment/no-PIN context.",
        "Interpret negation over the complete sentence and require a positive request to pay or disclose data.",
    ),
    "upi_refund_safety": (
        "Legitimate banking and UPI safety",
        "Adjacent refund and PIN terms matched although the statement explicitly said the PIN was unnecessary.",
        "Model polarity and who needs the PIN; a warning that nobody needs it is protective evidence.",
    ),
    "workplace_security": (
        "Legitimate security awareness",
        "An install/APK phrase matched in a sentence instructing staff not to install it.",
        "Evaluate the installation verb with its negation and awareness framing before emitting a signal.",
    ),
}

SCAM_ROOT_CAUSE = {
    "OTP Request": "The rule set lacked Hindi/romanized action verbs and mixed-language ordering for requests to disclose an OTP.",
    "UPI PIN Request": "The rule set lacked Hindi/romanized UPI PIN disclosure verbs and refund-context variants.",
    "Credential Request": "Credential matching covered a narrow English vocabulary and missed localized banking-password request forms.",
    "Digital Arrest Intimidation": "Digital-arrest wording and coercive call-continuation expressions were not covered in this language/formulation.",
    "Authority Impersonation": "First-person authority claims in Hindi or Romanized Hindi were not recognized consistently.",
    "Bank or KYC Impersonation": "Localized account-block/KYC urgency and code-switched account wording were missing.",
    "Payment Pressure": "Payment action, target, and urgency were expressed with Hindi/Romanized verbs or reversed word order not covered by rules.",
    "Threats and Coercion": "Hindi/Romanized arrest and conditional-threat phrases were absent or not joined to their coercive condition.",
    "Secrecy and Isolation": "Family/bank isolation requests in Hindi/Romanized Hindi were not represented in the secrecy rules.",
    "Remote Access Request": "The rule set did not recognize the localized app name/action request and remote-access phrasing together.",
    "Suspicious APK Request": "Devanagari or Romanized APK/install request forms were missing.",
    "Courier or Customs Demand": "Localized parcel/customs vocabulary and payment demands were not matched as a combined behavior.",
    "Investment or Job Lure": "The localized job/investment lure and upfront-payment wording fell outside the English patterns.",
    "Refund Manipulation": "Refund-to-payment manipulation was not recognized in the language or verb order used.",
    "Family Emergency Impersonation": "Family relationship, emergency, and urgent transfer cues in Hindi/Romanized Hindi were not combined.",
}


def family_group(row: dict[str, Any]) -> tuple[str, str, str]:
    family = row["scenario_family"].removeprefix("legitimate-")
    if row["label"] == "scam":
        category = row["category"]
        if category in {"Digital Arrest Intimidation", "Threats and Coercion"}:
            group = "Digital arrest and threats"
        elif category == "Authority Impersonation":
            group = "Police and government impersonation"
        elif category in {"OTP Request", "UPI PIN Request", "Credential Request"}:
            group = "OTP and UPI PIN solicitation"
        elif category in {"Payment Pressure", "Refund Manipulation", "Investment or Job Lure"}:
            group = "Payment manipulation"
        elif category in {"Remote Access Request", "Suspicious APK Request"}:
            group = "Remote-access applications"
        elif category == "Courier or Customs Demand":
            group = "Courier and customs scams"
        elif category == "Family Emergency Impersonation":
            group = "Family emergency impersonation"
        elif category == "Secrecy and Isolation":
            group = "Secrecy and isolation"
        else:
            group = category
        return group, SCAM_ROOT_CAUSE.get(category, "The behavior expression was not represented by the baseline rule patterns."), "Add language-aware behavior patterns and a regression case while preserving exact source offsets."
    info = FAMILY_INFO.get(family)
    if info:
        return info
    return "Other legitimate conversation", "A legitimate statement triggered one or more rule patterns despite its benign intent.", "Review the matched span and full sentence context; require an affirmative manipulative action before warning."


def format_record(row: dict[str, Any]) -> list[str]:
    group, root_cause, correction = family_group(row)
    expected = row.get("expected_warning_signals", [])
    triggered = row.get("predicted_signals", [])
    missing = sorted(set(expected) - set(triggered)) if row["label"] == "scam" else []
    evidence = row.get("evidence", [])
    return [
        f"#### {row['id']} — {row['language']} / {row['category']}",
        "",
        f"- **Group:** {group}",
        f"- **Actual / predicted:** {row['label']} / {'scam' if row['predicted_scam'] else 'legitimate'} ({row['predicted_risk_level']})",
        f"- **Transcript:** {row['transcript']}",
        f"- **Triggered rules:** {', '.join(triggered) if triggered else 'None'}",
        f"- **Missing rules:** {', '.join(missing) if missing else ('None' if row['label'] == 'legitimate' else 'Expected signal label was not present')}",
        f"- **Evidence detected:** {'; '.join(evidence) if evidence else 'None'}",
        f"- **Root cause:** {root_cause}",
        f"- **Proposed correction:** {correction}",
        "",
    ]


def main() -> None:
    report = json.loads(BASELINE.read_text(encoding="utf-8"))
    errors = [row for row in report["predictions"] if row["predicted_scam"] != (row["label"] == "scam")]
    false_negatives = [row for row in errors if row["label"] == "scam"]
    false_positives = [row for row in errors if row["label"] == "legitimate"]
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in errors:
        groups[family_group(row)[0]].append(row)

    lines = [
        "# TRUSTLINE Detection Error Analysis — Original Baseline",
        "",
        f"**Source:** `{BASELINE.relative_to(ROOT.parent)}`; original rules-only predictions, preserved unchanged.",
        f"**Errors:** {len(errors)} of {len(report['predictions'])} records ({len(false_negatives)} false negatives; {len(false_positives)} false positives).",
        "",
        "> This is example-level analysis of the authored synthetic text pilot. It is not a sample of real calls. Root-cause labels describe verified detector/data behavior, not a claim about real scam prevalence.",
        "",
        "## Recurring patterns",
        "",
        "- Scam false negatives are concentrated in Hindi and Hinglish, where requested actions and threat wording use Devanagari or Romanized Hindi absent from the original English-first rules.",
        "- The remaining misses are category/formulation gaps: the behavior is present but not expressed in the specific lexical order required by a rule.",
        "- False positives come from topic-word adjacency and incomplete polarity/context handling: police roles, job interviews, refund status, PIN safety advice, and security warnings were read as requests.",
        "- A rule match is not a verified speaker identity or intent. The baseline did not have a speaker/target model.",
        "",
        "## Error summary by language and type",
        "",
        "| Error type | English | Hindi | Hinglish | Total |",
        "|---|---:|---:|---:|---:|",
    ]
    for label, rows in (("False negative", false_negatives), ("False positive", false_positives)):
        counts = Counter(row["language"] for row in rows)
        lines.append(f"| {label} | {counts['English']} | {counts['Hindi']} | {counts['Hinglish']} | {len(rows)} |")
    lines += ["", "## All baseline errors by recurring behavior group", ""]
    for group in sorted(groups):
        lines += [f"### {group} ({len(groups[group])} errors)", ""]
        for row in sorted(groups[group], key=lambda item: item["id"]):
            lines.extend(format_record(row))
    lines += [
        "## Interpretation",
        "",
        "The baseline achieved 0% recall on Hindi scam records in this corpus because the detector lacked Hindi behavior expressions, not because Hindi text failed Unicode decoding or evidence-span extraction. Its existing span offsets index the original Python string correctly. Romanized and mixed-language coverage was also partial. The false positives were primarily context failures, including treating warnings or routine mentions as active instructions.",
        "",
        "The complete record-level list above includes every baseline false negative and false positive with its ID, label, language, category, triggered and missing rules, available evidence, root cause, and proposed correction.",
        "",
    ]
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUTPUT} with {len(false_negatives)} false negatives and {len(false_positives)} false positives.")


if __name__ == "__main__":
    main()
