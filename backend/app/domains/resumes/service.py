from typing import Optional, List
from uuid import UUID
from app.domains.resumes.repository import ResumeRepository
from app.domains.resumes.models import ResumeVersion
from app.domains.resumes.schemas import ResumeVersionCreate, ResumeVersionUpdate
from app.domains.resumes.pdf_generator import generate_pdf_bytes
from app.domains.resumes.docx_generator import generate_docx_bytes
from app.domains.resumes.ats_scorer import calculate_ats_score
from app.domains.profiles.models import Profile
from app.domains.portfolio.models import PortfolioConfig
from app.core.exceptions import NotFoundError

class ResumeService:
    def __init__(self, repository: ResumeRepository):
        self.repository = repository

    async def generate_from_profile(self, profile: Profile, portfolio: Optional[PortfolioConfig]) -> dict:
        contact = {
            "name": profile.name or "",
            "email": profile.email or "",
            "phone": profile.phone or "",
            "location": profile.location or "",
            "website": profile.website or "",
            "linkedin": "",
            "github": f"https://github.com/{profile.username}"
        }

        experiences = []
        if portfolio and portfolio.experiences:
            for exp in portfolio.experiences:
                experiences.append({
                    "company": exp.company,
                    "position": exp.position,
                    "location": exp.location or "",
                    "start_date": exp.start_date,
                    "end_date": exp.end_date or "Present",
                    "is_current": exp.is_current,
                    "highlights": [exp.description] if exp.description else []
                })

        projects = []
        if portfolio and portfolio.projects:
            for proj in portfolio.projects:
                projects.append({
                    "title": proj.title,
                    "description": proj.description or "",
                    "tech_stack": proj.tech_stack or [],
                    "repo_url": proj.repo_url or "",
                    "demo_url": proj.demo_url or ""
                })

        return {
            "contact": contact,
            "summary": profile.bio or profile.about or "",
            "skills": profile.skills or [],
            "experience": experiences,
            "education": [],
            "projects": projects,
            "certifications": []
        }

    async def get_resume(self, user_id: str, version_id: str):
        from fastapi import HTTPException
        version = await self.repository.get_by_id(UUID(version_id))
        if not version:
            raise HTTPException(status_code=404, detail="Resume not found")
        return version

    async def update_resume(self, user_id: str, version_id: str, title: str, resume_data: dict):
        from fastapi import HTTPException
        version = await self.repository.update_version(UUID(version_id), title, resume_data)
        if not version:
            raise HTTPException(status_code=404, detail="Resume not found")
        return version

    async def create_version(self, profile_id: UUID, version_in: ResumeVersionCreate) -> ResumeVersion:
        return await self.repository.create_version(
            profile_id=profile_id,
            title=version_in.title,
            template_name=version_in.template_name,
            content=version_in.content.model_dump(),
            is_active=True
        )

    async def export_pdf(self, version_id: UUID) -> bytes:
        version = await self.repository.get_by_id(version_id)
        if not version:
            raise NotFoundError(message="Resume version not found")
        return generate_pdf_bytes(version.content, version.template_name)

    async def export_docx(self, version_id: UUID) -> bytes:
        version = await self.repository.get_by_id(version_id)
        if not version:
            raise NotFoundError(message="Resume version not found")
        return generate_docx_bytes(version.content, version.template_name)

    async def review_ats(self, version_id: UUID, target_role: Optional[str] = None) -> dict:
        version = await self.repository.get_by_id(version_id)
        if not version:
            raise NotFoundError(message="Resume version not found")
        return calculate_ats_score(version.content, target_role)
