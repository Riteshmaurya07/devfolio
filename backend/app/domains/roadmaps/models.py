import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class RoadmapTemplate(Base):
    __tablename__ = "roadmap_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False, default="General")
    description = Column(String, nullable=True)
    milestones = Column(JSONB, nullable=False, default=list)  # [{"id": "m1", "title": "..."}]
    created_at = Column(DateTime, default=datetime.utcnow)

class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"
    __table_args__ = (
        UniqueConstraint("profile_id", "roadmap_template_id", name="uq_profile_roadmap_template"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    roadmap_template_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_templates.id", ondelete="CASCADE"), nullable=False)
    milestone_states = Column(JSONB, nullable=False, default=dict)  # {"m1": true, "m2": false}
    bookmarks = Column(JSONB, nullable=False, default=list)        # ["m1", "m3"]
    ai_annotation = Column(JSONB, nullable=True)                  # Cached AI Personalization
    target_completion_days = Column(Integer, default=30)
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", backref="roadmap_progresses")
    template = relationship("RoadmapTemplate", backref="progresses")
