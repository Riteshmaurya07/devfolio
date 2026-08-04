from fastapi import HTTPException
from app.domains.resumes.repository import ResumeRepository
from app.domains.resumes.schemas import ResumeCreate

class ResumeService:
    def __init__(self, repo: ResumeRepository):
        self.repo = repo

    async def create_new_resume(self, user_id: str, data: ResumeCreate):
        resume = await self.repo.create_resume(user_id, data.title)
        version = await self.repo.add_version(str(resume.id), data.resume_data)
        
        return {
            "id": resume.id,
            "title": resume.title,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at,
            "latest_version": version
        }

    async def get_user_resumes(self, user_id: str):
        resumes = await self.repo.get_resumes_by_user(user_id)
        
        response = []
        for r in resumes:
            # Sort versions by created_at desc to get the latest
            sorted_versions = sorted(r.versions, key=lambda v: v.created_at, reverse=True)
            latest = sorted_versions[0] if sorted_versions else None
            if latest:
                response.append({
                    "id": r.id,
                    "title": r.title,
                    "created_at": r.created_at,
                    "updated_at": r.updated_at,
                    "latest_version": latest
                })
        return response

    async def update_resume(self, user_id: str, resume_id: str, resume_data: dict):
        resume = await self.repo.get_resume_by_id(resume_id)
        if not resume or str(resume.user_id) != user_id:
            raise HTTPException(status_code=404, detail="Resume not found")
            
        version = await self.repo.add_version(resume_id, resume_data)
        return {
            "id": resume.id,
            "title": resume.title,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at,
            "latest_version": version
        }
