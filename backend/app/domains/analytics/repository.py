from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.domains.analytics.models import AnalyticsEvent, AnalyticsDailySummary, hash_ip_address

class AnalyticsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def is_duplicate_event_in_window(self, profile_id: UUID, event_type: str, ip_hash: str, window_minutes: int = 5) -> bool:
        """5-Minute IP Window Deduplication Guard"""
        cutoff = datetime.utcnow() - timedelta(minutes=window_minutes)
        res = await self.db.execute(
            select(AnalyticsEvent).where(
                AnalyticsEvent.profile_id == profile_id,
                AnalyticsEvent.event_type == event_type,
                AnalyticsEvent.ip_hash == ip_hash,
                AnalyticsEvent.timestamp >= cutoff
            )
        )
        return res.scalars().first() is not None

    async def log_event(self, profile_id: UUID, event_type: str, referrer: Optional[str], ip_address: str, country_code: str = "US") -> Optional[AnalyticsEvent]:
        ip_hash = hash_ip_address(ip_address)
        if await self.is_duplicate_event_in_window(profile_id, event_type, ip_hash):
            return None  # Suppress duplicate view within 5-minute sliding window

        event = AnalyticsEvent(
            profile_id=profile_id,
            event_type=event_type,
            referrer=referrer,
            country_code=country_code,
            ip_hash=ip_hash
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def get_daily_summaries(self, profile_id: UUID) -> List[AnalyticsDailySummary]:
        res = await self.db.execute(
            select(AnalyticsDailySummary)
            .where(AnalyticsDailySummary.profile_id == profile_id)
            .order_by(AnalyticsDailySummary.summary_date.desc())
        )
        return res.scalars().all()
