import asyncio
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.notifications.schemas import NotificationResponse, NotificationPreferenceSchema, NotificationCreate
from app.domains.notifications.repository import NotificationRepository
from app.domains.notifications.service import NotificationService
from app.core.database import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])

def get_notification_service(db = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepository(db))

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    return await service.get_user_notifications(current_user.id, limit)

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    count = await service.get_unread_count(current_user.id)
    return {"unread_count": count}

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    return await service.mark_as_read(notification_id)

@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    count = await service.mark_all_as_read(current_user.id)
    return {"updated_count": count}

@router.get("/preferences", response_model=NotificationPreferenceSchema)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    pref = await service.get_preferences(current_user.id)
    return {
        "email_enabled": pref.email_enabled,
        "category_preferences": pref.category_preferences
    }

@router.put("/preferences", response_model=NotificationPreferenceSchema)
async def update_preferences(
    schema: NotificationPreferenceSchema,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    pref = await service.update_preferences(current_user.id, schema.email_enabled, schema.category_preferences)
    return {
        "email_enabled": pref.email_enabled,
        "category_preferences": pref.category_preferences
    }

@router.get("/stream")
async def stream_notifications(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """
    SSE stream for real-time notification alerts.
    (Note: Suitable for single-instance scale; can be scaled out via Redis Pub/Sub in future passes.)
    """
    async def event_generator():
        last_count = await service.get_unread_count(current_user.id)
        while True:
            await asyncio.sleep(5)
            new_count = await service.get_unread_count(current_user.id)
            if new_count != last_count:
                last_count = new_count
                yield f"data: {{\"unread_count\": {new_count}}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )
