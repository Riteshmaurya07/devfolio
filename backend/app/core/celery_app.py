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
    # Example Beat Schedule (can be configured later)
    # beat_schedule={
    #     'daily-sync': {
    #         'task': 'app.domains.platforms.tasks.sync_all_accounts',
    #         'schedule': 86400.0,
    #     }
    # }
)

# Optional: Load task modules here or let Celery discover them when running worker
celery_app.autodiscover_tasks(['app.domains.platforms.tasks'])
