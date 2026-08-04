from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from app.domains.roadmaps.schemas import RoadmapCreate, RoadmapResponse
from app.domains.roadmaps.service import RoadmapService
from app.api.dependencies import get_roadmap_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

class ToggleTaskRequest(BaseModel):
    is_completed: bool

@router.post("/", response_model=RoadmapResponse)
async def generate_roadmap(
    req: RoadmapCreate,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service)
):
    return await service.generate_roadmap(str(current_user.id), req)

@router.get("/", response_model=List[RoadmapResponse])
async def list_roadmaps(
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service)
):
    return await service.get_roadmaps(str(current_user.id))

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service)
):
    return await service.get_roadmap(str(current_user.id), roadmap_id)

@router.post("/{roadmap_id}/tasks/{task_id}/toggle")
async def toggle_task(
    roadmap_id: str,
    task_id: str,
    req: ToggleTaskRequest,
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(get_roadmap_service)
):
    return await service.toggle_task_completion(str(current_user.id), roadmap_id, task_id, req.is_completed)
