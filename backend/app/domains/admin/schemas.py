from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class UserReportCreate(BaseModel):
    target_type: str  # post, comment, user
    target_id: UUID
    reason: str

class UserReportResponse(BaseModel):
    id: UUID
    reporter_id: UUID
    target_type: str
    target_id: UUID
    reason: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SuspendUserRequest(BaseModel):
    is_suspended: bool
    reason: Optional[str] = "Admin action"

class SoftDeleteRequest(BaseModel):
    reason: Optional[str] = "Inappropriate content"

class ReportStatusUpdate(BaseModel):
    status: str  # resolved, dismissed

class AdminAuditLogResponse(BaseModel):
    id: UUID
    admin_id: UUID
    action_type: str
    target_id: UUID
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
