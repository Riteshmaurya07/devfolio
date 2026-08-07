from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.domains.jobs.repository import JobRepository
from app.domains.jobs.models import JobApplication, Interview
from app.domains.jobs.state_machine import validate_status_transition
from app.domains.jobs.ics_exporter import generate_interview_ics
from app.domains.jobs.schemas import JobApplicationCreate
from app.core.exceptions import ValidationError, NotFoundError

class JobService:
    def __init__(self, repository: JobRepository):
        self.repository = repository

    async def create_application(self, profile_id: UUID, app_in: JobApplicationCreate) -> JobApplication:
        return await self.repository.create_application(profile_id, app_in.model_dump())

    async def update_status(self, application_id: UUID, new_status: str, reason: Optional[str] = None, force_override: bool = False) -> JobApplication:
        app = await self.repository.get_by_id(application_id)
        if not app:
            raise NotFoundError(message="Job application not found")

        # Enforce Server-Side State Machine Guard
        is_valid, msg = validate_status_transition(app.status, new_status, force_override=force_override)
        if not is_valid:
            raise ValidationError(message=msg)

        return await self.repository.update_status(application_id, new_status, reason)

    async def add_interview(self, application_id: UUID, scheduled_at: datetime, round_type: str, notes: Optional[str] = None) -> Interview:
        app = await self.repository.get_by_id(application_id)
        if not app:
            raise NotFoundError(message="Job application not found")
        return await self.repository.add_interview(application_id, scheduled_at, round_type, notes)

    async def export_interview_ics(self, interview_id: UUID) -> bytes:
        interview = await self.repository.get_interview_by_id(interview_id)
        if not interview:
            raise NotFoundError(message="Interview session not found")

        app = await self.repository.get_by_id(interview.job_application_id)
        return generate_interview_ics(
            interview_id=str(interview.id),
            company=app.company if app else "Company",
            role=app.role if app else "Role",
            scheduled_at=interview.scheduled_at
        )
