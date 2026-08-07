from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ConnectPlatformRequest(BaseModel):
    platform: str
    external_username: str

class CodingProfileResponse(BaseModel):
    id: UUID
    profile_id: UUID
    platform: str
    external_username: str
    sync_status: str
    sync_error_message: Optional[str] = None
    ai_recommendation: Optional[Dict[str, Any]] = None
    last_synced_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
