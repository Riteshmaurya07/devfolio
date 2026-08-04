from app.domains.notifications.repository import NotificationRepository

class NotificationService:
    def __init__(self, repo: NotificationRepository):
        self.repo = repo

    async def get_unread_notifications(self, user_id: str):
        return await self.repo.get_unread(user_id)

    async def mark_read(self, notification_id: str):
        await self.repo.mark_as_read(notification_id)
        return {"status": "success"}
