import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.celery_app import celery_app
from app.core.database import SessionLocal

logger = logging.getLogger("devfolio.roadmap_tasks")

ROADMAP_REMINDER_COOLDOWN_DAYS = 7

@celery_app.task(name="scan_roadmap_reminders_task")
def scan_roadmap_reminders_task():
    """
    Celery Beat task: scans active roadmap progress with uncompleted milestones.
    Enforces a 7-day cooldown per roadmap milestone to prevent spamming notifications daily.
    """
    logger.info("Executing roadmap reminder scanner with 7-day cooldown guard...")
    cooldown_cutoff = datetime.utcnow() - timedelta(days=ROADMAP_REMINDER_COOLDOWN_DAYS)

    with SessionLocal() as db:
        # Find active roadmap progress entries
        query = text("""
            SELECT rp.id, rp.profile_id, rp.template_id, p.user_id, t.title
            FROM roadmap_progress rp
            JOIN profiles p ON rp.profile_id = p.id
            JOIN roadmap_templates t ON rp.template_id = t.id
            WHERE rp.completion_percentage < 100.0
        """)
        results = db.execute(query).fetchall()

        notifications_sent = 0
        for row in results:
            # Check if a notification for this user & roadmap was sent within the last 7 days
            recent_notif = db.execute(
                text("""
                    SELECT id FROM notifications
                    WHERE user_id = :uid
                      AND category = 'roadmap'
                      AND (payload->>'template_id')::text = :tid
                      AND created_at >= :cutoff
                """),
                {"uid": row.user_id, "tid": str(row.template_id), "cutoff": cooldown_cutoff}
            ).fetchone()

            if not recent_notif:
                # Emit notification with 7-day cooldown payload
                db.execute(
                    text("""
                        INSERT INTO notifications (id, user_id, category, notification_type, title, message, payload, is_read, created_at)
                        VALUES (gen_random_uuid(), :uid, 'roadmap', 'time_based', 'Roadmap Progress Reminder',
                                :msg, :payload::jsonb, false, NOW())
                    """),
                    {
                        "uid": row.user_id,
                        "msg": f"Keep learning! You have unfinished milestones in {row.title}.",
                        "payload": f'{{"action_url": "/roadmaps", "template_id": "{row.template_id}"}}'
                    }
                )
                notifications_sent += 1

        db.commit()

    logger.info(f"Roadmap reminder scan complete. Sent {notifications_sent} notifications.")
    return {"notifications_sent": notifications_sent}
