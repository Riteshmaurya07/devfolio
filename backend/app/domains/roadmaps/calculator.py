from typing import Dict, Any

def calculate_roadmap_completion(total_milestones: int, milestone_states: Dict[str, bool]) -> float:
    """
    Pure deterministic progress calculation function.
    Returns percentage completed (0.0 to 100.0).
    """
    if total_milestones <= 0 or not milestone_states:
        return 0.0

    completed_count = sum(1 for is_done in milestone_states.values() if is_done)
    percentage = (completed_count / total_milestones) * 100.0
    return round(min(100.0, max(0.0, percentage)), 1)
