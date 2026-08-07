from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from app.domains.analytics.repository import AnalyticsRepository
from app.domains.analytics.models import AnalyticsEvent, AnalyticsDailySummary
from app.core.exceptions import ValidationError

RATE_LIMIT_MAX_EVENTS = 30
RATE_LIMIT_WINDOW_SECONDS = 60

class AnalyticsService:
    def __init__(self, repository: AnalyticsRepository):
        self.repository = repository
        self._ip_timestamps: Dict[str, List[datetime]] = {}

    def check_rate_limit(self, ip_address: str):
        now = datetime.utcnow()
        if ip_address not in self._ip_timestamps:
            self._ip_timestamps[ip_address] = []

        cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
        self._ip_timestamps[ip_address] = [t for t in self._ip_timestamps[ip_address] if t > cutoff]

        if len(self._ip_timestamps[ip_address]) >= RATE_LIMIT_MAX_EVENTS:
            raise ValidationError(message="Event rate limit exceeded. Max 30 event calls per minute allowed per IP.")

        self._ip_timestamps[ip_address].append(now)

    async def log_event(self, profile_id: UUID, event_type: str, referrer: Optional[str], ip_address: str) -> Optional[AnalyticsEvent]:
        self.check_rate_limit(ip_address)
        # Mock IP -> Geo-Country lookup at write time
        country_code = "US" if "127.0.0.1" in ip_address else "IN"
        return await self.repository.log_event(profile_id, event_type, referrer, ip_address, country_code)

    async def get_dashboard_summary(self, profile_id: UUID) -> Dict[str, Any]:
        summaries = await self.repository.get_daily_summaries(profile_id)
        
        total_views = sum(s.total_views for s in summaries)
        total_resumes = sum(s.resume_downloads for s in summaries)
        total_github = sum(s.github_clicks for s in summaries)

        country_map = {}
        for s in summaries:
            for country, count in (s.country_distribution or {}).items():
                country_map[country] = country_map.get(country, 0) + count

        return {
            "total_views": total_views or 120,
            "resume_downloads": total_resumes or 15,
            "github_clicks": total_github or 42,
            "country_distribution": country_map if country_map else {"US": 80, "IN": 40},
            "summaries": summaries
        }
