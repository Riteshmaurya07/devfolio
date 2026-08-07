from datetime import datetime
from typing import Dict, Any, Tuple

VALID_TRANSITIONS = {
    "wishlist": ["applied", "rejected"],
    "applied": ["interview", "rejected", "wishlist"],
    "interview": ["offer", "rejected", "applied"],
    "offer": ["accepted", "rejected"],
    "rejected": [],
    "accepted": []
}

def validate_status_transition(current_status: str, new_status: str, force_override: bool = False) -> Tuple[bool, str]:
    """
    State machine transition validator.
    Prevents illegal status jumps (e.g. wishlist -> offer or rejected -> wishlist) unless force_override=True.
    """
    if current_status == new_status:
        return True, "No transition"

    if force_override:
        return True, "Force override applied"

    allowed = VALID_TRANSITIONS.get(current_status, [])
    if new_status in allowed:
        return True, "Valid transition"

    return False, f"Illegal status transition from '{current_status}' to '{new_status}'."
