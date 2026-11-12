"""Run the offline rules-only benchmark and write reproducible result files.

Run from the repository root with:
    PYTHONPATH=backend python -m evaluation.run_benchmark
"""

from __future__ import annotations

import json
import hashlib
import statistics
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

BACKEND = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND))

from app.scam_engine.rules import detect_rule_based_risks  # noqa: E402


ROOT = Path(__file__).resolve().parent
DATASET = ROOT / "dataset" / "trustline-synthetic-v1.jsonl"
RESULTS = ROOT / "results"
REPORT_DOC = ROOT.parent / "docs" / "EVALUATION_REPORT.md"
FRONTEND_RESULT = ROOT.parent / "frontend" / "public" / "evaluation-results.json"
FRONTEND_RESULT = ROOT.parent / "frontend" / "public" / "evaluation-results.json"
RULE_VERSION = "rules-v5-contextual-multilingual-2026-11-12"
SPLIT_CONFIG = ROOT / "splits" / "trustline-synthetic-v1-grouped-seed-20261111.json"
BASELINE_RESULT = RESULTS / "baseline-rules-v1-2026-11-11.json"


def load_records(path: Path = DATASET, split_config_path: Path = SPLIT_CONFIG) -> list[dict[str, Any]]:
    records = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not records:
        raise ValueError("Evaluation dataset is empty")
    ids = [row["id"] for row in records]
    if len(set(ids)) != len(ids):
        raise ValueError("Dataset contains duplicate ids")
    split_config = json.loads(split_config_path.read_text(encoding="utf-8"))
    held_out = set(split_config["held_out_families"])
    known_families = {row["scenario_family"] for row in records}
    if held_out - known_families:
        raise ValueError(f"Split contains unknown families: {sorted(held_out - known_families)}")
    family_labels: dict[str, set[str]] = defaultdict(set)
    for row in records:
        family_labels[row["scenario_family"]].add(row["label"])
        row["source_split"] = row["split"]
        row["split"] = "held_out_test" if row["scenario_family"] in held_out else "development"
    mixed = [family for family, labels in family_labels.items() if len(labels) != 1]
    if mixed:
        raise ValueError(f"A scenario family contains multiple labels: {mixed}")
    by_label: dict[str, list[str]] = defaultdict(list)
    for family, labels in family_labels.items():
        by_label[next(iter(labels))].append(family)
    expected_holdout: set[str] = set()
    for label, families in by_label.items():
        ranked = sorted(families, key=lambda family: hashlib.sha256(f"{split_config['seed']}:{family}".encode()).hexdigest())
        count = int(len(families) * 0.2 + 0.5)
        expected_holdout.update(ranked[:count])
    if held_out != expected_holdout:
        raise ValueError("Split configuration does not match its documented seeded stratified assignment")
    family_splits: dict[str, set[str]] = defaultdict(set)
    for row in records:
        family_splits[row["scenario_family"]].add(row["split"])
    leaked = [family for family, splits in family_splits.items() if len(splits) != 1]
    if leaked:
        raise ValueError(f"Scenario family leakage across splits: {leaked}")
    return records


def calculate_metrics(rows: list[dict[str, Any]]) -> dict[str, Any]:
    tp = sum(row["label"] == "scam" and row["predicted_scam"] for row in rows)
    fn = sum(row["label"] == "scam" and not row["predicted_scam"] for row in rows)
    fp = sum(row["label"] == "legitimate" and row["predicted_scam"] for row in rows)
    tn = sum(row["label"] == "legitimate" and not row["predicted_scam"] for row in rows)
    total = tp + fp + tn + fn
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    def wilson(successes: int, denominator: int) -> list[float] | None:
        if denominator == 0:
            return None
        z = 1.959963984540054
        p = successes / denominator
        adjusted = 1 + z * z / denominator
        center = (p + z * z / (2 * denominator)) / adjusted
        radius = z * ((p * (1 - p) / denominator + z * z / (4 * denominator * denominator)) ** 0.5) / adjusted
        return [max(0, center - radius), min(1, center + radius)]
    return {
        "n": total,
        "accuracy": (tp + tn) / total if total else None,
        "precision": precision,
        "recall": recall,
        "f1": 2 * precision * recall / (precision + recall) if precision is not None and recall is not None and precision + recall else None,
        "false_positive_rate": fp / (fp + tn) if fp + tn else None,
        "false_negative_rate": fn / (fn + tp) if fn + tp else None,
        "confusion_matrix": {"true_positive": tp, "false_positive": fp, "true_negative": tn, "false_negative": fn},
        "confidence_intervals_95_wilson": {
            "accuracy": wilson(tp + tn, total),
            "precision": wilson(tp, tp + fp),
            "recall": wilson(tp, tp + fn),
            "false_positive_rate": wilson(fp, fp + tn),
            "false_negative_rate": wilson(fn, fn + tp),
        },
    }


