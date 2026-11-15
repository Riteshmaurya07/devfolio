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
        formatted = []
        for e in entries:
            p = getattr(e, 'profile', None)
            username = p.username if p and p.username else f"dev_{str(e.profile_id)[:6]}"
            name = p.name if p and p.name else username
            avatar = p.avatar_url if p else None
            coding_meta = e.score_breakdown.get('coding', {}) if isinstance(e.score_breakdown, dict) else {}
            problems = coding_meta.get('raw_problems', 0)

            formatted.append({
                "id": str(e.id),
                "profile_id": str(e.profile_id),
                "rank": e.rank,
                "total_score": e.total_score,
                "developer_score": e.total_score,
                "coding_score": e.coding_score,
                "contribution_score": e.contribution_score,
                "roadmap_score": e.roadmap_score,
                "portfolio_score": e.portfolio_score,
                "score_breakdown": e.score_breakdown,
                "profile_name": name,
                "profile_username": username,
                "username": username,
                "avatar_url": avatar,
                "total_problems_solved": problems,
                "current_streak": 0
            })

        return {
            "rankings": formatted,
            "page": page,
            "page_size": page_size,
            "total_count": total_count
        }

    async def get_user_rank_and_breakdown(self, profile_id: UUID) -> Dict[str, Any]:
        entry = await self.repository.get_by_profile_id(profile_id)
        if not entry:
            try:
                from app.domains.leaderboard.tasks import recompute_leaderboard_rankings_task
                recompute_leaderboard_rankings_task()
                entry = await self.repository.get_by_profile_id(profile_id)
            except Exception:
                pass

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
