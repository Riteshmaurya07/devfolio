from fastapi import APIRouter, Depends
from app.domains.leaderboard.schemas import LeaderboardResponse
from app.domains.leaderboard.service import LeaderboardService
from app.api.dependencies import get_leaderboard_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("/global", response_model=LeaderboardResponse)
async def get_global_leaderboard(
    service: LeaderboardService = Depends(get_leaderboard_service)
):
    users = await service.get_global_leaderboard()
    return {"users": users}

@router.get("/friends", response_model=LeaderboardResponse)
async def get_friends_leaderboard(
    current_user: User = Depends(get_current_user),
    service: LeaderboardService = Depends(get_leaderboard_service)
):
    users = await service.get_friends_leaderboard(str(current_user.id))
    return {"users": users}
