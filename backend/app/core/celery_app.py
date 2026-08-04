from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "devfolio_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        'daily-reminders': {
            'task': 'app.domains.notifications.tasks.send_daily_reminders',
            'schedule': 86400.0, # Run once a day
        }
    }
)

# Load task modules so Celery Beat and Workers can discover them
celery_app.autodiscover_tasks([
    'app.domains.platforms.tasks',
    'app.domains.notifications.tasks'
])
