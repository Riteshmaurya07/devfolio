from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class MessageCreate(BaseModel):
    content: str
    role: str = "user"

class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    title: str
    topic: str

class ChatResponse(BaseModel):
    id: UUID
    title: str
    topic: str
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
