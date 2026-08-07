from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from app.domains.profiles.models import VisibilityEnum, SocialPlatformEnum

class SocialLinkBase(BaseModel):
    platform: SocialPlatformEnum
    url: str

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkResponse(SocialLinkBase):
    id: UUID
    profile_id: UUID

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict, field_validator

RESERVED_USERNAMES = {"edit", "me", "api", "admin", "dashboard", "login", "register", "u", "settings", "profiles", "users", "health", "roadmaps", "resumes"}

class ProfileBase(BaseModel):
    name: str
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9_-]+$")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if v.lower() in RESERVED_USERNAMES:
            raise ValueError(f"Username '{v}' is a reserved system keyword.")
        return v
    bio: Optional[str] = None
    about: Optional[str] = None
    current_position: Optional[str] = None
    company: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    visibility: VisibilityEnum = VisibilityEnum.PUBLIC

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    about: Optional[str] = None
    current_position: Optional[str] = None
    company: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    languages: Optional[List[str]] = None
    visibility: Optional[VisibilityEnum] = None

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    social_links: List[SocialLinkResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FollowUserResponse(BaseModel):
    id: UUID
    username: str
    name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
