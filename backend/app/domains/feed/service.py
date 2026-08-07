from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from app.domains.feed.repository import FeedRepository
from app.domains.feed.models import Post, Comment
from app.domains.feed.schemas import PostCreate, CommentCreate
from app.core.exceptions import ValidationError, NotFoundError

# Rate limits
MAX_POSTS_PER_HOUR = 10
MAX_COMMENTS_PER_MINUTE = 30


class FeedService:
    def __init__(self, repository: FeedRepository):
        self.repository = repository

    async def create_post(self, profile_id: UUID, post_in: PostCreate) -> Post:
        # Rate limit: 10 posts/hour
        since = datetime.utcnow() - timedelta(hours=1)
        count = await self.repository.count_user_posts_since(profile_id, since)
        if count >= MAX_POSTS_PER_HOUR:
            raise ValidationError(message="Rate limit exceeded. Maximum 10 posts per hour.")

        # Validate project_share references an existing project
        if post_in.post_type == "project_share" and not post_in.shared_project_id:
            raise ValidationError(message="shared_project_id is required for project_share posts.")

        return await self.repository.create_post(
            profile_id=profile_id,
            post_type=post_in.post_type,
            content=post_in.content,
            shared_project_id=post_in.shared_project_id
        )

    async def get_feed(self, profile_id: UUID, cursor_ts: Optional[str], cursor_id: Optional[str], limit: int = 20) -> Dict[str, Any]:
        parsed_ts = datetime.fromisoformat(cursor_ts) if cursor_ts else None
        parsed_id = UUID(cursor_id) if cursor_id else None

        posts = await self.repository.get_feed_for_profile(profile_id, parsed_ts, parsed_id, limit)

        # Build response with counts and state
        post_responses = []
        for p in posts:
            likes_count = await self.repository.get_like_count(p.id)
            comments_count = await self.repository.get_comment_count(p.id)
            liked = await self.repository.is_liked(p.id, profile_id)
            bookmarked = await self.repository.is_bookmarked(p.id, profile_id)

            post_responses.append({
                "id": p.id,
                "profile_id": p.profile_id,
                "post_type": p.post_type,
                "content": p.content,
                "shared_project_id": p.shared_project_id,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "likes_count": likes_count,
                "comments_count": comments_count,
                "is_liked": liked,
                "is_bookmarked": bookmarked
            })

        next_ts = None
        next_id = None
        if posts:
            last = posts[-1]
            next_ts = last.created_at.isoformat()
            next_id = str(last.id)

        return {"posts": post_responses, "next_cursor_ts": next_ts, "next_cursor_id": next_id}

    async def add_comment(self, post_id: UUID, profile_id: UUID, comment_in: CommentCreate) -> Comment:
        # Rate limit: 30 comments/minute
        since = datetime.utcnow() - timedelta(minutes=1)
        count = await self.repository.count_user_comments_since(profile_id, since)
        if count >= MAX_COMMENTS_PER_MINUTE:
            raise ValidationError(message="Rate limit exceeded. Maximum 30 comments per minute.")

        post = await self.repository.get_post_by_id(post_id)
        if not post:
            raise NotFoundError(message="Post not found")

        return await self.repository.add_comment(post_id, profile_id, comment_in.content)

    async def toggle_like(self, post_id: UUID, profile_id: UUID) -> bool:
        post = await self.repository.get_post_by_id(post_id)
        if not post:
            raise NotFoundError(message="Post not found")
        return await self.repository.toggle_like(post_id, profile_id)

    async def toggle_bookmark(self, post_id: UUID, profile_id: UUID) -> bool:
        post = await self.repository.get_post_by_id(post_id)
        if not post:
            raise NotFoundError(message="Post not found")
        return await self.repository.toggle_bookmark(post_id, profile_id)

    async def get_post_detail(self, post_id: UUID, viewer_profile_id: Optional[UUID] = None) -> Dict[str, Any]:
        post = await self.repository.get_post_by_id(post_id)
        if not post:
            raise NotFoundError(message="Post not found")

        comments = await self.repository.get_comments_for_post(post_id)
        likes_count = await self.repository.get_like_count(post_id)
        is_liked = await self.repository.is_liked(post_id, viewer_profile_id) if viewer_profile_id else False
        is_bookmarked = await self.repository.is_bookmarked(post_id, viewer_profile_id) if viewer_profile_id else False

        return {
            "id": post.id,
            "profile_id": post.profile_id,
            "post_type": post.post_type,
            "content": post.content,
            "shared_project_id": post.shared_project_id,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "likes_count": likes_count,
            "comments_count": len(comments),
            "is_liked": is_liked,
            "is_bookmarked": is_bookmarked,
            "comments": [{"id": c.id, "post_id": c.post_id, "profile_id": c.profile_id, "content": c.content, "created_at": c.created_at} for c in comments]
        }
