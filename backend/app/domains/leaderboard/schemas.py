from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class LeaderboardEntryResponse(BaseModel):
    id: UUID
    profile_id: UUID
    rank: int
    total_score: float
    coding_score: float
    contribution_score: float
    roadmap_score: float
    portfolio_score: float
    score_breakdown: Dict[str, Any]
    profile_name: Optional[str] = None
    profile_username: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class BadgeResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str
    icon_name: str

    model_config = ConfigDict(from_attributes=True)

class UserBadgeResponse(BaseModel):
    id: UUID
    badge: BadgeResponse
    awarded_at: datetime

    model_config = ConfigDict(from_attributes=True)
