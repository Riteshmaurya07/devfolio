import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class PortfolioConfig(Base):
    __tablename__ = "portfolio_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    theme_name = Column(String(30), default="modern")  # minimal, modern, glass, dark, gradient, neon
    primary_color = Column(String(20), nullable=True)
    font_family = Column(String(50), nullable=True)
    is_published = Column(Boolean, default=True)
    seo_title = Column(String(150), nullable=True)
    seo_description = Column(Text, nullable=True)
    og_image_url = Column(String, nullable=True)
    section_order = Column(JSONB, default=lambda: ["about", "skills", "projects", "experience", "education", "certifications", "achievements"])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", backref="portfolio_config")
    projects = relationship("Project", back_populates="portfolio", cascade="all, delete-orphan", order_by="Project.order_index")
    experiences = relationship("Experience", back_populates="portfolio", cascade="all, delete-orphan", order_by="Experience.order_index")
    educations = relationship("Education", back_populates="portfolio", cascade="all, delete-orphan", order_by="Education.order_index")
    skills = relationship("Skill", back_populates="portfolio", cascade="all, delete-orphan", order_by="Skill.order_index")
    certifications = relationship("Certification", back_populates="portfolio", cascade="all, delete-orphan", order_by="Certification.order_index")
    achievements = relationship("Achievement", back_populates="portfolio", cascade="all, delete-orphan", order_by="Achievement.order_index")

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, UniqueConstraint

class Project(Base):
    __tablename__ = "portfolio_projects"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "github_repo_id", name="uq_portfolio_github_repo"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    github_repo_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(JSONB, default=list)
    demo_url = Column(String, nullable=True)
    repo_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

    portfolio = relationship("PortfolioConfig", back_populates="projects")

class Experience(Base):
    __tablename__ = "portfolio_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(150), nullable=False)
    position = Column(String(150), nullable=False)
    location = Column(String(100), nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    portfolio = relationship("PortfolioConfig", back_populates="experiences")

class Education(Base):
    __tablename__ = "portfolio_educations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    institution = Column(String(150), nullable=False)
    degree = Column(String(150), nullable=False)
    field_of_study = Column(String(150), nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=True)
    grade = Column(String(50), nullable=True)
    order_index = Column(Integer, default=0)

    portfolio = relationship("PortfolioConfig", back_populates="educations")

class Skill(Base):
    __tablename__ = "portfolio_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="General")
    proficiency_level = Column(Integer, default=80)  # 1 to 100
    order_index = Column(Integer, default=0)

    portfolio = relationship("PortfolioConfig", back_populates="skills")

class Certification(Base):
    __tablename__ = "portfolio_certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    issuer = Column(String(150), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String, nullable=True)
    order_index = Column(Integer, default=0)

    portfolio = relationship("PortfolioConfig", back_populates="certifications")

class Achievement(Base):
    __tablename__ = "portfolio_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    issuer = Column(String(150), nullable=True)
    date = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    portfolio = relationship("PortfolioConfig", back_populates="achievements")

class PortfolioView(Base):
    __tablename__ = "portfolio_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_configs.id", ondelete="CASCADE"), nullable=False)
    viewer_ip = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    viewed_at = Column(DateTime, default=datetime.utcnow)
