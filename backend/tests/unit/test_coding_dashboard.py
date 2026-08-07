import pytest
from app.domains.platforms.weak_area_detector import detect_weak_areas

SAMPLE_TOPIC_ANALYSIS = {
    "Dynamic Programming": {"solved": 2, "attempts": 10},   # Ratio: 0.2, attempts >= 5 -> WEAK
    "Graphs": {"solved": 8, "attempts": 10},             # Ratio: 0.8 -> NOT WEAK
    "Arrays": {"solved": 0, "attempts": 2},                 # Attempts < 5 -> SKIPPED (No 0/1 noise)
    "Segment Trees": {"solved": 1, "attempts": 6}           # Ratio: 0.16 -> WEAK
}

def test_weak_area_detector_attempt_floor():
    weak = detect_weak_areas(SAMPLE_TOPIC_ANALYSIS, min_attempts=5, solve_ratio_cutoff=0.5)
    topics = [w["topic"] for w in weak]

    # "Arrays" with 2 attempts MUST be skipped despite 0% ratio
    assert "Arrays" not in topics
    assert "Graphs" not in topics

    assert "Segment Trees" in topics
    assert "Dynamic Programming" in topics

def test_weak_area_detector_empty():
    assert detect_weak_areas({}) == []
