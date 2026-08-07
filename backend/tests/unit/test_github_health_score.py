import pytest
from datetime import datetime, timezone, timedelta
from app.domains.github.health_score import calculate_repo_health_score

def test_health_score_calculation():
    now = datetime.now(timezone.utc)

    # 1. Active repo with README, tests, high stars
    score_active = calculate_repo_health_score(
        last_commit_at=now - timedelta(days=2),
        has_readme=True,
        has_tests=True,
        stars_count=30,
        forks_count=10
    )
    assert score_active == 100  # 40 (recency) + 20 (readme) + 20 (tests) + 20 (popularity >= 50: 30 + 10*2 = 50)

    # 2. Inactive repo without tests or readme
    score_inactive = calculate_repo_health_score(
        last_commit_at=now - timedelta(days=200),
        has_readme=False,
        has_tests=False,
        stars_count=0,
        forks_count=0
    )
    assert score_inactive == 0

    # 3. Maximum score cap at 100
    score_max = calculate_repo_health_score(
        last_commit_at=now,
        has_readme=True,
        has_tests=True,
        stars_count=100,
        forks_count=50
    )
    assert score_max == 100
