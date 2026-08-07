import pytest
from app.domains.roadmaps.calculator import calculate_roadmap_completion
from app.domains.roadmaps.seed_data import SEED_ROADMAPS

def test_roadmap_completion_calculator():
    # 1. Half completed
    states_half = {"m1": True, "m2": True, "m3": False, "m4": False}
    pct_half = calculate_roadmap_completion(total_milestones=4, milestone_states=states_half)
    assert pct_half == 50.0

    # 2. Fully completed
    states_full = {"m1": True, "m2": True, "m3": True}
    pct_full = calculate_roadmap_completion(total_milestones=3, milestone_states=states_full)
    assert pct_full == 100.0

    # 3. Zero / Empty edge case
    pct_zero = calculate_roadmap_completion(total_milestones=5, milestone_states={})
    assert pct_zero == 0.0

def test_seed_data_milestone_id_stability():
    for roadmap in SEED_ROADMAPS:
        assert "slug" in roadmap
        assert "milestones" in roadmap
        m_ids = [m["id"] for m in roadmap["milestones"]]
        # Ensure all milestone IDs are unique within template
        assert len(m_ids) == len(set(m_ids))
        # Ensure IDs follow stable format ("m1", "m2", etc.)
        for m_id in m_ids:
            assert m_id.startswith("m")
