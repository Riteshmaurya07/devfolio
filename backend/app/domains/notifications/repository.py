from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.domains.notifications.models import Notification

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, type: str, title: str, message: str) -> Notification:
        notif = Notification(
            user_id=user_id,
            notification_type=type,
            title=title,
            message=message
        )
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)
        return notif

    async def get_unread(self, user_id: str):
        result = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read == False
            ).order_by(Notification.created_at.desc())
        )
        return result.scalars().all()

    async def mark_as_read(self, notification_id: str):
        await self.db.execute(
            update(Notification)
            .where(Notification.id == notification_id)
            .values(is_read=True)
        )
        await self.db.commit()
