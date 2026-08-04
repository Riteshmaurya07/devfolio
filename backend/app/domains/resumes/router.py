from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from app.domains.resumes.schemas import ResumeCreate, ResumeResponse
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

@router.post("/{resume_id}/versions", response_model=ResumeResponse)
async def update_resume_version(
    resume_id: str,
    req: UpdateResumeRequest,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service)
):
    return await service.update_resume(str(current_user.id), resume_id, req.resume_data)
