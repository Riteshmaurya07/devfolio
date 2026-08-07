from typing import Optional, List, Dict, Any
from uuid import UUID
from app.domains.notifications.repository import NotificationRepository
from app.domains.notifications.models import Notification, NotificationPreference
from app.domains.notifications.schemas import NotificationCreate
from app.domains.notifications.tasks import send_email_notification_task
from app.core.exceptions import ValidationError, NotFoundError

class NotificationService:
    def __init__(self, repository: NotificationRepository):
        self.repository = repository

    async def create_notification(self, notif_in: NotificationCreate) -> Notification:
        payload = notif_in.payload or {}
        # Validate action_url if present
        if "action_url" in payload and payload["action_url"]:
            url = str(payload["action_url"])
            if not url.startswith("/") or url.startswith("//"):
                raise ValidationError(message="action_url must be a relative internal path starting with '/'")

        # Get or create user preference record (eager/lazy guarantee)
        pref = await self.repository.get_or_create_preferences(notif_in.user_id)
        category_allowed = pref.category_preferences.get(notif_in.category, True)

        if not category_allowed:
            # Category disabled by user preference
            return None

        notif = await self.repository.create_notification(
            user_id=notif_in.user_id,
            category=notif_in.category,
            notification_type=notif_in.notification_type,
            title=notif_in.title,
            message=notif_in.message,
            payload=payload
        )

        # Trigger email delivery task if enabled
        if pref.email_enabled:
            send_email_notification_task.delay(
                user_id_str=str(notif_in.user_id),
                category=notif_in.category,
                title=notif_in.title,
                message=notif_in.message
            )

        return notif

    async def get_user_notifications(self, user_id: UUID, limit: int = 20) -> List[Notification]:
        return await self.repository.get_user_notifications(user_id, limit)

    async def get_unread_count(self, user_id: UUID) -> int:
        return await self.repository.get_unread_count(user_id)

    async def mark_as_read(self, notification_id: UUID) -> Notification:
        notif = await self.repository.mark_as_read(notification_id)
        if not notif:
            raise NotFoundError(message="Notification not found")
        return notif

    async def mark_all_as_read(self, user_id: UUID) -> int:
        return await self.repository.mark_all_as_read(user_id)

    async def get_preferences(self, user_id: UUID) -> NotificationPreference:
        return await self.repository.get_or_create_preferences(user_id)

    async def update_preferences(self, user_id: UUID, email_enabled: bool, category_preferences: dict) -> NotificationPreference:
        return await self.repository.update_preferences(user_id, email_enabled, category_preferences)
