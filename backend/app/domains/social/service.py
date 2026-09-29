from fastapi import HTTPException
from app.domains.social.repository import FriendRepository
from app.domains.notifications.repository import NotificationRepository

class FriendService:
    def __init__(self, friend_repo: FriendRepository, notif_repo: NotificationRepository):
        self.friend_repo = friend_repo
        self.notif_repo = notif_repo

    async def add_friend(self, current_user_id: str, target_user_id: str):
        if current_user_id == target_user_id:
            raise HTTPException(status_code=400, detail="Cannot add yourself.")
            
        existing = await self.friend_repo.get_request(current_user_id, target_user_id)
        if existing:
            raise HTTPException(status_code=400, detail="Already connected.")
            
        req = await self.friend_repo.create_request(current_user_id, target_user_id)
        
        # Trigger event-based notification
        from uuid import UUID
        await self.notif_repo.create_notification(
            user_id=UUID(target_user_id),
            category="system",
            notification_type="event_based",
            title="New Friend Connection",
            message="Someone has added you as a friend!"
        )
        
        return req

    async def accept_request(self, current_user_id: str, request_id: str):
        req = await self.friend_repo.get_request_by_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found.")
        if str(req.addressee_id) != current_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to accept this request.")
        if req.status != "pending":
            raise HTTPException(status_code=400, detail="Request is not pending.")
            
        req = await self.friend_repo.update_request_status(request_id, "accepted")
        
        # Notify requester
        from uuid import UUID
        await self.notif_repo.create_notification(
            user_id=UUID(str(req.requester_id)),
            category="system",
            notification_type="event_based",
            title="Friend Request Accepted",
            message="Your friend request was accepted!"
        )
        return req

    async def reject_request(self, current_user_id: str, request_id: str):
        req = await self.friend_repo.get_request_by_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found.")
        if str(req.addressee_id) != current_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to reject this request.")
        if req.status != "pending":
            raise HTTPException(status_code=400, detail="Request is not pending.")
            
        req = await self.friend_repo.update_request_status(request_id, "rejected")
        return req

    async def get_friends(self, user_id: str):
        return await self.friend_repo.get_friends(user_id)
