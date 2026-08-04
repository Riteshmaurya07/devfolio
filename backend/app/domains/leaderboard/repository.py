from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.domains.leaderboard.models import UserMetrics
from app.domains.users.models import User

class LeaderboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_global_leaderboard(self, limit: int = 100):
        # Join UserMetrics and User to get username/avatar
        stmt = (
            select(UserMetrics, User)
            .join(User, User.id == UserMetrics.user_id)
            .order_by(desc(UserMetrics.developer_score))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.all()

    async def get_friends_leaderboard(self, user_id: str, limit: int = 100):
        # In the future, this will join with FRIEND_REQUESTS.
        # For now, it returns empty or just the user.
        # Stub implementation for Milestone 5:
        return []
