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
        await self.notif_repo.create(
            user_id=target_user_id,
            type="event_based",
            title="New Friend Connection",
            message="Someone has added you as a friend!"
        )
        
        return req

    async def get_friends(self, user_id: str):
        return await self.friend_repo.get_friends(user_id)
