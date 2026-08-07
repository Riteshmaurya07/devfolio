import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(150), nullable=False)
    role = Column(String(150), nullable=False)
    package = Column(String(100), nullable=True)
    recruiter_contact = Column(JSONB, nullable=False, default=dict)
    status = Column(String(30), nullable=False, default="wishlist")  # wishlist, applied, interview, offer, rejected, accepted
    notes = Column(Text, nullable=True)
    attachments = Column(JSONB, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", backref="job_applications")
    history = relationship("JobStatusHistory", back_populates="job_application", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="job_application", cascade="all, delete-orphan")

class JobStatusHistory(Base):
    __tablename__ = "job_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_application_id = Column(UUID(as_uuid=True), ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=False)
    previous_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    reason = Column(String, nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow)

    job_application = relationship("JobApplication", back_populates="history")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_application_id = Column(UUID(as_uuid=True), ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)  # UTC datetime
    round_type = Column(String(50), nullable=False, default="technical")  # technical, behavioral, system_design, hr
    notes = Column(Text, nullable=True)
    is_reminder_sent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    job_application = relationship("JobApplication", back_populates="interviews")
