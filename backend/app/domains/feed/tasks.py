import logging
import math
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.celery_app import celery_app
from app.core.database import SessionLocal

logger = logging.getLogger("devfolio.feed_tasks")

HALF_LIFE_DAYS = 3.0
DECAY_LAMBDA = math.log(2) / HALF_LIFE_DAYS


def compute_trending_score(views: int, likes: int, age_days: float) -> float:
    """
    Time-decayed trending score.
    Score = (views * 1.0 + likes * 3.0) * exp(-lambda * age_days)
    Half-life = 3 days.
    """
    raw = views * 1.0 + likes * 3.0
    decay = math.exp(-DECAY_LAMBDA * max(age_days, 0))
    return round(raw * decay, 4)


@celery_app.task(name="compute_trending_projects_task")
def compute_trending_projects_task():
    """
    Celery Beat task: scores projects by recent views (from analytics_events.entity_id)
    and likes on project-share posts. Upserts into trending_projects using ON CONFLICT.
    """
    logger.info("Computing trending project scores...")
    cutoff = datetime.utcnow() - timedelta(days=7)

    with SessionLocal() as db:
        # Aggregate project views from analytics_events where entity_id is a project UUID
        views_query = text("""
            SELECT entity_id AS project_id, COUNT(*) AS view_count
            FROM analytics_events
            WHERE event_type = 'project_view'
              AND entity_id IS NOT NULL
              AND timestamp >= :cutoff
            GROUP BY entity_id
        """)
        views_result = db.execute(views_query, {"cutoff": cutoff}).fetchall()
        views_map = {str(r.project_id): r.view_count for r in views_result}

        # Aggregate likes on project_share posts
        likes_query = text("""
            SELECT p.shared_project_id AS project_id, COUNT(*) AS like_count
            FROM post_likes pl
            JOIN posts p ON pl.post_id = p.id
            WHERE p.post_type = 'project_share'
              AND p.shared_project_id IS NOT NULL
              AND pl.created_at >= :cutoff
            GROUP BY p.shared_project_id
        """)
        likes_result = db.execute(likes_query, {"cutoff": cutoff}).fetchall()
        likes_map = {str(r.project_id): r.like_count for r in likes_result}

        # Merge all project IDs
        all_project_ids = set(views_map.keys()) | set(likes_map.keys())

        for pid in all_project_ids:
            views = views_map.get(pid, 0)
            likes = likes_map.get(pid, 0)
            score = compute_trending_score(views, likes, age_days=0)

            upsert = text("""
                INSERT INTO trending_projects (id, project_id, score, likes_count, views_count, computed_at)
                VALUES (gen_random_uuid(), :pid, :score, :likes, :views, NOW())
                ON CONFLICT (project_id) DO UPDATE SET
                    score = EXCLUDED.score,
                    likes_count = EXCLUDED.likes_count,
                    views_count = EXCLUDED.views_count,
                    computed_at = EXCLUDED.computed_at
            """)
            db.execute(upsert, {"pid": pid, "score": score, "likes": likes, "views": views})

        db.commit()

    logger.info(f"Trending scores computed for {len(all_project_ids)} projects.")
    return {"projects_scored": len(all_project_ids)}
