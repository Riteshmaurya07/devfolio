from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.leaderboard.schemas import LeaderboardEntryResponse, UserBadgeResponse
from app.domains.leaderboard.repository import LeaderboardRepository
from app.domains.leaderboard.service import LeaderboardService
from app.domains.profiles.repository import ProfileRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

def get_leaderboard_service(db = Depends(get_db)) -> LeaderboardService:
    return LeaderboardService(LeaderboardRepository(db))

@router.get("/global")
async def get_global_leaderboard(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: LeaderboardService = Depends(get_leaderboard_service)
):
    return await service.get_global_rankings(page, page_size)

@router.get("/me")
async def get_my_rank_and_score(
    current_user: User = Depends(get_current_user),
    service: LeaderboardService = Depends(get_leaderboard_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        return {
            "rank": 0,
            "total_score": 0.0,
            "coding_score": 0.0,
            "contribution_score": 0.0,
            "roadmap_score": 0.0,
            "portfolio_score": 0.0,
            "score_breakdown": {}
        }
    return await service.get_user_rank_and_breakdown(profile.id)

@router.get("/badges")
async def get_my_badges(
    current_user: User = Depends(get_current_user),
    service: LeaderboardService = Depends(get_leaderboard_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        return []
    return await service.get_user_badges(profile.id)
