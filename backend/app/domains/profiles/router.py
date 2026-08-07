from typing import List
from app.core.exceptions import ValidationError
from fastapi import APIRouter, Depends, UploadFile, File, status, Request
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.profiles.schemas import ProfileResponse, ProfileUpdate, SocialLinkCreate, FollowUserResponse
from app.domains.profiles.service import ProfileService
from app.domains.profiles.dependencies import get_profile_service, get_visible_profile
from app.domains.profiles.models import Profile
from app.utils.pagination import PageParams, PaginatedResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return await service.get_or_create_profile(current_user.id, current_user.username, current_user.email)

@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return await service.update_profile(current_user.id, profile_in)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

async def validate_image_file(file: UploadFile):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(message="Invalid image format. Allowed formats: JPEG, PNG, WEBP.")
    
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise ValidationError(message="File size exceeds maximum limit of 5MB.")
    
    await file.seek(0)

@router.post("/me/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    await validate_image_file(file)
    return await service.upload_image(current_user.id, file, "avatar")

@router.post("/me/cover", response_model=ProfileResponse)
async def upload_cover(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    await validate_image_file(file)
    return await service.upload_image(current_user.id, file, "cover")

@router.put("/me/social-links", response_model=ProfileResponse)
async def update_social_links(
    links: List[SocialLinkCreate],
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return await service.update_social_links(current_user.id, links)

@router.get("/u/{username}", response_model=ProfileResponse)
async def get_public_profile(
    profile: Profile = Depends(get_visible_profile)
):
    return profile

@router.post("/{username}/follow", status_code=status.HTTP_200_OK)
async def follow_user(
    username: str,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    success = await service.follow_user(current_user.id, username)
    return {"message": "Followed successfully" if success else "Already following"}

@router.post("/{username}/unfollow", status_code=status.HTTP_200_OK)
async def unfollow_user(
    username: str,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    success = await service.unfollow_user(current_user.id, username)
    return {"message": "Unfollowed successfully" if success else "Not following"}

@router.get("/{username}/followers", response_model=PaginatedResponse[FollowUserResponse])
async def list_followers(
    username: str,
    params: PageParams = Depends(),
    service: ProfileService = Depends(get_profile_service)
):
    return await service.list_followers(username, params)

@router.get("/{username}/following", response_model=PaginatedResponse[FollowUserResponse])
async def list_following(
    username: str,
    params: PageParams = Depends(),
    service: ProfileService = Depends(get_profile_service)
):
    return await service.list_following(username, params)
