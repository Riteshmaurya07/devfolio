import pytest
from app.domains.leaderboard.scoring_engine import calculate_developer_score

def test_calculate_developer_score_basic():
    raw_metrics = {
        "problems_solved": 100,
        "contest_rating": 1500,
        "total_commits": 500,
        "total_stars": 50,
        "roadmap_completion_pct": 50,
        "total_views": 1000,
        "project_count": 5
    }
    score = calculate_developer_score(raw_metrics)
    
    assert "total_score" in score
    assert "coding_score" in score
    assert "contribution_score" in score
    assert "roadmap_score" in score
    assert "portfolio_score" in score
    
    assert score["total_score"] > 0
    assert score["total_score"] <= 100.0

def test_calculate_developer_score_empty():
    score = calculate_developer_score({})
    assert score["total_score"] == 0.0
    assert score["coding_score"] == 0.0
    assert score["contribution_score"] == 0.0
    assert score["roadmap_score"] == 0.0
    assert score["portfolio_score"] == 0.0

def test_calculate_developer_score_custom_weights():
    raw_metrics = {
        "problems_solved": 100,
        "contest_rating": 1500,
        "total_commits": 10,
        "total_stars": 2,
        "roadmap_completion_pct": 10,
        "total_views": 10,
        "project_count": 1
    }
    
    weights = {
        "coding": 0.5,
        "contribution": 0.3,
        "roadmap": 0.1,
        "portfolio": 0.1
    }
    
    score = calculate_developer_score(raw_metrics, weights=weights)
    assert score["total_score"] > 0
    
def test_calculate_developer_score_high_values():
    raw_metrics = {
        "problems_solved": 5000,
        "contest_rating": 4000,
        "total_commits": 10000,
        "total_stars": 5000,
        "roadmap_completion_pct": 150,
        "total_views": 10000,
        "project_count": 50
    }
    score = calculate_developer_score(raw_metrics)
    assert score["total_score"] <= 100.0
