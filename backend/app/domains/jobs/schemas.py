from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class JobApplicationCreate(BaseModel):
    company: str
    role: str
    package: Optional[str] = None
    recruiter_contact: Optional[Dict[str, Any]] = None
    status: Optional[str] = "wishlist"
    notes: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    new_status: str
    reason: Optional[str] = None
    force_override: bool = False

class InterviewCreate(BaseModel):
    scheduled_at: datetime
    round_type: str = "technical"
    notes: Optional[str] = None

class InterviewResponse(BaseModel):
    id: UUID
    job_application_id: UUID
    scheduled_at: datetime
    round_type: str
    notes: Optional[str] = None
    is_reminder_sent: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JobStatusHistoryResponse(BaseModel):
    id: UUID
    previous_status: str
    new_status: str
    reason: Optional[str] = None
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JobApplicationResponse(BaseModel):
    id: UUID
    profile_id: UUID
    company: str
    role: str
    package: Optional[str] = None
    recruiter_contact: Dict[str, Any]
    status: str
    notes: Optional[str] = None
    attachments: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    history: List[JobStatusHistoryResponse] = []
    interviews: List[InterviewResponse] = []

    model_config = ConfigDict(from_attributes=True)
