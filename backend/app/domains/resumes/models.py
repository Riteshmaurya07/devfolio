import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, UniqueConstraint, Index, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    __table_args__ = (
        UniqueConstraint("profile_id", "version_number", name="uq_profile_version_number"),
        Index("uq_profile_active_resume", "profile_id", unique=True, postgresql_where=text("is_active = true")),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False, default="Master Resume")
    version_number = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True, nullable=False)
    template_name = Column(String(30), default="modern")  # modern, professional, minimal, corporate, creative
    content = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", backref="resume_versions")
