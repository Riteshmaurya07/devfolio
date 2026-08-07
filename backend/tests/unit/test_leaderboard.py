import pytest
from app.domains.leaderboard.scoring_engine import calculate_developer_score, evaluate_badge_rules

def test_calculate_developer_score_normalization_bounds():
    """Verify that component scores are normalized to 0-100 before applying weights."""
    raw_metrics = {
        "problems_solved": 500,  # high count
        "contest_rating": 2500,  # high rating
        "total_commits": 2000,   # high commits
        "total_stars": 100,      # high stars
        "roadmap_completion_pct": 100.0,
        "total_views": 10000,
        "project_count": 20
    }

    res = calculate_developer_score(raw_metrics)

    # Component scores must not exceed 100.0
    assert res["coding_score"] <= 100.0
    assert res["contribution_score"] <= 100.0
    assert res["roadmap_score"] <= 100.0
    assert res["portfolio_score"] <= 100.0

    # Total weighted score must be <= 100.0
    assert res["total_score"] <= 100.0
    assert res["total_score"] > 0.0

def test_calculate_developer_score_defaults():
    raw_metrics = {}
    res = calculate_developer_score(raw_metrics)
    assert res["total_score"] == 0.0

def test_evaluate_badge_rules_exact_threshold():
    """Verify exact-at-threshold evaluation and award-only permanence."""
    raw_metrics = {
        "problems_solved": 100,  # Exact threshold for problem_solver_100
        "total_stars": 9,        # Below threshold for github_star_master (10)
        "roadmap_completion_pct": 100
    }

    existing_badges = set()
    new_badges = evaluate_badge_rules(raw_metrics, existing_badges)

    awarded_slugs = [b["slug"] for b in new_badges]
    assert "problem_solver_100" in awarded_slugs
    assert "roadmap_hero" in awarded_slugs
    assert "github_star_master" not in awarded_slugs

def test_evaluate_badge_rules_permanence():
    """Verify existing badges are never revoked even if metrics drop."""
    raw_metrics = {
        "problems_solved": 10  # Dropped below 100
    }
    existing_badges = {"problem_solver_100"}
    new_badges = evaluate_badge_rules(raw_metrics, existing_badges)

    assert len(new_badges) == 0  # No duplicate or revoked badges
