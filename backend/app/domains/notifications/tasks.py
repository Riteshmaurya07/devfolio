import logging
from uuid import UUID
from app.core.celery_app import celery_app

logger = logging.getLogger("devfolio.notification_tasks")

@celery_app.task(
    name="send_email_notification_task",
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3
)
def send_email_notification_task(user_id_str: str, category: str, title: str, message: str):
    """
    Celery task sending email notifications with exponential retry backoff.
    """
    logger.info(f"Sending email notification [{category}] to user {user_id_str}: '{title}'")
    # Mock SMTP mailer dispatching templated email
    return {"status": "sent", "user_id": user_id_str, "category": category}
