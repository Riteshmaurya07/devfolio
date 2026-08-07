import pytest
from uuid import uuid4
from app.domains.profiles.repository import ProfileRepository
from app.domains.profiles.service import ProfileService
from app.domains.profiles.schemas import ProfileCreate, ProfileUpdate, SocialLinkCreate
from app.domains.profiles.models import VisibilityEnum, SocialPlatformEnum
from app.domains.users.repository import UserRepository
from app.domains.users.schemas import UserCreate
from app.core.exceptions import NotFoundError, ConflictError

@pytest.mark.asyncio
async def test_profile_service_flow(db_session):
    user_repo = UserRepository(db_session)
    profile_repo = ProfileRepository(db_session)
    service = ProfileService(profile_repo)

    # Create user
    user = await user_repo.create(UserCreate(
        username="prof_user",
        email="prof@example.com",
        password="password123"
    ))

    # Get or Create profile
    profile = await service.get_or_create_profile(user.id, user.username, user.email)
    assert profile.username == "prof_user"
    assert profile.visibility == VisibilityEnum.PUBLIC

    # Update profile
    updated = await service.update_profile(
        user.id,
        ProfileUpdate(
            name="John Doe",
            bio="Senior Fullstack Engineer",
            skills=["Python", "FastAPI", "React", "Next.js"],
            visibility=VisibilityEnum.PUBLIC
        )
    )
    assert updated.name == "John Doe"
    assert "FastAPI" in updated.skills

    # Update social links
    social_links = [
        SocialLinkCreate(platform=SocialPlatformEnum.GITHUB, url="https://github.com/johndoe"),
        SocialLinkCreate(platform=SocialPlatformEnum.LINKEDIN, url="https://linkedin.com/in/johndoe")
    ]
    profile_with_links = await service.update_social_links(user.id, social_links)
    assert len(profile_with_links.social_links) == 2

    # Target user for follow test
    user2 = await user_repo.create(UserCreate(
        username="target_user",
        email="target@example.com",
        password="password123"
    ))
    target_profile = await service.get_or_create_profile(user2.id, user2.username, user2.email)

    # Follow / Unfollow logic
    followed = await service.follow_user(user.id, "target_user")
    assert followed is True

    # Duplicate follow
    already_following = await service.follow_user(user.id, "target_user")
    assert already_following is False

    unfollowed = await service.unfollow_user(user.id, "target_user")
    assert unfollowed is True
