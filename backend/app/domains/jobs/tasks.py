import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.celery_app import celery_app
from app.core.database import SessionLocal

logger = logging.getLogger("devfolio.job_tasks")

@celery_app.task(name="scan_upcoming_interview_reminders_task")
def scan_upcoming_interview_reminders_task():
    """
    Atomic periodic scanner for interviews in the next 24 hours UTC.
    Uses atomic UPDATE ... WHERE is_reminder_sent = false AND scheduled_at <= :window
    to eliminate double-firing under concurrent Celery workers, writing to the notifications table.
    """
    logger.info("Executing atomic interview reminder scanner...")
    window = datetime.utcnow() + timedelta(hours=24)

    with SessionLocal() as db:
        query = text(
            "UPDATE interviews SET is_reminder_sent = true WHERE is_reminder_sent = false AND scheduled_at <= :window RETURNING id, job_application_id, scheduled_at, round_type"
        )
        res = db.execute(query, {"window": window})
        updated_interviews = res.fetchall()

        for inv in updated_interviews:
            # Wire to NotificationService / database directly
            notif_query = text(
                """
                INSERT INTO notifications (id, user_id, category, notification_type, title, message, payload, is_read, created_at)
                SELECT gen_random_uuid(), p.user_id, 'interview', 'time_based', 'Upcoming Interview Reminder',
                       'You have an upcoming interview scheduled.', '{"action_url": "/job-tracker"}'::jsonb, false, NOW()
                FROM job_applications ja
                JOIN profiles p ON ja.profile_id = p.id
                WHERE ja.id = :ja_id
                """
            )
            db.execute(notif_query, {"ja_id": inv.job_application_id})

        db.commit()

    logger.info(f"Processed {len(updated_interviews)} interview reminders.")
    return {"reminders_processed": len(updated_interviews)}
