import os
import uuid
from typing import Optional, List
from uuid import UUID
from fastapi import UploadFile
from app.domains.profiles.repository import ProfileRepository
from app.domains.profiles.schemas import ProfileCreate, ProfileUpdate, SocialLinkCreate, ProfileResponse, FollowUserResponse
from app.domains.profiles.models import Profile, VisibilityEnum
from app.core.exceptions import NotFoundError, ConflictError, UnauthorizedError
from app.utils.pagination import PageParams, PaginatedResponse
from app.domains.profiles.tasks import generate_profile_thumbnail

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProfileService:
    def __init__(self, repository: ProfileRepository):
        self.repository = repository

    async def get_or_create_profile(self, user_id: UUID, username: str, email: str) -> Profile:
        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            profile_in = ProfileCreate(
                name=username,
                username=username,
                email=email
            )
            profile = await self.repository.create(user_id, profile_in)
        return profile

    async def get_by_username(self, username: str) -> Profile:
        profile = await self.repository.get_by_username(username)
        if not profile:
            raise NotFoundError(message=f"Profile @{username} not found")
        return profile

    async def update_profile(self, user_id: UUID, profile_in: ProfileUpdate) -> Profile:
        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            raise NotFoundError(message="Profile not found for user")
        return await self.repository.update(profile, profile_in)

    async def upload_image(self, user_id: UUID, file: UploadFile, image_type: str) -> Profile:
        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            raise NotFoundError(message="Profile not found")

        ext = os.path.splitext(file.filename or "")[1] or ".png"
        filename = f"{image_type}_{profile.id}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        public_url = f"/static/uploads/{filename}"

        if image_type == "avatar":
            # Dispatch Celery task for thumbnail
            thumb_filename = f"thumb_{filename}"
            generate_profile_thumbnail.delay(filepath, 150)
            thumb_url = f"/static/uploads/{thumb_filename}"
            return await self.repository.update_image_urls(profile, avatar_url=public_url, thumbnail_url=thumb_url)
        else:
            return await self.repository.update_image_urls(profile, cover_url=public_url)

    async def update_social_links(self, user_id: UUID, links: List[SocialLinkCreate]) -> Profile:
        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            raise NotFoundError(message="Profile not found")

        new_links = await self.repository.replace_social_links(profile.id, links)
        profile.social_links = new_links
        return profile

    async def follow_user(self, follower_user_id: UUID, target_username: str) -> bool:
        follower_profile = await self.repository.get_by_user_id(follower_user_id)
        target_profile = await self.get_by_username(target_username)

        if follower_profile.id == target_profile.id:
            raise ConflictError(message="You cannot follow yourself")

        return await self.repository.follow(follower_profile.id, target_profile.id)

    async def unfollow_user(self, follower_user_id: UUID, target_username: str) -> bool:
        follower_profile = await self.repository.get_by_user_id(follower_user_id)
        target_profile = await self.get_by_username(target_username)

        return await self.repository.unfollow(follower_profile.id, target_profile.id)

    async def list_followers(self, username: str, params: PageParams) -> PaginatedResponse[FollowUserResponse]:
        profile = await self.get_by_username(username)
        items, total = await self.repository.list_followers(profile.id, params)
        responses = [FollowUserResponse.model_validate(p) for p in items]
        return PaginatedResponse.create(items=responses, total=total, params=params)

    async def list_following(self, username: str, params: PageParams) -> PaginatedResponse[FollowUserResponse]:
        profile = await self.get_by_username(username)
        items, total = await self.repository.list_following(profile.id, params)
        responses = [FollowUserResponse.model_validate(p) for p in items]
        return PaginatedResponse.create(items=responses, total=total, params=params)

    async def record_profile_view(self, profile_id: UUID, viewer_id: Optional[UUID], viewer_ip: Optional[str], user_agent: Optional[str]):
        await self.repository.record_view(profile_id, viewer_id, viewer_ip, user_agent)
