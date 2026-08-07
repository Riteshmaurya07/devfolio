from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.feed.schemas import PostCreate, CommentCreate, PostResponse, CommentResponse, TrendingProjectResponse
from app.domains.feed.repository import FeedRepository
from app.domains.feed.service import FeedService
from app.domains.profiles.repository import ProfileRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/feed", tags=["feed"])


def get_feed_service(db=Depends(get_db)) -> FeedService:
    return FeedService(FeedRepository(db))


@router.get("")
async def get_feed(
    cursor_ts: Optional[str] = Query(None),
    cursor_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    service: FeedService = Depends(get_feed_service),
    db=Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    return await service.get_feed(profile.id, cursor_ts, cursor_id, limit)


@router.post("/posts")
async def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    service: FeedService = Depends(get_feed_service),
    db=Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    post = await service.create_post(profile.id, post_in)
    return {"id": str(post.id), "status": "created"}


@router.get("/posts/{post_id}")
async def get_post(
    post_id: UUID,
    service: FeedService = Depends(get_feed_service)
):
    return await service.get_post_detail(post_id)


@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: UUID,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    service: FeedService = Depends(get_feed_service),
    db=Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    comment = await service.add_comment(post_id, profile.id, comment_in)
    return {"id": str(comment.id), "status": "created"}


@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    service: FeedService = Depends(get_feed_service),
    db=Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    liked = await service.toggle_like(post_id, profile.id)
    return {"liked": liked}


@router.post("/posts/{post_id}/bookmark")
async def toggle_bookmark(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    service: FeedService = Depends(get_feed_service),
    db=Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")
    bookmarked = await service.toggle_bookmark(post_id, profile.id)
    return {"bookmarked": bookmarked}


@router.get("/trending")
async def get_trending_projects(
    limit: int = Query(10, ge=1, le=50),
    service: FeedService = Depends(get_feed_service)
):
    trending = await service.repository.get_trending_projects(limit)
    return [
        {
            "project_id": str(t.project_id),
            "score": t.score,
            "likes_count": t.likes_count,
            "views_count": t.views_count,
            "computed_at": t.computed_at
        }
        for t in trending
    ]
