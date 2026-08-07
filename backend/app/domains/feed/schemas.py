from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime


class PostCreate(BaseModel):
    post_type: str = "text"  # text, project_share
    content: str = Field(..., max_length=5000)
    shared_project_id: Optional[UUID] = None


class CommentCreate(BaseModel):
    content: str = Field(..., max_length=2000)


class AuthorResponse(BaseModel):
    id: UUID
    name: str
    username: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    profile_id: UUID
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PostResponse(BaseModel):
    id: UUID
    profile_id: UUID
    post_type: str
    content: str
    shared_project_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    comments_count: int = 0
    likes_count: int = 0
    is_liked: bool = False
    is_bookmarked: bool = False

    model_config = ConfigDict(from_attributes=True)


class FeedResponse(BaseModel):
    posts: List[PostResponse]
    next_cursor_ts: Optional[str] = None
    next_cursor_id: Optional[str] = None


class TrendingProjectResponse(BaseModel):
    project_id: UUID
    score: float
    likes_count: int
    views_count: int
    computed_at: datetime

    model_config = ConfigDict(from_attributes=True)
