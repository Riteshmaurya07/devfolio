from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, status
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.roadmaps.schemas import (
    RoadmapTemplateResponse, RoadmapProgressResponse, MilestoneToggleRequest, BookmarkToggleRequest
)
from app.domains.roadmaps.repository import RoadmapRepository
from app.domains.roadmaps.service import RoadmapService
from app.domains.profiles.repository import ProfileRepository
from app.domains.ai.service import AIService
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

def get_roadmap_service(db = Depends(get_db)) -> RoadmapService:
    return RoadmapService(RoadmapRepository(db))

def get_ai_service() -> AIService:
    return AIService()

@router.get("/templates", response_model=List[RoadmapTemplateResponse])
async def list_templates(service: RoadmapService = Depends(get_roadmap_service)):
    return await service.repository.get_all_templates()

@router.get("/templates/{slug}", response_model=RoadmapTemplateResponse)
async def get_template_by_slug(slug: str, service: RoadmapService = Depends(get_roadmap_service)):
    template = await service.repository.get_template_by_slug(slug)
    if not template:
        raise NotFoundError(message=f"Roadmap template '{slug}' not found.")
    return template

@router.post("/start", response_model=RoadmapProgressResponse)
async def start_roadmap(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.start_roadmap(profile.id, template_id)

@router.get("/my-progress", response_model=List[RoadmapProgressResponse])
async def get_my_progress(
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    
    progresses = await service.repository.get_all_my_progress(profile.id)
    res = []
    for p in progresses:
        res.append(await service.get_progress_response(p))
    return res

@router.put("/progress/{template_id}/milestone", response_model=RoadmapProgressResponse)
async def toggle_milestone(
    template_id: UUID,
    request: MilestoneToggleRequest,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.toggle_milestone(profile.id, template_id, request.milestone_id, request.is_completed)

@router.post("/progress/{template_id}/bookmark", response_model=RoadmapProgressResponse)
async def toggle_bookmark(
    template_id: UUID,
    request: BookmarkToggleRequest,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.toggle_bookmark(profile.id, template_id, request.milestone_id)

@router.post("/templates/{slug}/personalize")
async def personalize_roadmap(
    slug: str,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service),
    ai_service: AIService = Depends(get_ai_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.personalize_roadmap(profile.id, slug, profile.skills or [], ai_service)
