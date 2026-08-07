from typing import Dict, Any, List, Optional

def detect_weak_areas(
    topic_analysis: Dict[str, Dict[str, int]],
    min_attempts: int = 5,
    solve_ratio_cutoff: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Pure deterministic weak-area detection engine.
    - Requires a minimum floor of `min_attempts` (default: 5) to prevent 0/1 noise.
    - Identifies topics where solve_ratio < `solve_ratio_cutoff` (default: 0.5).
    """
    weak_areas = []
    if not topic_analysis:
        return weak_areas

    for topic, stats in topic_analysis.items():
        solved = stats.get("solved", 0)
        attempts = stats.get("attempts", 0)

        if attempts < min_attempts:
            continue  # Skip topics with insufficient sample size

        ratio = solved / float(attempts) if attempts > 0 else 0.0
        if ratio < solve_ratio_cutoff:
            weak_areas.append({
                "topic": topic,
                "solved": solved,
                "attempts": attempts,
                "solve_ratio": round(ratio, 2),
                "severity": "high" if ratio < 0.3 else "moderate"
            })

    # Sort weak areas by worst solve ratio ascending, then by attempts descending
    weak_areas.sort(key=lambda x: (x["solve_ratio"], -x["attempts"]))
    return weak_areas
