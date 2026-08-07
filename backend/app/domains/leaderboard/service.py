from typing import Optional, List, Dict, Any
from uuid import UUID
from app.domains.leaderboard.repository import LeaderboardRepository
from app.domains.leaderboard.models import LeaderboardEntry, UserBadge
from app.core.exceptions import NotFoundError

class LeaderboardService:
    def __init__(self, repository: LeaderboardRepository):
        self.repository = repository

    async def get_global_rankings(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        entries, total_count = await self.repository.get_global_rankings(page, page_size)
        return {
            "rankings": entries,
            "page": page,
            "page_size": page_size,
            "total_count": total_count
        }

    async def get_user_rank_and_breakdown(self, profile_id: UUID) -> Dict[str, Any]:
        entry = await self.repository.get_by_profile_id(profile_id)
        if not entry:
            # Fallback for unranked profile
            return {
                "rank": 0,
                "total_score": 0.0,
                "coding_score": 0.0,
                "contribution_score": 0.0,
                "roadmap_score": 0.0,
                "portfolio_score": 0.0,
                "score_breakdown": {}
            }
        return {
            "rank": entry.rank,
            "total_score": entry.total_score,
            "coding_score": entry.coding_score,
            "contribution_score": entry.contribution_score,
            "roadmap_score": entry.roadmap_score,
            "portfolio_score": entry.portfolio_score,
            "score_breakdown": entry.score_breakdown
        }

    async def get_user_badges(self, profile_id: UUID) -> List[UserBadge]:
        return await self.repository.get_user_badges(profile_id)
