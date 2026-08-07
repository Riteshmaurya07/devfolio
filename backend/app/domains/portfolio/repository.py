from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.domains.portfolio.models import (
    PortfolioConfig, Project, Experience, Education, Skill, Certification, Achievement, PortfolioView
)
from app.domains.github.models import RepositoryModel

class PortfolioRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_profile_id(self, profile_id: UUID) -> Optional[PortfolioConfig]:
        res = await self.db.execute(
            select(PortfolioConfig)
            .options(
                selectinload(PortfolioConfig.projects),
                selectinload(PortfolioConfig.experiences),
                selectinload(PortfolioConfig.educations),
                selectinload(PortfolioConfig.skills),
                selectinload(PortfolioConfig.certifications),
                selectinload(PortfolioConfig.achievements)
            )
            .where(PortfolioConfig.profile_id == profile_id)
        )
        return res.scalars().first()

    async def get_by_slug(self, slug: str) -> Optional[PortfolioConfig]:
        res = await self.db.execute(
            select(PortfolioConfig)
            .options(
                selectinload(PortfolioConfig.profile),
                selectinload(PortfolioConfig.projects),
                selectinload(PortfolioConfig.experiences),
                selectinload(PortfolioConfig.educations),
                selectinload(PortfolioConfig.skills),
                selectinload(PortfolioConfig.certifications),
                selectinload(PortfolioConfig.achievements)
            )
            .where(PortfolioConfig.slug == slug)
        )
        return res.scalars().first()

    async def create_config(self, profile_id: UUID, slug: str) -> PortfolioConfig:
        config = PortfolioConfig(profile_id=profile_id, slug=slug)
        self.db.add(config)
        await self.db.commit()
        return await self.get_by_profile_id(profile_id)

    async def record_view(self, portfolio_id: UUID, viewer_ip: Optional[str] = None, user_agent: Optional[str] = None):
        # Look up profile_id for this portfolio_config
        config_res = await self.db.execute(select(PortfolioConfig).where(PortfolioConfig.id == portfolio_id))
        config = config_res.scalars().first()
        if config:
            from app.domains.analytics.repository import AnalyticsRepository
            analytics_repo = AnalyticsRepository(self.db)
            await analytics_repo.log_event(
                profile_id=config.profile_id,
                event_type="portfolio_view",
                referrer=user_agent,
                ip_address=viewer_ip or "127.0.0.1"
            )

    async def get_github_repos_by_ids(self, repo_ids: List[UUID]) -> List[RepositoryModel]:
        res = await self.db.execute(
            select(RepositoryModel).where(RepositoryModel.id.in_(repo_ids))
        )
        return res.scalars().all()
