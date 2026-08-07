import pytest
from app.domains.jobs.state_machine import validate_status_transition

def test_status_transition_valid():
    ok, msg = validate_status_transition("wishlist", "applied")
    assert ok is True

    ok, msg = validate_status_transition("applied", "interview")
    assert ok is True

    ok, msg = validate_status_transition("interview", "offer")
    assert ok is True

def test_status_transition_invalid_jumps():
    # Direct jump wishlist -> offer (Invalid)
    ok, msg = validate_status_transition("wishlist", "offer")
    assert ok is False
    assert "Illegal status transition" in msg

    # Jump rejected -> wishlist without override (Invalid)
    ok, msg = validate_status_transition("rejected", "wishlist")
    assert ok is False

def test_status_transition_force_override():
    ok, msg = validate_status_transition("rejected", "wishlist", force_override=True)
    assert ok is True
    assert "Force override" in msg
