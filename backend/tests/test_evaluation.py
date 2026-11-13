"""Offline checks for corpus reproducibility and metric calculations."""

import sys
from pathlib import Path

import pytest

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPOSITORY_ROOT))

from evaluation.generate_dataset import build_records  # noqa: E402
from evaluation.run_benchmark import calculate_metrics, keyword_only_matches, load_records  # noqa: E402


def test_generator_creates_220_unique_labeled_synthetic_records() -> None:
    first = build_records()
    second = build_records()
    assert len(first) == 220
    assert [row["id"] for row in first] == [row["id"] for row in second]
    assert len({row["id"] for row in first}) == 220
    assert {row["label"] for row in first} == {"scam", "legitimate"}
    assert {row["language"] for row in first} == {"English", "Hindi", "Hinglish"}


def test_related_scenario_families_never_cross_dataset_splits() -> None:
    splits_by_family: dict[str, set[str]] = {}
    for row in build_records():
        splits_by_family.setdefault(row["scenario_family"], set()).add(row["split"])
    assert all(len(splits) == 1 for splits in splits_by_family.values())


def test_metric_calculation_handles_confusion_matrix_and_missing_denominators() -> None:
    rows = [
        {"label": "scam", "predicted_scam": True},
        {"label": "scam", "predicted_scam": False},
        {"label": "legitimate", "predicted_scam": True},
        {"label": "legitimate", "predicted_scam": False},
    ]
    metrics = calculate_metrics(rows)
    assert metrics["confusion_matrix"] == {
        "true_positive": 1,
        "false_positive": 1,
        "true_negative": 1,
        "false_negative": 1,
    }
    assert metrics["accuracy"] == pytest.approx(0.5)
    assert metrics["precision"] == pytest.approx(0.5)
    assert metrics["recall"] == pytest.approx(0.5)

    no_positive_predictions = calculate_metrics([
        {"label": "scam", "predicted_scam": False},
        {"label": "legitimate", "predicted_scam": False},
    ])
    assert no_positive_predictions["precision"] is None


def test_checked_in_dataset_loads_and_preserves_family_splits() -> None:
    records = load_records()
    assert len(records) == 220
    assert len({row["scenario_family"] for row in records}) == 35
    held_out = [row for row in records if row["split"] == "held_out_test"]
    assert len({row["scenario_family"] for row in held_out}) == 7
    assert len({row["scenario_family"] for row in records if row["split"] == "development"}) == 28
    assert all(row["source_split"] in {"development", "held_out_test"} for row in records)
    assert all(row["audio_provenance"] == "synthetic_text_only_no_audio" for row in records)
    splits_by_family: dict[str, set[str]] = {}
    for row in records:
        splits_by_family.setdefault(row["scenario_family"], set()).add(row["split"])
    assert all(len(splits) == 1 for splits in splits_by_family.values())


def test_metric_confidence_intervals_include_small_sample_bounds() -> None:
    metrics = calculate_metrics([
        {"label": "scam", "predicted_scam": True},
        {"label": "legitimate", "predicted_scam": False},
    ])
    interval = metrics["confidence_intervals_95_wilson"]["accuracy"]
    assert interval is not None
    assert interval[0] < 1
    assert interval[1] == pytest.approx(1)


def test_keyword_baseline_matches_tokens_without_understanding_negation() -> None:
    assert keyword_only_matches("Tell me the OTP and UPI PIN") == ["OTP", "UPI", "PIN"]
    # This documented false-positive mode is why the keyword baseline is naive.
    assert keyword_only_matches("Never share your OTP with anyone") == ["OTP"]
    assert keyword_only_matches("The account will be blocked") == []
