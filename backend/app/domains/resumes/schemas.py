from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator
from uuid import UUID
from datetime import datetime

class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""

    model_config = ConfigDict(extra="allow")

class ResumeExperienceItem(BaseModel):
    company: str = ""
    position: str = ""
    title: Optional[str] = ""
    location: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = "Present"
    is_current: bool = False
    description: Optional[str] = ""
    highlights: List[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")

    @model_validator(mode="before")
    @classmethod
    def harmonize_experience(cls, data: Any) -> Any:
        if isinstance(data, dict):
            pos = data.get("position") or data.get("title") or ""
            data["position"] = pos
            data["title"] = pos
            desc = data.get("description")
            hl = data.get("highlights")
            if desc and not hl:
                data["highlights"] = [desc]
            elif hl and not desc:
                data["description"] = " ".join(hl)
        return data

class ResumeEducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field_of_study: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    grade: Optional[str] = ""

    model_config = ConfigDict(extra="allow")

class ResumeProjectItem(BaseModel):
    title: str = ""
    description: str = ""
    tech_stack: List[str] = Field(default_factory=list)
    repo_url: Optional[str] = ""
    demo_url: Optional[str] = ""
    link: Optional[str] = ""
    highlights: List[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")

class ResumeContent(BaseModel):
    contact: ContactInfo = Field(default_factory=ContactInfo)
    basics: Optional[Dict[str, Any]] = None
    summary: str = ""
    skills: List[str] = Field(default_factory=list)
    experience: List[ResumeExperienceItem] = Field(default_factory=list)
    education: List[ResumeEducationItem] = Field(default_factory=list)
    projects: List[ResumeProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")

    @model_validator(mode="before")
    @classmethod
    def harmonize_content(cls, data: Any) -> Any:
        if isinstance(data, dict):
            basics = data.get("basics")
            contact = data.get("contact")
            if basics and isinstance(basics, dict):
                if not contact or not isinstance(contact, dict) or not contact.get("name"):
                    data["contact"] = {
                        "name": basics.get("name") or "",
                        "email": basics.get("email") or "",
                        "phone": basics.get("phone") or "",
                        "location": basics.get("location") or "",
                        "website": basics.get("website") or "",
                        "linkedin": basics.get("linkedin") or "",
                        "github": basics.get("github") or "",
                    }
                if not data.get("summary") and basics.get("summary"):
                    data["summary"] = basics["summary"]
            elif contact and isinstance(contact, dict):
                data["basics"] = {
                    "name": contact.get("name") or "",
                    "email": contact.get("email") or "",
                    "phone": contact.get("phone") or "",
                    "summary": data.get("summary") or "",
                }
        return data

class ResumeVersionCreate(BaseModel):
    title: str = "Master Resume"
    template_name: str = "modern"
    content: ResumeContent = Field(default_factory=ResumeContent)

class ResumeVersionUpdate(BaseModel):
    title: Optional[str] = None
    template_name: Optional[str] = None
    content: Optional[ResumeContent] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None
    content: Optional[Union[ResumeContent, Dict[str, Any]]] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "resume_data" not in data and "content" in data:
                data["resume_data"] = data["content"]
            elif "content" not in data and "resume_data" in data:
                data["content"] = data["resume_data"]
        return data

class ResumeVersionResponse(BaseModel):
    id: UUID
    profile_id: UUID
    title: str
    version_number: int
    is_active: bool
    template_name: str
    content: ResumeContent
    resume_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")

    @model_validator(mode="after")
    def populate_resume_data(self) -> 'ResumeVersionResponse':
        if not self.resume_data and self.content:
            self.resume_data = self.content.model_dump()
        return self

class ATSReviewRequest(BaseModel):
    target_role: Optional[str] = None

class ATSReviewResponse(BaseModel):
    score: int
    grammar_patterns: List[str]
    keyword_suggestions: List[str]
    missing_skills: List[str]
    action_verb_feedback: List[str]
    summary: str
