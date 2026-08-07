from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Dict, Any, List

class ResumeCreate(BaseModel):
    title: str
    resume_data: Dict[str, Any]

class ResumeUpdate(BaseModel):
    title: str
    resume_data: Dict[str, Any]

class ResumeVersionResponse(BaseModel):
    id: UUID
    resume_id: UUID
    resume_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime
    latest_version: ResumeVersionResponse

    class Config:
        from_attributes = True
