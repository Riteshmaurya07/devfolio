from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.domains.leaderboard.models import LeaderboardEntry, Badge, UserBadge

class LeaderboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_global_rankings(self, page: int = 1, page_size: int = 20) -> Tuple[List[LeaderboardEntry], int]:
        offset = (page - 1) * page_size
        # Deterministic secondary rank sort: total_score DESC, updated_at ASC, profile_id ASC
        res = await self.db.execute(
            select(LeaderboardEntry)
            .order_by(LeaderboardEntry.total_score.desc(), LeaderboardEntry.updated_at.asc(), LeaderboardEntry.profile_id.asc())
            .offset(offset)
            .limit(page_size)
        )
        entries = res.scalars().all()

        count_res = await self.db.execute(text("SELECT COUNT(*) FROM leaderboard_entries"))
        total_count = count_res.scalar() or 0

        return entries, total_count

    async def get_by_profile_id(self, profile_id: UUID) -> Optional[LeaderboardEntry]:
        res = await self.db.execute(
            select(LeaderboardEntry).where(LeaderboardEntry.profile_id == profile_id)
        )
        return res.scalars().first()

    async def get_user_badges(self, profile_id: UUID) -> List[UserBadge]:
        res = await self.db.execute(
            select(UserBadge).where(UserBadge.profile_id == profile_id)
        )
        return res.scalars().all()
