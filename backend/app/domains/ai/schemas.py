from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "Career Advice Session"
    mode: Optional[str] = "career_advice"

class AIMessageSchema(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIConversationResponse(BaseModel):
    id: UUID
    profile_id: UUID
    title: str
    mode: str
    context_snapshot: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatStreamRequest(BaseModel):
    conversation_id: UUID
    message: str
