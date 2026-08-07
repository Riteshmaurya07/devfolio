from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, status, Request
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.analytics.schemas import EventIngestRequest, AnalyticsEventResponse, DailySummaryResponse
from app.domains.analytics.repository import AnalyticsRepository
from app.domains.analytics.service import AnalyticsService
from app.domains.profiles.repository import ProfileRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_analytics_service(db = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(AnalyticsRepository(db))

@router.post("/events")
async def ingest_event(
    request: EventIngestRequest,
    req: Request,
    service: AnalyticsService = Depends(get_analytics_service)
):
    ip_addr = req.client.host if req.client else "127.0.0.1"
    event = await service.log_event(request.profile_id, request.event_type, request.referrer, ip_addr)
    return {"status": "ok", "ingested": event is not None}

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.get_dashboard_summary(profile.id)
