from typing import List
from fastapi import APIRouter, Depends, status, Request
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.portfolio.schemas import (
    PortfolioConfigResponse, PortfolioConfigUpdate, GitHubImportRequest, ProjectResponse, ProjectCreate
)
from app.domains.portfolio.repository import PortfolioRepository
from app.domains.portfolio.service import PortfolioService
from app.domains.profiles.repository import ProfileRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

def get_portfolio_service(db = Depends(get_db)) -> PortfolioService:
    return PortfolioService(PortfolioRepository(db))

@router.get("/me", response_model=PortfolioConfigResponse)
async def get_my_portfolio(
    current_user: User = Depends(get_current_user),
    service: PortfolioService = Depends(get_portfolio_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.get_or_create_portfolio(profile.id, current_user.username)

@router.put("/me", response_model=PortfolioConfigResponse)
async def update_my_portfolio(
    update_in: PortfolioConfigUpdate,
    current_user: User = Depends(get_current_user),
    service: PortfolioService = Depends(get_portfolio_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.update_portfolio(profile.id, update_in)

@router.post("/import-github", response_model=List[ProjectResponse])
async def import_github_projects(
    import_in: GitHubImportRequest,
    current_user: User = Depends(get_current_user),
    service: PortfolioService = Depends(get_portfolio_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.import_from_github(profile.id, import_in.repository_ids)

@router.get("/p/{slug}", response_model=PortfolioConfigResponse)
async def get_public_portfolio(
    slug: str,
    request: Request,
    service: PortfolioService = Depends(get_portfolio_service)
):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await service.get_public_portfolio(slug, client_ip, user_agent)
