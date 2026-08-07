from datetime import datetime, timezone

def calculate_repo_health_score(
    last_commit_at: datetime | None,
    has_readme: bool,
    has_tests: bool,
    stars_count: int,
    forks_count: int
) -> int:
    """
    Pure deterministic heuristic algorithm calculating repository health score (0 to 100).
    - Commit Recency (Max 40 points)
    - Documentation / README (20 points)
    - Test suite presence (20 points)
    - Popularity & Forks ratio (Max 20 points)
    """
    score = 0

    # 1. Commit Recency (Max 40 pts)
    if last_commit_at:
        now = datetime.now(timezone.utc)
        if last_commit_at.tzinfo is None:
            last_commit_at = last_commit_at.replace(tzinfo=timezone.utc)
        
        days_since_commit = (now - last_commit_at).days
        if days_since_commit <= 7:
            score += 40
        elif days_since_commit <= 30:
            score += 30
        elif days_since_commit <= 90:
            score += 20
        elif days_since_commit <= 180:
            score += 10

    # 2. README Presence (20 pts)
    if has_readme:
        score += 20

    # 3. Test Files Presence (20 pts)
    if has_tests:
        score += 20

    # 4. Stars & Forks ratio (Max 20 pts)
    popularity = stars_count + (forks_count * 2)
    if popularity >= 50:
        score += 20
    elif popularity >= 20:
        score += 15
    elif popularity >= 5:
        score += 10
    elif popularity > 0:
        score += 5

    return min(100, score)
