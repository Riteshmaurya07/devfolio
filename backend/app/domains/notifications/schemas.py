from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: UUID
    category: str = "system"
    notification_type: str = "time_based"
    title: str
    message: str
    payload: Optional[Dict[str, Any]] = None

    @field_validator("payload")
    @classmethod
    def validate_action_url(cls, v: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if v and "action_url" in v and v["action_url"]:
            url = str(v["action_url"])
            if not url.startswith("/") or url.startswith("//"):
                raise ValueError("action_url must be a relative internal path starting with '/'")
        return v

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    category: str
    notification_type: str
    title: str
    message: str
    payload: Dict[str, Any]
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationPreferenceSchema(BaseModel):
    email_enabled: bool
    category_preferences: Dict[str, bool]

    model_config = ConfigDict(from_attributes=True)
