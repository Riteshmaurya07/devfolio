from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.domains.jobs.models import JobApplication, JobStatusHistory, Interview

class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_profile_id(self, profile_id: UUID) -> List[JobApplication]:
        res = await self.db.execute(
            select(JobApplication)
            .where(JobApplication.profile_id == profile_id)
            .order_by(JobApplication.updated_at.desc())
        )
        return res.scalars().all()

    async def get_by_id(self, application_id: UUID) -> Optional[JobApplication]:
        res = await self.db.execute(
            select(JobApplication).where(JobApplication.id == application_id)
        )
        return res.scalars().first()

    async def create_application(self, profile_id: UUID, data: dict) -> JobApplication:
        app = JobApplication(
            profile_id=profile_id,
            company=data["company"],
            role=data["role"],
            package=data.get("package"),
            recruiter_contact=data.get("recruiter_contact") or {},
            status=data.get("status", "wishlist"),
            notes=data.get("notes")
        )
        self.db.add(app)
        await self.db.commit()
        await self.db.refresh(app)
        return app

    async def update_status(self, application_id: UUID, new_status: str, reason: Optional[str] = None) -> JobApplication:
        app = await self.get_by_id(application_id)
        if not app:
            return None

        history = JobStatusHistory(
            job_application_id=app.id,
            previous_status=app.status,
            new_status=new_status,
            reason=reason
        )
        self.db.add(history)
        app.status = new_status
        await self.db.commit()
        await self.db.refresh(app)
        return app

    async def add_interview(self, application_id: UUID, scheduled_at: datetime, round_type: str, notes: Optional[str] = None) -> Interview:
        interview = Interview(
            job_application_id=application_id,
            scheduled_at=scheduled_at,
            round_type=round_type,
            notes=notes,
            is_reminder_sent=False
        )
        self.db.add(interview)
        await self.db.commit()
        await self.db.refresh(interview)
        return interview

    async def update_interview(self, interview_id: UUID, scheduled_at: datetime) -> Interview:
        res = await self.db.execute(select(Interview).where(Interview.id == interview_id))
        interview = res.scalars().first()
        if interview:
            # Reschedule Reset Policy: Reset is_reminder_sent = False on time change
            interview.scheduled_at = scheduled_at
            interview.is_reminder_sent = False
            await self.db.commit()
            await self.db.refresh(interview)
        return interview

    async def get_interview_by_id(self, interview_id: UUID) -> Optional[Interview]:
        res = await self.db.execute(select(Interview).where(Interview.id == interview_id))
        return res.scalars().first()
