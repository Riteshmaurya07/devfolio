import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform_name = Column(String, nullable=False, index=True)
    platform_username = Column(String, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)

    # Relationship back to User can be added if needed, and to History
    history = relationship("PlatformStatsHistory", back_populates="account", cascade="all, delete-orphan")


class PlatformStatsHistory(Base):
    __tablename__ = "platform_stats_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("connected_accounts.id", ondelete="CASCADE"), nullable=False)
    raw_data = Column(JSONB, nullable=False)
    parsed_metrics = Column(JSONB, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    account = relationship("ConnectedAccount", back_populates="history")
