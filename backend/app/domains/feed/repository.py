from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text, func, delete
from app.domains.feed.models import Post, Comment, PostLike, Bookmark, TrendingProject


class FeedRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_post(self, profile_id: UUID, post_type: str, content: str, shared_project_id: Optional[UUID] = None) -> Post:
        post = Post(
            profile_id=profile_id,
            post_type=post_type,
            content=content,
            shared_project_id=shared_project_id
        )
        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def get_post_by_id(self, post_id: UUID) -> Optional[Post]:
        res = await self.db.execute(select(Post).where(Post.id == post_id))
        return res.scalars().first()

    async def get_feed_for_profile(
        self, profile_id: UUID, cursor_ts: Optional[datetime], cursor_id: Optional[UUID], limit: int = 20
    ) -> List[Post]:
        """
        Composite cursor (created_at, id) paginated feed.
        Includes own posts + posts from followed profiles.
        """
        if cursor_ts and cursor_id:
            query = text("""
                SELECT p.* FROM posts p
                LEFT JOIN follows f ON f.following_id = p.profile_id AND f.follower_id = :profile_id
                WHERE (f.follower_id IS NOT NULL OR p.profile_id = :profile_id)
                  AND (p.created_at, p.id) < (:cursor_ts, :cursor_id)
                ORDER BY p.created_at DESC, p.id DESC
                LIMIT :lim
            """)
            res = await self.db.execute(query, {
                "profile_id": str(profile_id),
                "cursor_ts": cursor_ts,
                "cursor_id": str(cursor_id),
                "lim": limit
            })
        else:
            query = text("""
                SELECT p.* FROM posts p
                LEFT JOIN follows f ON f.following_id = p.profile_id AND f.follower_id = :profile_id
                WHERE (f.follower_id IS NOT NULL OR p.profile_id = :profile_id)
                ORDER BY p.created_at DESC, p.id DESC
                LIMIT :lim
            """)
            res = await self.db.execute(query, {"profile_id": str(profile_id), "lim": limit})

        rows = res.fetchall()
        # Map raw rows back to Post objects
        posts = []
        for row in rows:
            post = Post(
                id=row.id,
                profile_id=row.profile_id,
                post_type=row.post_type,
                content=row.content,
                shared_project_id=row.shared_project_id,
                created_at=row.created_at,
                updated_at=row.updated_at
            )
            posts.append(post)
        return posts

    async def add_comment(self, post_id: UUID, profile_id: UUID, content: str) -> Comment:
        comment = Comment(post_id=post_id, profile_id=profile_id, content=content)
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def toggle_like(self, post_id: UUID, profile_id: UUID) -> bool:
        """Idempotent toggle: insert if not exists, delete if exists. Returns True if liked."""
        res = await self.db.execute(
            select(PostLike).where(PostLike.post_id == post_id, PostLike.profile_id == profile_id)
        )
        existing = res.scalars().first()
        if existing:
            await self.db.execute(
                delete(PostLike).where(PostLike.post_id == post_id, PostLike.profile_id == profile_id)
            )
            await self.db.commit()
            return False
        else:
            self.db.add(PostLike(post_id=post_id, profile_id=profile_id))
            await self.db.commit()
            return True

    async def toggle_bookmark(self, post_id: UUID, profile_id: UUID) -> bool:
        """Idempotent toggle: insert if not exists, delete if exists. Returns True if bookmarked."""
        res = await self.db.execute(
            select(Bookmark).where(Bookmark.post_id == post_id, Bookmark.profile_id == profile_id)
        )
        existing = res.scalars().first()
        if existing:
            await self.db.execute(
                delete(Bookmark).where(Bookmark.post_id == post_id, Bookmark.profile_id == profile_id)
            )
            await self.db.commit()
            return False
        else:
            self.db.add(Bookmark(post_id=post_id, profile_id=profile_id))
            await self.db.commit()
            return True

    async def get_like_count(self, post_id: UUID) -> int:
        res = await self.db.execute(select(func.count()).select_from(PostLike).where(PostLike.post_id == post_id))
        return res.scalar() or 0

    async def get_comment_count(self, post_id: UUID) -> int:
        res = await self.db.execute(select(func.count()).select_from(Comment).where(Comment.post_id == post_id))
        return res.scalar() or 0

    async def is_liked(self, post_id: UUID, profile_id: UUID) -> bool:
        res = await self.db.execute(
            select(PostLike).where(PostLike.post_id == post_id, PostLike.profile_id == profile_id)
        )
        return res.scalars().first() is not None

    async def is_bookmarked(self, post_id: UUID, profile_id: UUID) -> bool:
        res = await self.db.execute(
            select(Bookmark).where(Bookmark.post_id == post_id, Bookmark.profile_id == profile_id)
        )
        return res.scalars().first() is not None

    async def get_comments_for_post(self, post_id: UUID) -> List[Comment]:
        res = await self.db.execute(
            select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at)
        )
        return res.scalars().all()

    async def get_trending_projects(self, limit: int = 10) -> List[TrendingProject]:
        res = await self.db.execute(
            select(TrendingProject).order_by(TrendingProject.score.desc()).limit(limit)
        )
        return res.scalars().all()

    async def count_user_posts_since(self, profile_id: UUID, since: datetime) -> int:
        res = await self.db.execute(
            select(func.count()).select_from(Post).where(Post.profile_id == profile_id, Post.created_at >= since)
        )
        return res.scalar() or 0

    async def count_user_comments_since(self, profile_id: UUID, since: datetime) -> int:
        res = await self.db.execute(
            select(func.count()).select_from(Comment).where(Comment.profile_id == profile_id, Comment.created_at >= since)
        )
        return res.scalar() or 0
