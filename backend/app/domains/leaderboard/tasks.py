import logging
from sqlalchemy import text
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.domains.leaderboard.scoring_engine import calculate_developer_score, evaluate_badge_rules

logger = logging.getLogger("devfolio.leaderboard_tasks")

@celery_app.task(name="recompute_leaderboard_rankings_task")
def recompute_leaderboard_rankings_task():
    """
    Celery Beat periodic task: recomputes developer scores using normalized formula (0-100),
    derives commits from contribution_calendar, awards permanent badges, and assigns ranks.
    """
    logger.info("Executing periodic leaderboard recomputation...")

    with SessionLocal() as db:
        profiles_res = db.execute(text("SELECT id FROM profiles"))
        profiles = profiles_res.fetchall()

        scores = []
        for p in profiles:
            pid = str(p.id)

            # Derive metrics across modules
            # 1. Coding stats
            cf_res = db.execute(text("SELECT rating, solved_count FROM codeforces_stats WHERE profile_id = :pid"), {"pid": pid}).fetchone()
            solved_count = cf_res.solved_count if cf_res else 0
            rating = cf_res.rating if cf_res else 0

            # 2. GitHub commits & stars
            gh_res = db.execute(text("SELECT contribution_calendar FROM github_accounts WHERE profile_id = :pid"), {"pid": pid}).fetchone()
            total_commits = 0
            if gh_res and gh_res.contribution_calendar:
                total_commits = sum((gh_res.contribution_calendar or {}).values())

            stars_res = db.execute(text("SELECT COALESCE(SUM(stars_count), 0) as stars FROM repositories WHERE profile_id = :pid"), {"pid": pid}).fetchone()
            total_stars = stars_res.stars if stars_res else 0

            # 3. Roadmap completion
            rm_res = db.execute(text("SELECT completion_percentage FROM roadmap_progress WHERE profile_id = :pid"), {"pid": pid}).fetchone()
            roadmap_pct = rm_res.completion_percentage if rm_res else 0.0

            # 4. Views & projects
            view_res = db.execute(text("SELECT COUNT(*) as views FROM analytics_events WHERE profile_id = :pid"), {"pid": pid}).fetchone()
            total_views = view_res.views if view_res else 0

            proj_res = db.execute(text("SELECT COUNT(*) as projs FROM portfolio_projects WHERE portfolio_id IN (SELECT id FROM portfolio_configs WHERE profile_id = :pid)"), {"pid": pid}).fetchone()
            project_count = proj_res.projs if proj_res else 0

            raw_metrics = {
                "problems_solved": solved_count,
                "contest_rating": rating,
                "total_commits": total_commits,
                "total_stars": total_stars,
                "roadmap_completion_pct": roadmap_pct,
                "total_views": total_views,
                "project_count": project_count
            }

            score_res = calculate_developer_score(raw_metrics)
            scores.append((pid, score_res, raw_metrics))

        # Sort profiles deterministically
        scores.sort(key=lambda x: x[1]["total_score"], reverse=True)

        for rank, (pid, score_res, raw_metrics) in enumerate(scores, start=1):
            # Upsert leaderboard_entries
            upsert_q = text("""
                INSERT INTO leaderboard_entries (id, profile_id, rank, total_score, coding_score, contribution_score, roadmap_score, portfolio_score, score_breakdown, updated_at)
                VALUES (gen_random_uuid(), :pid, :rank, :total, :coding, :contrib, :roadmap, :portfolio, :breakdown::jsonb, NOW())
                ON CONFLICT (profile_id) DO UPDATE SET
                    rank = EXCLUDED.rank,
                    total_score = EXCLUDED.total_score,
                    coding_score = EXCLUDED.coding_score,
                    contribution_score = EXCLUDED.contribution_score,
                    roadmap_score = EXCLUDED.roadmap_score,
                    portfolio_score = EXCLUDED.portfolio_score,
                    score_breakdown = EXCLUDED.score_breakdown,
                    updated_at = EXCLUDED.updated_at;
            """)
            db.execute(upsert_q, {
                "pid": pid,
                "rank": rank,
                "total": score_res["total_score"],
                "coding": score_res["coding_score"],
                "contrib": score_res["contribution_score"],
                "roadmap": score_res["roadmap_score"],
                "portfolio": score_res["portfolio_score"],
                "breakdown": str(score_res["breakdown"]).replace("'", '"')
            })

            # Award permanent badges
            badge_res = db.execute(text("SELECT b.slug FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.profile_id = :pid"), {"pid": pid}).fetchall()
            existing_slugs = {b.slug for b in badge_res}

            new_badges = evaluate_badge_rules(raw_metrics, existing_slugs)
            for badge_rule in new_badges:
                b_id_res = db.execute(text("SELECT id FROM badges WHERE slug = :slug"), {"slug": badge_rule["slug"]}).fetchone()
                if b_id_res:
                    award_q = text("""
                        INSERT INTO user_badges (id, profile_id, badge_id, awarded_at)
                        VALUES (gen_random_uuid(), :pid, :bid, NOW())
                        ON CONFLICT (profile_id, badge_id) DO NOTHING;
                    """)
                    db.execute(award_q, {"pid": pid, "bid": b_id_res.id})

        db.commit()

    logger.info(f"Recomputed rankings for {len(scores)} developers.")
    return {"developers_ranked": len(scores)}
