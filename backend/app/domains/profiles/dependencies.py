from typing import Optional
from fastapi import Depends, Request
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.profiles.service import ProfileService
from app.domains.profiles.repository import ProfileRepository
from app.domains.profiles.models import Profile, VisibilityEnum
from app.core.database import get_db
from app.core.exceptions import UnauthorizedError, NotFoundError

def get_profile_repo(db = Depends(get_db)) -> ProfileRepository:
    return ProfileRepository(db)

def get_profile_service(repo: ProfileRepository = Depends(get_profile_repo)) -> ProfileService:
    return ProfileService(repo)

async def get_visible_profile(
    username: str,
    request: Request,
    service: ProfileService = Depends(get_profile_service),
    db = Depends(get_db)
) -> Profile:
    profile = await service.get_by_username(username)
    
    # Check optional current user from Authorization header
    current_user: Optional[User] = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            current_user = await get_current_user(token=auth_header.split(" ")[1], user_repo=Depends(get_profile_repo))
        except Exception:
            current_user = None

    if profile.visibility == VisibilityEnum.PRIVATE:
        if not current_user or current_user.id != profile.user_id:
            raise UnauthorizedError(message="This profile is private", details={"code": "FORBIDDEN"})

    # Record view async path
    viewer_id = current_user.id if current_user else None
    viewer_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await service.record_profile_view(profile.id, viewer_id, viewer_ip, user_agent)

    return profile