def evaluate(records: list[dict[str, Any]]) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    elapsed_ms: list[float] = []
    failures = 0
    for record in records:
        start = time.perf_counter_ns()
        try:
            detected = detect_rule_based_risks(record["transcript"])
            error = None
        except Exception as exc:  # record the failure without stopping the batch
            detected = {"risk_level": "LOW", "detected_tactics": [], "signals": [], "uncertainty": "detector failure"}
            error = type(exc).__name__
            failures += 1
        elapsed = (time.perf_counter_ns() - start) / 1_000_000
        elapsed_ms.append(elapsed)
        predicted = detected["risk_level"] in {"MEDIUM", "HIGH", "CRITICAL"}
        results.append({
            **record,
            "predicted_scam": predicted,
            "predicted_risk_level": detected["risk_level"],
            "predicted_signals": detected.get("detected_tactics", []),
            "evidence": detected.get("evidence", []),
            "score": detected.get("score", 0),
            "uncertainty": detected.get("uncertainty"),
            "error": error,
            "latency_ms": elapsed,
        })

    per_language: dict[str, Any] = {}
    for language in sorted({row["language"] for row in results}):
        per_language[language] = calculate_metrics([row for row in results if row["language"] == language])

    scam_categories = sorted({row["category"] for row in results if row["label"] == "scam"})
    per_category: dict[str, Any] = {}
    for category in scam_categories:
        rows = [row for row in results if row["label"] == "scam" and row["category"] == category]
        per_category[category] = {
            "n": len(rows),
            "recall": sum(row["predicted_scam"] for row in rows) / len(rows) if rows else None,
            "expected_signal_recall": sum(bool(set(row["expected_warning_signals"]) & set(row["predicted_signals"])) for row in rows) / len(rows) if rows else None,
        }

    sorted_latency = sorted(elapsed_ms)
    p95_index = max(0, min(len(sorted_latency) - 1, int(0.95 * len(sorted_latency)) - 1))
    baseline = json.loads(BASELINE_RESULT.read_text(encoding="utf-8")) if BASELINE_RESULT.exists() else None
    baseline_by_id = {row["id"]: row for row in baseline["predictions"]} if baseline else {}
    baseline_predictions = [
        {**baseline_by_id[row["id"]], "split": row["split"]}
        for row in results
    ] if baseline else []
    split_config = json.loads(SPLIT_CONFIG.read_text(encoding="utf-8"))
    summary = {
        "dataset": {
            "name": "TRUSTLINE synthetic text-only pilot",
            "version": "trustline-synthetic-v1",
            "records": len(results),
            "label_counts": dict(Counter(row["label"] for row in results)),
            "scenario_families": len({row["scenario_family"] for row in results}),
            "split_config": split_config,
            "split_counts": dict(Counter(row["split"] for row in results)),
            "source_split_counts": dict(Counter(row["source_split"] for row in results)),
            "languages": dict(Counter(row["language"] for row in results)),
            "provenance": "Original synthetic transcripts; no audio or personal recordings.",
        },
        "evaluation": {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "method": "Rules-only classification from deterministic risk result; MEDIUM/HIGH/CRITICAL counts as a warning.",
            "rule_version": RULE_VERSION,
            "overall": calculate_metrics(results),
            "held_out_test": calculate_metrics([row for row in results if row["split"] == "held_out_test"]),
            "development": calculate_metrics([row for row in results if row["split"] == "development"]),
            "per_language": per_language,
            "per_scam_category": per_category,
            "latency_ms": {
                "mean": statistics.mean(elapsed_ms),
                "median": statistics.median(elapsed_ms),
                "p95": sorted_latency[p95_index],
            },
            "detector_failures": failures,
            "uncertainty_rate": sum(bool(row["uncertainty"]) for row in results) / len(results),
            "baseline_overall": calculate_metrics(baseline_predictions) if baseline else None,
            "baseline_held_out_test": calculate_metrics([row for row in baseline_predictions if row["split"] == "held_out_test"]) if baseline else None,
            "baseline_development": calculate_metrics([row for row in baseline_predictions if row["split"] == "development"]) if baseline else None,
            "transcription_failure_rate": None,
            "transcription_failure_note": "Unavailable: this corpus contains synthetic text and no audio/transcription stage.",
        },
        "ablations": {
            "rules_only": {"status": "measured", "metrics_key": "evaluation.overall"},
            "ai_only": {"status": "unavailable", "reason": "No live Cohere calls are made by the offline benchmark."},
            "hybrid": {"status": "unavailable", "reason": "Provider credentials/network are not assumed in automated evaluation."},
            "full_audio_to_guidance": {"status": "unavailable", "reason": "Dataset is synthetic text-only and contains no audio."},
        },
        "limitations": [
            "Synthetic author-written text is not representative of real calls or ASR errors.",
            "The rule set and corpus share an authoring context; this pilot is exploratory, not independent validation.",
            "The grouped held-out split contains seven scenario families; record-level Wilson intervals do not account for within-family dependence.",
            "This is a deterministic re-partition of the same authored pilot, not a newly collected or blind independent validation set.",
            "AI-only, hybrid, transcription, and full-pipeline metrics are unavailable rather than inferred.",
        ],
        "predictions": results,
    }
    return summary


