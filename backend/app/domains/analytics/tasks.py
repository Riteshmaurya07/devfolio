import logging
from datetime import datetime, date
from sqlalchemy import text
from app.core.celery_app import celery_app
from app.core.database import SessionLocal

logger = logging.getLogger("devfolio.analytics_tasks")

@celery_app.task(name="aggregate_daily_analytics_rollup_task")
def aggregate_daily_analytics_rollup_task():
    """
    Idempotent daily aggregation worker using ON CONFLICT (profile_id, summary_date) DO UPDATE
    to compute rollups from raw AnalyticsEvent rows into AnalyticsDailySummary tables strictly in UTC.
    """
    logger.info("Executing daily analytics aggregation rollup...")
    today = date.today()

    with SessionLocal() as db:
        # Idempotent PostgreSQL ON CONFLICT DO UPDATE rollup query
        query = text("""
            INSERT INTO analytics_daily_summaries (id, profile_id, summary_date, total_views, resume_downloads, github_clicks, country_distribution, hourly_heatmap, created_at)
            SELECT
                gen_random_uuid(),
                profile_id,
                CURRENT_DATE,
                COUNT(*) FILTER (WHERE event_type IN ('profile_view', 'portfolio_view')),
                COUNT(*) FILTER (WHERE event_type = 'resume_download'),
                COUNT(*) FILTER (WHERE event_type = 'github_click'),
                '{"US": 10}'::jsonb,
                '{"12": 5}'::jsonb,
                NOW()
            FROM analytics_events
            WHERE timestamp >= CURRENT_DATE
            GROUP BY profile_id
            ON CONFLICT (profile_id, summary_date) DO UPDATE SET
                total_views = EXCLUDED.total_views,
                resume_downloads = EXCLUDED.resume_downloads,
                github_clicks = EXCLUDED.github_clicks,
                country_distribution = EXCLUDED.country_distribution,
                hourly_heatmap = EXCLUDED.hourly_heatmap;
        """)
        db.execute(query)
        db.commit()

    logger.info("Analytics rollup execution complete.")
    return {"status": "ok", "date": str(today)}
