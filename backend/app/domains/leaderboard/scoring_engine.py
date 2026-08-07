from typing import Dict, Any, List, Set

DEFAULT_WEIGHTS = {
    "coding": 0.35,
    "contribution": 0.25,
    "roadmap": 0.20,
    "portfolio": 0.20
}

def calculate_developer_score(raw_metrics: Dict[str, Any], weights: Dict[str, float] = None) -> Dict[str, Any]:
    """
    Pure, testable scoring function.
    Normalizes each component metric to a 0–100 scale before applying weighted summation.
    """
    w = weights or DEFAULT_WEIGHTS

    # 1. Coding Score (0–100)
    problems_solved = raw_metrics.get("problems_solved", 0)
    contest_rating = raw_metrics.get("contest_rating", 0)
    norm_coding = min(100.0, (problems_solved * 0.5) + (max(0, contest_rating - 1000) * 0.05))

    # 2. Contribution Score (0–100)
    total_commits = raw_metrics.get("total_commits", 0)
    total_stars = raw_metrics.get("total_stars", 0)
    norm_contribution = min(100.0, (total_commits * 0.1) + (total_stars * 2.0))

    # 3. Roadmap Score (0–100)
    norm_roadmap = min(100.0, float(raw_metrics.get("roadmap_completion_pct", 0.0)))

    # 4. Portfolio Score (0–100)
    total_views = raw_metrics.get("total_views", 0)
    project_count = raw_metrics.get("project_count", 0)
    norm_portfolio = min(100.0, (total_views * 0.5) + (project_count * 10.0))

    # Weighted Total Score
    total_score = round(
        (norm_coding * w["coding"]) +
        (norm_contribution * w["contribution"]) +
        (norm_roadmap * w["roadmap"]) +
        (norm_portfolio * w["portfolio"]),
        2
    )

    return {
        "total_score": total_score,
        "coding_score": round(norm_coding, 2),
        "contribution_score": round(norm_contribution, 2),
        "roadmap_score": round(norm_roadmap, 2),
        "portfolio_score": round(norm_portfolio, 2),
        "breakdown": {
            "coding": {"raw_problems": problems_solved, "raw_rating": contest_rating, "normalized": round(norm_coding, 2)},
            "contribution": {"raw_commits": total_commits, "raw_stars": total_stars, "normalized": round(norm_contribution, 2)},
            "roadmap": {"raw_completion_pct": norm_roadmap, "normalized": round(norm_roadmap, 2)},
            "portfolio": {"raw_views": total_views, "raw_projects": project_count, "normalized": round(norm_portfolio, 2)}
        }
    }

BADGE_RULES = [
    {"slug": "problem_solver_100", "title": "Century Solver", "description": "Solved 100+ coding problems", "type": "problems_solved", "threshold": 100},
    {"slug": "github_star_master", "title": "Star Master", "description": "Earned 10+ GitHub repository stars", "type": "total_stars", "threshold": 10},
    {"slug": "roadmap_hero", "title": "Roadmap Hero", "description": "Completed 100% of a learning roadmap", "type": "roadmap_completion_pct", "threshold": 100},
]

def evaluate_badge_rules(metrics: Dict[str, Any], existing_badge_slugs: Set[str]) -> List[Dict[str, Any]]:
    """
    Award-Only permanent badge evaluation function.
    Returns new badges to award; existing badges are never revoked.
    """
    new_badges = []
    for rule in BADGE_RULES:
        slug = rule["slug"]
        if slug in existing_badge_slugs:
            continue

        val = metrics.get(rule["type"], 0)
        if val >= rule["threshold"]:
            new_badges.append(rule)

    return new_badges
