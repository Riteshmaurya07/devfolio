from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime
from app.domains.portfolio.theme_engine import RESERVED_SLUGS

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool = False
    order_index: int = 0

class ProjectCreate(ProjectBase):
    github_repo_id: Optional[UUID] = None

class ProjectResponse(ProjectBase):
    id: UUID
    portfolio_id: UUID
    github_repo_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)

class ExperienceBase(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    order_index: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: UUID
    portfolio_id: UUID

    model_config = ConfigDict(from_attributes=True)

class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    grade: Optional[str] = None
    order_index: int = 0

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: UUID
    portfolio_id: UUID

    model_config = ConfigDict(from_attributes=True)

class SkillBase(BaseModel):
    name: str
    category: str = "General"
    proficiency_level: int = Field(80, ge=1, le=100)
    order_index: int = 0

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: UUID
    portfolio_id: UUID

    model_config = ConfigDict(from_attributes=True)

class CertificationBase(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    order_index: int = 0

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: UUID
    portfolio_id: UUID

    model_config = ConfigDict(from_attributes=True)

class AchievementBase(BaseModel):
    title: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    order_index: int = 0

class AchievementCreate(AchievementBase):
    pass

class AchievementResponse(AchievementBase):
    id: UUID
    portfolio_id: UUID

    model_config = ConfigDict(from_attributes=True)

class PortfolioConfigBase(BaseModel):
    slug: str = Field(..., min_length=3, max_length=50, pattern="^[a-z0-9-]+$")
    theme_name: str = "modern"
    primary_color: Optional[str] = None
    font_family: Optional[str] = None
    is_published: bool = True
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    og_image_url: Optional[str] = None
    section_order: List[str] = Field(default_factory=lambda: ["about", "skills", "projects", "experience", "education", "certifications", "achievements"])

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if v.lower() in RESERVED_SLUGS:
            raise ValueError(f"Slug '{v}' is a reserved system keyword.")
        return v.lower()

class PortfolioConfigUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=3, max_length=50, pattern="^[a-z0-9-]+$")
    theme_name: Optional[str] = None
    primary_color: Optional[str] = None
    font_family: Optional[str] = None
    is_published: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    og_image_url: Optional[str] = None
    section_order: Optional[List[str]] = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v and v.lower() in RESERVED_SLUGS:
            raise ValueError(f"Slug '{v}' is a reserved system keyword.")
        return v.lower() if v else v

class PortfolioConfigResponse(PortfolioConfigBase):
    id: UUID
    profile_id: UUID
    projects: List[ProjectResponse] = []
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    skills: List[SkillResponse] = []
    certifications: List[CertificationResponse] = []
    achievements: List[AchievementResponse] = []
    theme_tokens: Dict[str, str] = {}
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GitHubImportRequest(BaseModel):
    repository_ids: List[UUID]
