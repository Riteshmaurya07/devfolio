import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class CodingProfile(Base):
    __tablename__ = "coding_profiles"
    __table_args__ = (
        UniqueConstraint("profile_id", "platform", name="uq_profile_platform"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(30), nullable=False)  # codeforces, leetcode, codechef, geeksforgeeks
    external_username = Column(String(100), nullable=False)
    sync_status = Column(String(20), default="ok", nullable=False)  # ok, stale, error
    sync_error_message = Column(String, nullable=True)
    ai_recommendation = Column(JSONB, nullable=True)  # Cached AI practice guidance
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", backref="coding_profiles")

class CodeforcesStats(Base):
    __tablename__ = "codeforces_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coding_profile_id = Column(UUID(as_uuid=True), ForeignKey("coding_profiles.id", ondelete="CASCADE"), nullable=False, unique=True)
    handle = Column(String(100), nullable=False)
    rating = Column(Integer, default=0)
    max_rating = Column(Integer, default=0)
    rank = Column(String(50), default="unrated")
    max_rank = Column(String(50), default="unrated")
    total_solved = Column(Integer, default=0)
    submission_calendar = Column(JSONB, nullable=False, default=dict)
    topic_analysis = Column(JSONB, nullable=False, default=dict)
    contest_history = Column(JSONB, nullable=False, default=list)

class LeetCodeStats(Base):
    __tablename__ = "leetcode_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coding_profile_id = Column(UUID(as_uuid=True), ForeignKey("coding_profiles.id", ondelete="CASCADE"), nullable=False, unique=True)
    username = Column(String(100), nullable=False)
    total_solved = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    acceptance_rate = Column(Float, default=0.0)
    ranking = Column(Integer, default=0)
    submission_calendar = Column(JSONB, nullable=False, default=dict)
    topic_analysis = Column(JSONB, nullable=False, default=dict)

class CodeChefStats(Base):
    __tablename__ = "codechef_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coding_profile_id = Column(UUID(as_uuid=True), ForeignKey("coding_profiles.id", ondelete="CASCADE"), nullable=False, unique=True)
    username = Column(String(100), nullable=False)
    current_rating = Column(Integer, default=0)
    highest_rating = Column(Integer, default=0)
    stars = Column(String(10), default="1★")
    total_solved = Column(Integer, default=0)
