from fastapi import APIRouter, Depends, status, Request
from fastapi.responses import RedirectResponse
from typing import Optional
import logging
from app.domains.users.models import User
from app.domains.users.repository import UserRepository
from app.api.dependencies import get_current_user
from app.domains.github.schemas import GitHubAccountResponse, AIReviewResponse, AIReviewRequest
from app.domains.github.repository import GitHubRepository
from app.domains.github.service import GitHubService
from app.domains.profiles.repository import ProfileRepository
from app.domains.ai.service import AIService
from app.core.database import get_db
from app.core.config import settings
from app.core.exceptions import NotFoundError, DomainException

logger = logging.getLogger("devfolio.github")

router = APIRouter(prefix="/github", tags=["github"])

def get_github_service(db = Depends(get_db)) -> GitHubService:
    return GitHubService(GitHubRepository(db))

def get_ai_service() -> AIService:
    return AIService()

@router.get("/auth/url")
async def get_oauth_url(
    current_user: User = Depends(get_current_user),
    service: GitHubService = Depends(get_github_service)
):
    return {"url": service.get_oauth_url(current_user.id)}

@router.get("/auth/callback")
async def oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    request: Request = None,
    service: GitHubService = Depends(get_github_service),
    db = Depends(get_db)
):
    if error:
        logger.warning(f"GitHub OAuth error returned: {error} - {error_description}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error={error}")

    if not code or not state:
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error=missing_code_or_state")

    # If this request originated from the login flow (state saved in cookie)
    cookie_oauth_state = request.cookies.get("oauth_state") if request else None
    if cookie_oauth_state and cookie_oauth_state == state:
        return RedirectResponse(f"/api/users/github/callback?code={code}&state={state}")

    user_id = service.extract_and_verify_user_id(state)
    if not user_id:
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error=invalid_state")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error=user_not_found")

    try:
        token = await service.exchange_code_for_token(code)
    except Exception as e:
        logger.error(f"GitHub token exchange failed: {e}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error=exchange_failed")

    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(user.id)
    if not profile:
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error=profile_not_found")

    try:
        await service.sync_github(profile.id, token)
    except Exception as e:
        logger.error(f"GitHub initial sync error: {e}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&error=sync_failed")

    return RedirectResponse(f"{settings.FRONTEND_URL}/profile/edit?tab=integrations&github=connected")

@router.post("/sync", response_model=GitHubAccountResponse)
async def manual_sync(
    current_user: User = Depends(get_current_user),
    service: GitHubService = Depends(get_github_service),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")

    account = await service.repository.get_by_profile_id(profile.id)
    if not account or not account.encrypted_token:
        raise DomainException(message="No connected GitHub account found", status_code=400)

    from app.utils.crypto import decrypt_token
    token = decrypt_token(account.encrypted_token)
    return await service.sync_github(profile.id, token, is_manual=True)

@router.get("/stats/{username}", response_model=GitHubAccountResponse)
async def get_github_stats(
    username: str,
    service: GitHubService = Depends(get_github_service)
):
    return await service.get_stats_by_username(username)

@router.post("/repositories/{repo_id}/review", response_model=AIReviewResponse)
async def ai_review_repository(
    repo_id: str,
    request: AIReviewRequest,
    service: GitHubService = Depends(get_github_service),
    ai_service: AIService = Depends(get_ai_service),
    db = Depends(get_db)
):
    from uuid import UUID
    from datetime import datetime
    repo = await service.repository.get_repo_by_id(UUID(repo_id))
    if not repo:
        raise NotFoundError(message=f"Repository {repo_id} not found")

    # Cache Control Check
    if repo.ai_review and repo.last_reviewed_at:
        return AIReviewResponse(repo_id=repo_id, **repo.ai_review)

    review_data = await ai_service.review_repository(
        repo_name=repo.name,
        description=repo.description or "",
        language=repo.language or "General",
        readme_content=request.readme_content
    )

    # Save to Cache
    repo.ai_review = review_data
    repo.last_reviewed_at = datetime.utcnow()
    await db.commit()

    return AIReviewResponse(repo_id=repo_id, **review_data)
