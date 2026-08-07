from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from app.domains.resumes.schemas import ResumeCreate, ResumeResponse, ResumeUpdate
from app.domains.resumes.service import ResumeService
from app.api.dependencies import get_resume_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/resumes", tags=["resumes"])

class UpdateResumeRequest(BaseModel):
    resume_data: Dict[str, Any]

@router.post("/", response_model=ResumeResponse)
async def create_resume(
    req: ResumeCreate,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service)
):
    return await service.create_new_resume(str(current_user.id), req)

@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service)
):
    return await service.get_user_resumes(str(current_user.id))

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service)
):
    return await service.get_resume(str(current_user.id), resume_id)

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    req: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service)
):
    return await service.update_resume(str(current_user.id), resume_id, req.title, req.resume_data)
