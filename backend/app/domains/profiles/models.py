import uuid
from datetime import datetime
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, Integer, Table
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class VisibilityEnum(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"

class SocialPlatformEnum(str, enum.Enum):
    GITHUB = "github"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    LEETCODE = "leetcode"
    CODECHEF = "codechef"
    CODEFORCES = "codeforces"
    GEEKSFORGEEKS = "geeksforgeeks"
    PORTFOLIO = "portfolio"

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, Integer, Table, CheckConstraint

class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (
        CheckConstraint("follower_id != following_id", name="check_self_follow"),
    )

    follower_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    following_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    bio = Column(String, nullable=True)
    about = Column(Text, nullable=True)
    current_position = Column(String, nullable=True)
    company = Column(String, nullable=True)
    college = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    skills = Column(JSONB, default=list)  # List[str]
    experience = Column(JSONB, default=list)  # List[Dict]
    avatar_url = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    location = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    languages = Column(JSONB, default=list)  # List[str]
    visibility = Column(SQLEnum(VisibilityEnum), default=VisibilityEnum.PUBLIC, nullable=False)
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="profile", uselist=False)
    social_links = relationship("SocialLink", back_populates="profile", cascade="all, delete-orphan")

class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    platform = Column(SQLEnum(SocialPlatformEnum), nullable=False)
    url = Column(String, nullable=False)

    profile = relationship("Profile", back_populates="social_links")

class ProfileView(Base):
    __tablename__ = "profile_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    viewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    viewer_ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
