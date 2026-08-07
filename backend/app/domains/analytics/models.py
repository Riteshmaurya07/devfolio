import uuid
import hashlib
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Date, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

def hash_ip_address(ip_address: str) -> str:
    """Anonymize raw IP address to SHA-256 hash for privacy compliant deduplication."""
    return hashlib.sha256(ip_address.encode('utf-8')).hexdigest() if ip_address else ""

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)  # profile_view, portfolio_view, resume_download, github_click, project_view
    referrer = Column(String, nullable=True)
    country_code = Column(String(10), default="US", nullable=False)
    ip_hash = Column(String(64), nullable=False)  # Anonymized SHA-256 hash
    entity_id = Column(UUID(as_uuid=True), nullable=True)  # e.g. project UUID for project_view events
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class AnalyticsDailySummary(Base):
    __tablename__ = "analytics_daily_summaries"
    __table_args__ = (
        UniqueConstraint("profile_id", "summary_date", name="uq_profile_summary_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    summary_date = Column(Date, nullable=False, index=True)
    total_views = Column(Integer, default=0)
    resume_downloads = Column(Integer, default=0)
    github_clicks = Column(Integer, default=0)
    country_distribution = Column(JSONB, nullable=False, default=dict)
    hourly_heatmap = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
