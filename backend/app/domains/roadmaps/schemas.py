from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class TaskResponse(BaseModel):
    id: UUID
    description: str
    is_completed: bool

    class Config:
        from_attributes = True

class WeekResponse(BaseModel):
    id: UUID
    week_number: int
    title: str
    tasks: List[TaskResponse] = []

    class Config:
        from_attributes = True

class RoadmapCreate(BaseModel):
    goal: str

class RoadmapResponse(BaseModel):
    id: UUID
    goal: str
    is_completed: bool
    created_at: datetime
    weeks: List[WeekResponse] = []

    class Config:
        from_attributes = True
