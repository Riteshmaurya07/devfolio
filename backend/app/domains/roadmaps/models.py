import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    weeks = relationship("RoadmapWeek", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapWeek(Base):
    __tablename__ = "roadmap_weeks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)

    roadmap = relationship("Roadmap", back_populates="weeks")
    tasks = relationship("RoadmapTask", back_populates="week", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    week_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_weeks.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)

    week = relationship("RoadmapWeek", back_populates="tasks")
