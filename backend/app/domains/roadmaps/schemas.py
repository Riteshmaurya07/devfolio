from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class MilestoneSchema(BaseModel):
    id: str
    title: str
    description: str

class RoadmapTemplateResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    category: str
    description: Optional[str] = None
    milestones: List[MilestoneSchema]

    model_config = ConfigDict(from_attributes=True)

class MilestoneToggleRequest(BaseModel):
    milestone_id: str
    is_completed: bool

class BookmarkToggleRequest(BaseModel):
    milestone_id: str

class RoadmapProgressResponse(BaseModel):
    id: UUID
    profile_id: UUID
    roadmap_template_id: UUID
    milestone_states: Dict[str, bool]
    bookmarks: List[str]
    ai_annotation: Optional[Dict[str, Any]] = None
    completion_percentage: float
    target_completion_days: int
    started_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
