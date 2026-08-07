from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response, UploadFile, File
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.resumes.schemas import (
    ResumeVersionResponse, ResumeVersionCreate, ResumeVersionUpdate, ATSReviewRequest, ATSReviewResponse
)
from app.domains.resumes.repository import ResumeRepository
from app.domains.resumes.service import ResumeService
from app.domains.resumes.parser import parse_resume_file_library_first
from app.domains.profiles.repository import ProfileRepository
from app.domains.portfolio.repository import PortfolioRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/resumes", tags=["resumes"])

def get_resume_service(db = Depends(get_db)) -> ResumeService:
    return ResumeService(ResumeRepository(db))

@router.get("", response_model=List[ResumeVersionResponse])
@router.get("/me", response_model=List[ResumeVersionResponse])
async def get_my_resumes(
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        return []
    return await service.repository.get_all_by_profile_id(profile.id)

@router.post("/generate-from-profile")
async def generate_from_profile(
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")

    portfolio_repo = PortfolioRepository(db)
    portfolio = await portfolio_repo.get_by_profile_id(profile.id)

    return await service.generate_from_profile(profile, portfolio)

@router.post("", response_model=ResumeVersionResponse)
async def create_resume_version(
    version_in: ResumeVersionCreate,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        from app.domains.profiles.schemas import ProfileCreate
        safe_username = f"user_{str(current_user.id)[:8]}" if current_user.username.lower() in {"edit", "me", "api", "admin", "dashboard", "login", "register", "u", "settings", "profiles", "users", "health", "roadmaps", "resumes"} else current_user.username
        profile = await profile_repo.create(
            current_user.id, 
            ProfileCreate(username=safe_username, name=current_user.username or "Developer", email=current_user.email)
        )
    return await service.create_version(profile.id, version_in)

@router.post("/{version_id}/activate", response_model=ResumeVersionResponse)
async def activate_resume_version(
    version_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.repository.activate_version(profile.id, version_id)

@router.post("/upload-and-parse")
async def upload_and_parse(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    file_bytes = await file.read()
    return parse_resume_file_library_first(file_bytes, file.filename or "resume.pdf")

@router.get("/{version_id}/export/pdf")
async def export_pdf(
    version_id: UUID,
    service: ResumeService = Depends(get_resume_service)
):
    pdf_bytes = await service.export_pdf(version_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=resume_{version_id}.pdf",
            "Cache-Control": "private, max-age=3600"
        }
    )

@router.get("/{version_id}/export/docx")
async def export_docx(
    version_id: UUID,
    service: ResumeService = Depends(get_resume_service)
):
    docx_bytes = await service.export_docx(version_id)
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=resume_{version_id}.docx",
            "Cache-Control": "private, max-age=3600"
        }
    )

@router.post("/{version_id}/review-ats", response_model=ATSReviewResponse)
async def review_ats(
    version_id: UUID,
    request: ATSReviewRequest,
    service: ResumeService = Depends(get_resume_service)
):
    return await service.review_ats(version_id, request.target_role)
