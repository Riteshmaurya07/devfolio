from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text, func, update
from app.domains.notifications.models import Notification, NotificationPreference

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self, user_id: UUID, category: str, notification_type: str, title: str, message: str, payload: Optional[dict] = None
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            category=category,
            notification_type=notification_type,
            title=title,
            message=message,
            payload=payload or {}
        )
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)
        return notif

    async def get_user_notifications(self, user_id: UUID, limit: int = 20) -> List[Notification]:
        res = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return res.scalars().all()

    async def get_unread_count(self, user_id: UUID) -> int:
        res = await self.db.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
        )
        return res.scalar() or 0

    async def mark_as_read(self, notification_id: UUID) -> Optional[Notification]:
        res = await self.db.execute(select(Notification).where(Notification.id == notification_id))
        notif = res.scalars().first()
        if notif:
            notif.is_read = True
            await self.db.commit()
            await self.db.refresh(notif)
        return notif

    async def mark_all_as_read(self, user_id: UUID) -> int:
        res = await self.db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        await self.db.commit()
        return res.rowcount

    async def get_or_create_preferences(self, user_id: UUID) -> NotificationPreference:
        res = await self.db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        pref = res.scalars().first()
        if not pref:
            pref = NotificationPreference(
                user_id=user_id,
                email_enabled=True,
                category_preferences={
                    "interview": True,
                    "roadmap": True,
                    "github": True,
                    "ai_advice": True,
                    "system": True
                }
            )
            self.db.add(pref)
            await self.db.commit()
            await self.db.refresh(pref)
        return pref

    async def update_preferences(self, user_id: UUID, email_enabled: bool, category_preferences: dict) -> NotificationPreference:
        pref = await self.get_or_create_preferences(user_id)
        pref.email_enabled = email_enabled
        pref.category_preferences = category_preferences
        await self.db.commit()
        await self.db.refresh(pref)
        return pref
