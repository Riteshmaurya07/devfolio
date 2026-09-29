from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.domains.social.service import FriendService
from app.api.dependencies import get_friend_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/friends", tags=["friends"])

class AddFriendRequest(BaseModel):
    target_user_id: str

@router.post("/add")
async def add_friend(
    req: AddFriendRequest,
    current_user: User = Depends(get_current_user),
    service: FriendService = Depends(get_friend_service)
):
    await service.add_friend(str(current_user.id), req.target_user_id)
    return {"status": "success", "message": "Friend request sent."}

@router.post("/{request_id}/accept")
async def accept_friend_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    service: FriendService = Depends(get_friend_service)
):
    await service.accept_request(str(current_user.id), request_id)
    return {"status": "success", "message": "Friend request accepted."}

@router.post("/{request_id}/reject")
async def reject_friend_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    service: FriendService = Depends(get_friend_service)
):
    await service.reject_request(str(current_user.id), request_id)
    return {"status": "success", "message": "Friend request rejected."}

@router.get("/")
async def get_friends(
    current_user: User = Depends(get_current_user),
    service: FriendService = Depends(get_friend_service)
):
    friends = await service.get_friends(str(current_user.id))
    return {"friends": friends}
