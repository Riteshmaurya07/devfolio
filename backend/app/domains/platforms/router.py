from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, status
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.platforms.schemas import ConnectPlatformRequest, CodingProfileResponse
from app.domains.platforms.repository import CodingProfileRepository
from app.domains.platforms.service import CodingDashboardService
from app.domains.profiles.repository import ProfileRepository
from app.domains.ai.service import AIService
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/platforms", tags=["platforms"])

def get_coding_service(db = Depends(get_db)) -> CodingDashboardService:
    return CodingDashboardService(CodingProfileRepository(db))

def get_ai_service() -> AIService:
    return AIService()

@router.get("/profiles", response_model=List[CodingProfileResponse])
async def get_my_coding_profiles(
    current_user: User = Depends(get_current_user),
    service: CodingDashboardService = Depends(get_coding_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.repository.get_all_by_profile_id(profile.id)

@router.post("/connect", response_model=CodingProfileResponse)
async def connect_platform(
    request: ConnectPlatformRequest,
    current_user: User = Depends(get_current_user),
    service: CodingDashboardService = Depends(get_coding_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.connect_platform(profile.id, request.platform, request.external_username)

@router.post("/{platform}/sync", response_model=CodingProfileResponse)
async def manual_sync_platform(
    platform: str,
    current_user: User = Depends(get_current_user),
    service: CodingDashboardService = Depends(get_coding_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.trigger_manual_sync(profile.id, platform)

@router.get("/dashboard/me")
async def get_my_dashboard_summary(
    current_user: User = Depends(get_current_user),
    service: CodingDashboardService = Depends(get_coding_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.get_dashboard_summary(profile.id)

@router.post("/recommendations")
async def get_ai_recommendations(
    current_user: User = Depends(get_current_user),
    service: CodingDashboardService = Depends(get_coding_service),
    ai_service: AIService = Depends(get_ai_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.get_ai_recommendations(profile.id, ai_service)
