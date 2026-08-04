from fastapi import APIRouter, Depends
from app.domains.notifications.service import NotificationService
from app.api.dependencies import get_notification_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    notifs = await service.get_unread_notifications(str(current_user.id))
    return {"notifications": notifs}

@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    service: NotificationService = Depends(get_notification_service)
):
    return await service.mark_read(notification_id)
