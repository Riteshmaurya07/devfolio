import asyncio
from app.core.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.domains.notifications.repository import NotificationRepository
from app.domains.users.models import User
from sqlalchemy.future import select

async def _send_daily_reminders_async():
    async with AsyncSessionLocal() as db:
        repo = NotificationRepository(db)
        
        # Example: Fetch users who haven't logged in recently
        # Here we just send a broadcast for demonstration purposes
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        for user in users:
            await repo.create(
                user_id=str(user.id),
                type="time_based",
                title="Daily Reminder",
                message="Don't forget to practice coding today!"
            )

@celery_app.task
def send_daily_reminders():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(_send_daily_reminders_async())
