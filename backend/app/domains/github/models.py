import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class GitHubAccount(Base):
    __tablename__ = "github_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    encrypted_token = Column(Text, nullable=False)
    github_username = Column(String, nullable=False, index=True)
    total_stars = Column(Integer, default=0)
    total_followers = Column(Integer, default=0)
    total_following = Column(Integer, default=0)
    contribution_calendar = Column(JSONB, default=dict)  # {"2026-08-01": 5}
    languages_summary = Column(JSONB, default=dict)       # {"Python": 50000, "TypeScript": 30000}
    connected_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", backref="github_account", uselist=False)
    repositories = relationship("RepositoryModel", back_populates="github_account", cascade="all, delete-orphan")

class RepositoryModel(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_account_id = Column(UUID(as_uuid=True), ForeignKey("github_accounts.id", ondelete="CASCADE"), nullable=False)
    repo_id = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    html_url = Column(String, nullable=False)
    stars_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    language = Column(String, nullable=True)
    is_pinned = Column(Boolean, default=False)
    has_readme = Column(Boolean, default=False)
    has_tests = Column(Boolean, default=False)
    health_score = Column(Integer, default=0)
    last_commit_at = Column(DateTime, nullable=True)
    ai_review = Column(JSONB, nullable=True)  # Cache for LLM review
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    github_account = relationship("GitHubAccount", back_populates="repositories")
