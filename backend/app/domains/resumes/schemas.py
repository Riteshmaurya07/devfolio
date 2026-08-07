from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Dict, Any, List, Optional

class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""

class ResumeExperienceItem(BaseModel):
    company: str
    position: str
    location: Optional[str] = ""
    start_date: str
    end_date: Optional[str] = "Present"
    is_current: bool = False
    highlights: List[str] = Field(default_factory=list)

class ResumeEducationItem(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = ""
    start_date: str
    end_date: Optional[str] = ""
    grade: Optional[str] = ""

class ResumeProjectItem(BaseModel):
    title: str
    description: str = ""
    tech_stack: List[str] = Field(default_factory=list)
    repo_url: Optional[str] = ""
    demo_url: Optional[str] = ""

class ResumeContent(BaseModel):
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    skills: List[str] = Field(default_factory=list)
    experience: List[ResumeExperienceItem] = Field(default_factory=list)
    education: List[ResumeEducationItem] = Field(default_factory=list)
    projects: List[ResumeProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)

class ResumeVersionCreate(BaseModel):
    title: str = "Master Resume"
    template_name: str = "modern"
    content: ResumeContent = Field(default_factory=ResumeContent)

class ResumeVersionUpdate(BaseModel):
    title: Optional[str] = None
    template_name: Optional[str] = None
    content: Optional[ResumeContent] = None

class ResumeUpdate(BaseModel):
    title: str
    resume_data: Dict[str, Any]

class ResumeVersionResponse(BaseModel):
    id: UUID
    profile_id: UUID
    title: str
    version_number: int
    is_active: bool
    template_name: str
    content: ResumeContent
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ATSReviewRequest(BaseModel):
    target_role: Optional[str] = None

class ATSReviewResponse(BaseModel):
    score: int
    grammar_patterns: List[str]
    keyword_suggestions: List[str]
    missing_skills: List[str]
    action_verb_feedback: List[str]
    summary: str
