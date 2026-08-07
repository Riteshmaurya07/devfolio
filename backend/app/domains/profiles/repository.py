from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete
from app.domains.profiles.models import Profile, SocialLink, Follow, ProfileView
from app.domains.profiles.schemas import ProfileCreate, ProfileUpdate, SocialLinkCreate
from app.utils.pagination import PageParams
from app.utils.query_builder import QueryBuilder

from sqlalchemy.orm import selectinload

class ProfileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, profile_id: UUID) -> Optional[Profile]:
        result = await self.db.execute(
            select(Profile).options(selectinload(Profile.social_links)).where(Profile.id == profile_id)
        )
        return result.scalars().first()

    async def get_by_user_id(self, user_id: UUID) -> Optional[Profile]:
        result = await self.db.execute(
            select(Profile).options(selectinload(Profile.social_links)).where(Profile.user_id == user_id)
        )
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[Profile]:
        result = await self.db.execute(
            select(Profile).options(selectinload(Profile.social_links)).where(Profile.username == username)
        )
        return result.scalars().first()

    async def create(self, user_id: UUID, profile_in: ProfileCreate) -> Profile:
        db_profile = Profile(
            user_id=user_id,
            **profile_in.model_dump()
        )
        self.db.add(db_profile)
        await self.db.commit()
        await self.db.refresh(db_profile)
        return db_profile

    async def update(self, profile: Profile, profile_in: ProfileUpdate) -> Profile:
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def update_image_urls(
        self,
        profile: Profile,
        avatar_url: Optional[str] = None,
        cover_url: Optional[str] = None,
        thumbnail_url: Optional[str] = None
    ) -> Profile:
        if avatar_url:
            profile.avatar_url = avatar_url
        if cover_url:
            profile.cover_url = cover_url
        if thumbnail_url:
            profile.thumbnail_url = thumbnail_url
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def replace_social_links(self, profile_id: UUID, links: List[SocialLinkCreate]) -> List[SocialLink]:
        await self.db.execute(delete(SocialLink).where(SocialLink.profile_id == profile_id))
        new_links = [
            SocialLink(profile_id=profile_id, platform=link.platform, url=link.url)
            for link in links
        ]
        self.db.add_all(new_links)
        await self.db.commit()
        return new_links

    async def is_following(self, follower_id: UUID, following_id: UUID) -> bool:
        result = await self.db.execute(
            select(Follow).where(Follow.follower_id == follower_id, Follow.following_id == following_id)
        )
        return result.scalars().first() is not None

    async def follow(self, follower_id: UUID, following_id: UUID) -> bool:
        if await self.is_following(follower_id, following_id):
            return False
        
        follow_record = Follow(follower_id=follower_id, following_id=following_id)
        self.db.add(follow_record)

        # Increment counts
        follower_profile = await self.get_by_id(follower_id)
        following_profile = await self.get_by_id(following_id)
        if follower_profile:
            follower_profile.following_count += 1
        if following_profile:
            following_profile.followers_count += 1

        await self.db.commit()
        return True

    async def unfollow(self, follower_id: UUID, following_id: UUID) -> bool:
        if not await self.is_following(follower_id, following_id):
            return False

        await self.db.execute(
            delete(Follow).where(Follow.follower_id == follower_id, Follow.following_id == following_id)
        )

        follower_profile = await self.get_by_id(follower_id)
        following_profile = await self.get_by_id(following_id)
        if follower_profile and follower_profile.following_count > 0:
            follower_profile.following_count -= 1
        if following_profile and following_profile.followers_count > 0:
            following_profile.followers_count -= 1

        await self.db.commit()
        return True

    async def list_followers(self, profile_id: UUID, params: PageParams) -> Tuple[List[Profile], int]:
        count_stmt = select(func.count()).select_from(Follow).where(Follow.following_id == profile_id)
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar() or 0

        stmt = select(Profile).join(Follow, Follow.follower_id == Profile.id).where(Follow.following_id == profile_id)
        stmt = stmt.offset(params.offset).limit(params.limit)
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def list_following(self, profile_id: UUID, params: PageParams) -> Tuple[List[Profile], int]:
        count_stmt = select(func.count()).select_from(Follow).where(Follow.follower_id == profile_id)
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar() or 0

        stmt = select(Profile).join(Follow, Follow.following_id == Profile.id).where(Follow.follower_id == profile_id)
        stmt = stmt.offset(params.offset).limit(params.limit)
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def record_view(self, profile_id: UUID, viewer_id: Optional[UUID], viewer_ip: Optional[str], user_agent: Optional[str]):
        from app.domains.analytics.repository import AnalyticsRepository
        analytics_repo = AnalyticsRepository(self.db)
        await analytics_repo.log_event(
            profile_id=profile_id,
            event_type="profile_view",
            referrer=user_agent,
            ip_address=viewer_ip or "127.0.0.1"
        )
