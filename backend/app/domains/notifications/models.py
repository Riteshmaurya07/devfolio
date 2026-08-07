import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False, default="system")  # interview, roadmap, github, ai_advice, system
    notification_type = Column(String, nullable=False, default="time_based")  # 'event_based' or 'time_based'
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    payload = Column(JSONB, nullable=False, default=dict)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    email_enabled = Column(Boolean, default=True, nullable=False)
    category_preferences = Column(
        JSONB,
        nullable=False,
        default=lambda: {
            "interview": True,
            "roadmap": True,
            "github": True,
            "ai_advice": True,
            "system": True
        }
    )
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
