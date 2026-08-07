from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.jobs.schemas import (
    JobApplicationResponse, JobApplicationCreate, StatusUpdateRequest, InterviewCreate, InterviewResponse
)
from app.domains.jobs.repository import JobRepository
from app.domains.jobs.service import JobService
from app.domains.profiles.repository import ProfileRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/jobs", tags=["jobs"])

def get_job_service(db = Depends(get_db)) -> JobService:
    return JobService(JobRepository(db))

@router.get("/applications", response_model=List[JobApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    service: JobService = Depends(get_job_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.repository.get_all_by_profile_id(profile.id)

@router.post("/applications", response_model=JobApplicationResponse)
async def create_application(
    app_in: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    service: JobService = Depends(get_job_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.create_application(profile.id, app_in)

@router.put("/applications/{application_id}/status", response_model=JobApplicationResponse)
async def update_application_status(
    application_id: UUID,
    request: StatusUpdateRequest,
    service: JobService = Depends(get_job_service)
):
    return await service.update_status(
        application_id=application_id,
        new_status=request.new_status,
        reason=request.reason,
        force_override=request.force_override
    )

@router.post("/applications/{application_id}/interviews", response_model=InterviewResponse)
async def add_interview(
    application_id: UUID,
    request: InterviewCreate,
    service: JobService = Depends(get_job_service)
):
    return await service.add_interview(
        application_id=application_id,
        scheduled_at=request.scheduled_at,
        round_type=request.round_type,
        notes=request.notes
    )

@router.get("/interviews/{interview_id}/export.ics")
async def export_interview_ics(
    interview_id: UUID,
    service: JobService = Depends(get_job_service)
):
    ics_bytes = await service.export_interview_ics(interview_id)
    return Response(
        content=ics_bytes,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=interview_{interview_id}.ics",
            "Cache-Control": "private, max-age=3600"
        }
    )