def _pct(value: float | None) -> str:
    return "Unavailable" if value is None else f"{value:.1%}"


def _ci_text(metrics: dict[str, Any], name: str) -> str:
    bounds = metrics.get("confidence_intervals_95_wilson", {}).get(name)
    return "Unavailable" if bounds is None else f"[{bounds[0]:.1%}, {bounds[1]:.1%}]"


def write_report(report: dict[str, Any]) -> None:
    RESULTS.mkdir(parents=True, exist_ok=True)
    (RESULTS / "benchmark_results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    FRONTEND_RESULT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    evaluation = report["evaluation"]
    overall = evaluation["overall"]
    heldout = evaluation["held_out_test"]
    lines = [
        "# TRUSTLINE Evaluation Report",
        "",
        f"**Dataset:** {report['dataset']['name']} ({report['dataset']['version']})<br>",
        f"**Records:** {report['dataset']['records']}; **scenario families:** {report['dataset']['scenario_families']}<br>",
        f"**Run:** {evaluation['timestamp_utc']}<br>",
        f"**Rule version:** `{evaluation['rule_version']}`",
        "",
        "> Exploratory synthetic text-only pilot. These figures do not estimate real-world detection performance.",
        "",
        "## Rules-only results",
        "",
        "| Split | N | Accuracy | Precision | Recall | F1 | False positive rate | False negative rate |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for label, metrics in (("All", overall), ("Held-out families", heldout), ("Development families", evaluation["development"])):
        lines.append(f"| {label} | {metrics['n']} | {_pct(metrics['accuracy'])} | {_pct(metrics['precision'])} | {_pct(metrics['recall'])} | {_pct(metrics['f1'])} | {_pct(metrics['false_positive_rate'])} | {_pct(metrics['false_negative_rate'])} |")
    baseline_overall = evaluation.get("baseline_overall")
    if baseline_overall:
        lines += ["", "### Original versus improved rules (same 220 records)", "", "| Metric | Original baseline | Improved rules | Change |", "|---|---:|---:|---:|"]
        for key, label in (("accuracy", "Accuracy"), ("precision", "Precision"), ("recall", "Recall"), ("f1", "F1"), ("false_positive_rate", "False positive rate"), ("false_negative_rate", "False negative rate")):
            before, after = baseline_overall[key], overall[key]
            delta = "Unavailable" if before is None or after is None else f"{after - before:+.1%}"
            lines.append(f"| {label} | {_pct(before)} | {_pct(after)} | {delta} |")
        lines += [
            "",
            f"Error counts: false negatives {baseline_overall['confusion_matrix']['false_negative']} → {overall['confusion_matrix']['false_negative']}; false positives {baseline_overall['confusion_matrix']['false_positive']} → {overall['confusion_matrix']['false_positive']}.",
            "",
            "#### Same grouped held-out families",
            "",
            "| Metric | Original baseline | Improved rules | Change |",
            "|---|---:|---:|---:|",
        ]
        baseline_heldout = evaluation.get("baseline_held_out_test")
        for key, label in (("accuracy", "Accuracy"), ("precision", "Precision"), ("recall", "Recall"), ("f1", "F1"), ("false_positive_rate", "False positive rate"), ("false_negative_rate", "False negative rate")):
            before, after = baseline_heldout[key], heldout[key]
            delta = "Unavailable" if before is None or after is None else f"{after - before:+.1%}"
            lines.append(f"| {label} | {_pct(before)} | {_pct(after)} | {delta} |")
        lines += [
            "",
            f"Archived baseline predictions: `{BASELINE_RESULT.relative_to(ROOT.parent)}`. Baseline predictions were remapped by record ID to this same family split; the original archived split and report remain unchanged.",
        ]
    lines += [
        "",
        "### 95% Wilson intervals (record-level)",
        "",
        "| Split | Accuracy | Precision | Recall | False positive rate | False negative rate |",
        "|---|---|---|---|---|---|",
    ]
    for label, metrics in (("All", overall), ("Held-out families", heldout), ("Development families", evaluation["development"])):
        lines.append("| " + label + " | " + " | ".join(_ci_text(metrics, key) for key in ("accuracy", "precision", "recall", "false_positive_rate", "false_negative_rate")) + " |")
    lines += ["", "Intervals use the Wilson binomial method. They treat records as independent; repeated variants within scenario families violate that assumption, so intervals understate uncertainty."]
    error_rows = [row for row in report["predictions"] if row["predicted_scam"] != (row["label"] == "scam")]
    fn_by_group: Counter[str] = Counter(row["category"] for row in error_rows if row["label"] == "scam")
    fp_by_group: Counter[str] = Counter(row["category"] for row in error_rows if row["label"] == "legitimate")
    lines += ["", "### Current error breakdown", "", "| Error | Category / safe scenario | Count |", "|---|---|---:|"]
    for category, count in sorted(fn_by_group.items()):
        lines.append(f"| False negative | {category} | {count} |")
    for category, count in sorted(fp_by_group.items()):
        lines.append(f"| False positive | {category} | {count} |")
    lines += ["", "## Confusion matrix", "", "```json", json.dumps(overall["confusion_matrix"], indent=2), "```", "", "## Language and category breakdown", "", "### Language", "", "| Language | N | Accuracy | Precision | Recall | F1 |", "|---|---:|---:|---:|---:|---:|"]
    for language, metrics in evaluation["per_language"].items():
        lines.append(f"| {language} | {metrics['n']} | {_pct(metrics['accuracy'])} | {_pct(metrics['precision'])} | {_pct(metrics['recall'])} | {_pct(metrics['f1'])} |")
    lines += ["", "### Scam category recall", "", "| Category | N | Warning recall | Expected signal recall |", "|---|---:|---:|---:|"]
    for category, metrics in evaluation["per_scam_category"].items():
        lines.append(f"| {category} | {metrics['n']} | {_pct(metrics['recall'])} | {_pct(metrics['expected_signal_recall'])} |")
    lines += ["", "## Latency and failures", "", f"- Rules-only mean/median/p95: {evaluation['latency_ms']['mean']:.4f} / {evaluation['latency_ms']['median']:.4f} / {evaluation['latency_ms']['p95']:.4f} ms per synthetic transcript in this local run.", f"- Detector failures: {evaluation['detector_failures']}", f"- Uncertainty rate: {_pct(evaluation['uncertainty_rate'])}", f"- Transcription failure rate: unavailable. {evaluation['transcription_failure_note']}", "", "## Ablation status", "", "| Component | Status |", "|---|---|"]
    for name, item in report["ablations"].items():
        reason = f" — {item['reason']}" if item.get("reason") else ""
        lines.append(f"| {name.replace('_', ' ').title()} | {item['status']}{reason} |")
    lines += ["", "## Limitations", ""] + [f"- {limitation}" for limitation in report["limitations"]]
    lines += ["", "## Reproduce", "", "```bash", "cd backend", "PYTHONPATH=.. python -m evaluation.generate_dataset", "PYTHONPATH=.. python -m evaluation.run_benchmark", "```", "", "The runner writes machine-readable per-record predictions to `evaluation/results/benchmark_results.json` and this report to `docs/EVALUATION_REPORT.md`.", ""]
    REPORT_DOC.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    report = evaluate(load_records())
    write_report(report)
    print(json.dumps({"dataset_records": report["dataset"]["records"], "overall": report["evaluation"]["overall"], "held_out_test": report["evaluation"]["held_out_test"], "results": str(RESULTS / "benchmark_results.json"), "report": str(REPORT_DOC)}, indent=2))


if __name__ == "__main__":
    main()
