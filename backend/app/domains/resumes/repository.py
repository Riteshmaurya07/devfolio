from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.domains.resumes.models import Resume, ResumeVersion

class ResumeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_resume(self, user_id: str, title: str) -> Resume:
        resume = Resume(user_id=user_id, title=title)
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def add_version(self, resume_id: str, resume_data: dict) -> ResumeVersion:
        version = ResumeVersion(resume_id=resume_id, resume_data=resume_data)
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        return version

    async def get_resumes_by_user(self, user_id: str) -> List[Resume]:
        # Fetch resumes and their latest version
        stmt = (
            select(Resume)
            .where(Resume.user_id == user_id)
            .options(selectinload(Resume.versions))
            .order_by(Resume.updated_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_resume_by_id(self, resume_id: str) -> Optional[Resume]:
        stmt = (
            select(Resume)
            .where(Resume.id == resume_id)
            .options(selectinload(Resume.versions))
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()
