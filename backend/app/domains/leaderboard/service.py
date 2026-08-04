from app.domains.leaderboard.repository import LeaderboardRepository

class LeaderboardService:
    def __init__(self, repo: LeaderboardRepository):
        self.repo = repo

    async def get_global_leaderboard(self):
        rows = await self.repo.get_global_leaderboard()
        return [
            {
                "username": user.username,
                "avatar_url": user.avatar_url,
                "developer_score": metrics.developer_score,
                "total_problems_solved": metrics.total_problems_solved,
                "current_streak": metrics.current_streak,
            }
            for metrics, user in rows
        ]

    async def get_friends_leaderboard(self, user_id: str):
        # Stub for when friends system is implemented
        return []
