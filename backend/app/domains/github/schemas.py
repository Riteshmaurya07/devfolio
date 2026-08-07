from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class RepositorySchema(BaseModel):
    id: UUID
    repo_id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    stars_count: int
    forks_count: int
    language: Optional[str] = None
    is_pinned: bool
    has_readme: bool
    has_tests: bool
    health_score: int
    last_commit_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class GitHubAccountResponse(BaseModel):
    id: UUID
    profile_id: UUID
    github_username: str
    total_stars: int
    total_followers: int
    total_following: int
    contribution_calendar: Dict[str, int]
    languages_summary: Dict[str, int]
    connected_at: datetime
    updated_at: datetime
    repositories: List[RepositorySchema] = []

    model_config = ConfigDict(from_attributes=True)

class AIReviewRequest(BaseModel):
    readme_content: Optional[str] = None

class AIReviewResponse(BaseModel):
    repo_id: str
    strengths: List[str]
    gaps: List[str]
    suggestions: List[str]
    summary: str
