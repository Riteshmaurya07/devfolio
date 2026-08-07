from typing import Optional, List
from uuid import UUID
from app.domains.portfolio.repository import PortfolioRepository
from app.domains.portfolio.models import PortfolioConfig, Project
from app.domains.portfolio.schemas import PortfolioConfigUpdate
from app.domains.portfolio.theme_engine import resolve_theme_tokens
from app.core.exceptions import NotFoundError, ConflictError, ValidationError

class PortfolioService:
    def __init__(self, repository: PortfolioRepository):
        self.repository = repository

    async def get_or_create_portfolio(self, profile_id: UUID, default_username: str) -> PortfolioConfig:
        config = await self.repository.get_by_profile_id(profile_id)
        if not config:
            slug = default_username.lower()
            existing_slug = await self.repository.get_by_slug(slug)
            if existing_slug:
                slug = f"{slug}-portfolio"
            config = await self.repository.create_config(profile_id, slug)

        # Attach dynamic theme tokens
        config.theme_tokens = resolve_theme_tokens(config.theme_name, config.primary_color, config.font_family)
        return config

    async def update_portfolio(self, profile_id: UUID, update_in: PortfolioConfigUpdate) -> PortfolioConfig:
        config = await self.repository.get_by_profile_id(profile_id)
        if not config:
            raise NotFoundError(message="Portfolio not found")

        if update_in.slug and update_in.slug != config.slug:
            existing = await self.repository.get_by_slug(update_in.slug)
            if existing and existing.id != config.id:
                raise ConflictError(message=f"Slug '{update_in.slug}' is already taken.")
            config.slug = update_in.slug

        for field, value in update_in.model_dump(exclude_unset=True).items():
            if field != "slug":
                setattr(config, field, value)

        await self.repository.db.commit()
        return await self.get_or_create_portfolio(profile_id, config.slug)

    async def import_from_github(self, profile_id: UUID, repository_ids: List[UUID]) -> List[Project]:
        config = await self.repository.get_by_profile_id(profile_id)
        if not config:
            raise NotFoundError(message="Portfolio not found")

        gh_repos = await self.repository.get_github_repos_by_ids(repository_ids)
        existing_repo_ids = {p.github_repo_id for p in config.projects if p.github_repo_id}
        
        new_projects = []
        existing_count = len(config.projects)
        for idx, repo in enumerate(gh_repos):
            if repo.id in existing_repo_ids:
                continue  # Idempotent skip if already imported into this portfolio

            proj = Project(
                portfolio_id=config.id,
                github_repo_id=repo.id,
                title=repo.name,
                description=repo.description or f"GitHub repository {repo.full_name}",
                tech_stack=[repo.language] if repo.language else [],
                demo_url=repo.html_url,
                repo_url=repo.html_url,
                order_index=existing_count + idx
            )
            self.repository.db.add(proj)
            new_projects.append(proj)

        await self.repository.db.commit()
        return new_projects

    async def get_public_portfolio(self, slug: str, viewer_ip: Optional[str] = None, user_agent: Optional[str] = None) -> PortfolioConfig:
        config = await self.repository.get_by_slug(slug)
        if not config or not config.is_published:
            raise NotFoundError(message=f"Portfolio '{slug}' not found or is private.")

        # Profile Visibility Interlock Rule: Private profile forces portfolio unpublished/403
        if config.profile and config.profile.visibility and config.profile.visibility.value == "private":
            raise NotFoundError(message=f"Portfolio '{slug}' is hidden because the profile is private.")

        await self.repository.record_view(config.id, viewer_ip, user_agent)
        config.theme_tokens = resolve_theme_tokens(config.theme_name, config.primary_color, config.font_family)
        return config
