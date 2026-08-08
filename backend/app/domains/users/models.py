import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    auth_provider = Column(String, default="local")  # 'local', 'github', etc.
    avatar_url = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    is_onboarded = Column(Boolean, default=False, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_suspended = Column(Boolean, default=False, nullable=False)
    preferences = Column(JSONB, default=lambda: {"sync_mode": "background"})
    created_at = Column(DateTime, default=datetime.utcnow)
