from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    auth_provider: str
    is_email_verified: bool
    is_onboarded: bool
    preferences: Optional[Dict[str, Any]] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserOnboardingRequest(BaseModel):
    goals: List[str]
    preferences: Optional[Dict[str, Any]] = {}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
