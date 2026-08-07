from fastapi import APIRouter, Depends, status, Request
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.github.schemas import GitHubAccountResponse, AIReviewResponse, AIReviewRequest
from app.domains.github.repository import GitHubRepository
from app.domains.github.service import GitHubService
from app.domains.profiles.repository import ProfileRepository
from app.domains.ai.service import AIService
from app.core.database import get_db
from app.core.exceptions import NotFoundError, DomainException

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
    code: str,
    state: str,
    current_user: User = Depends(get_current_user),
    service: GitHubService = Depends(get_github_service),
    db = Depends(get_db)
):
    if not service.verify_oauth_state(state, current_user.id):
        raise DomainException(message="Invalid CSRF state parameter in OAuth callback.", status_code=400)

    token = await service.exchange_code_for_token(code)
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")

    account = await service.sync_github(profile.id, token)
    return account

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
