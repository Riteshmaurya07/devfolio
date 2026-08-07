from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime, date

class EventIngestRequest(BaseModel):
    profile_id: UUID
    event_type: str  # profile_view, portfolio_view, resume_download, github_click, project_view
    referrer: Optional[str] = None
    ip_address: Optional[str] = "127.0.0.1"

class AnalyticsEventResponse(BaseModel):
    id: UUID
    profile_id: UUID
    event_type: str
    referrer: Optional[str] = None
    country_code: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class DailySummaryResponse(BaseModel):
    id: UUID
    profile_id: UUID
    summary_date: date
    total_views: int
    resume_downloads: int
    github_clicks: int
    country_distribution: Dict[str, int]
    hourly_heatmap: Dict[str, int]

    model_config = ConfigDict(from_attributes=True)
