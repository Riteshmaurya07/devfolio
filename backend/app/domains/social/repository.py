from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from app.domains.social.models import FriendRequest

class FriendRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_request(self, requester_id: str, addressee_id: str) -> Optional[FriendRequest]:
        result = await self.db.execute(
            select(FriendRequest).where(
                and_(
                    FriendRequest.requester_id == requester_id,
                    FriendRequest.addressee_id == addressee_id
                )
            )
        )
        return result.scalars().first()

    async def create_request(self, requester_id: str, addressee_id: str) -> FriendRequest:
        req = FriendRequest(requester_id=requester_id, addressee_id=addressee_id, status="accepted") 
        # According to requirements: "if only one send it then this is it both are connected now"
        # So we create it directly as 'accepted' for mutual connection
        self.db.add(req)
        await self.db.commit()
        await self.db.refresh(req)
        return req

    async def get_friends(self, user_id: str) -> List[FriendRequest]:
        result = await self.db.execute(
            select(FriendRequest).where(
                and_(
                    or_(
                        FriendRequest.requester_id == user_id,
                        FriendRequest.addressee_id == user_id
                    ),
                    FriendRequest.status == "accepted"
                )
            )
        )
        return result.scalars().all()
