import asyncio
from celery import shared_task
from uuid import UUID
from sqlalchemy import text
from app.core.database import SessionLocal
from app.domains.github.repository import GitHubRepository
from app.domains.github.service import GitHubService
from app.utils.crypto import decrypt_token

@shared_task(name="app.domains.github.tasks.sync_github_account_task")
def sync_github_account_task(profile_id_str: str):
    profile_id = UUID(profile_id_str)
    
    async def _run_sync():
        async with SessionLocal() as db:
            repo = GitHubRepository(db)
            service = GitHubService(repo)
            account = await repo.get_by_profile_id(profile_id)
            if account and account.encrypted_token:
                token = decrypt_token(account.encrypted_token)
                
                # Check pre-sync repo count
                prev_repos = await db.execute(
                    text("SELECT COUNT(*) FROM repositories WHERE profile_id = :pid"),
                    {"pid": str(profile_id)}
                )
                prev_count = prev_repos.scalar() or 0

                await service.sync_github(profile_id, token)

                # Check post-sync repo count (diff guard)
                post_repos = await db.execute(
                    text("SELECT COUNT(*) FROM repositories WHERE profile_id = :pid"),
                    {"pid": str(profile_id)}
                )
                post_count = post_repos.scalar() or 0

                # Only emit notification if new repos/activity were discovered
                if post_count > prev_count:
                    prof_res = await db.execute(
                        text("SELECT user_id FROM profiles WHERE id = :pid"),
                        {"pid": str(profile_id)}
                    )
                    prof = prof_res.fetchone()
                    if prof:
                        await db.execute(
                            text("""
                                INSERT INTO notifications (id, user_id, category, notification_type, title, message, payload, is_read, created_at)
                                VALUES (gen_random_uuid(), :uid, 'github', 'event_based', 'GitHub Sync Complete',
                                        :msg, '{"action_url": "/github"}'::jsonb, false, NOW())
                            """),
                            {
                                "uid": prof.user_id,
                                "msg": f"GitHub sync completed. {post_count - prev_count} new repositories imported."
                            }
                        )
                        await db.commit()

    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.ensure_future(_run_sync())
    else:
        loop.run_until_complete(_run_sync())
