from app.core.celery_app import celery_app
import logging
import asyncio
from datetime import datetime
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.domains.platforms.models import CodingProfile, CodeforcesStats, LeetCodeStats
from app.domains.platforms.clients.codeforces import CodeforcesClient
from app.domains.platforms.clients.leetcode import LeetCodeClient

logger = logging.getLogger("devfolio.platform_tasks")

async def _sync_codeforces_async(profile_id_str: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CodingProfile).where(
                CodingProfile.profile_id == profile_id_str,
                CodingProfile.platform == "codeforces"
            )
        )
        cp = result.scalars().first()
        if not cp:
            logger.warning(f"CodingProfile not found for {profile_id_str} (codeforces)")
            return

        try:
            client = CodeforcesClient()
            stats_data = await client.fetch_user_info(cp.external_username)
            
            stats_result = await session.execute(
                select(CodeforcesStats).where(CodeforcesStats.coding_profile_id == cp.id)
            )
            stats = stats_result.scalars().first()
            if not stats:
                stats = CodeforcesStats(coding_profile_id=cp.id)
                session.add(stats)
            
            for k, v in stats_data.items():
                setattr(stats, k, v)
                
            cp.sync_status = "ok"
            cp.sync_error_message = None
            cp.last_synced_at = datetime.utcnow()
            
            await session.commit()
        except Exception as e:
            logger.error(f"Error syncing Codeforces: {e}")
            cp.sync_status = "error"
            cp.sync_error_message = str(e)
            await session.commit()

async def _sync_leetcode_async(profile_id_str: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CodingProfile).where(
                CodingProfile.profile_id == profile_id_str,
                CodingProfile.platform == "leetcode"
            )
        )
        cp = result.scalars().first()
        if not cp:
            logger.warning(f"CodingProfile not found for {profile_id_str} (leetcode)")
            return

        try:
            client = LeetCodeClient()
            stats_data = await client.fetch_user_info(cp.external_username)
            
            stats_result = await session.execute(
                select(LeetCodeStats).where(LeetCodeStats.coding_profile_id == cp.id)
            )
            stats = stats_result.scalars().first()
            if not stats:
                stats = LeetCodeStats(coding_profile_id=cp.id)
                session.add(stats)
            
            for k, v in stats_data.items():
                setattr(stats, k, v)
                
            cp.sync_status = "ok"
            cp.sync_error_message = None
            cp.last_synced_at = datetime.utcnow()
            
            await session.commit()
        except Exception as e:
            logger.error(f"Error syncing LeetCode: {e}")
            cp.sync_status = "error"
            cp.sync_error_message = str(e)
            await session.commit()

@celery_app.task(name="sync_codeforces_account_task")
def sync_codeforces_account_task(profile_id: str):
    logger.info(f"Executing isolated Codeforces sync for profile_id={profile_id}")
    asyncio.run(_sync_codeforces_async(profile_id))
    return {"status": "ok", "profile_id": profile_id, "platform": "codeforces"}

@celery_app.task(name="sync_leetcode_account_task")
def sync_leetcode_account_task(profile_id: str):
    logger.info(f"Executing isolated LeetCode sync for profile_id={profile_id}")
    asyncio.run(_sync_leetcode_async(profile_id))
    return {"status": "ok", "profile_id": profile_id, "platform": "leetcode"}

@celery_app.task(name="sync_codechef_account_task")
def sync_codechef_account_task(profile_id: str):
    logger.info(f"Executing isolated CodeChef sync for profile_id={profile_id}")
    return {"status": "ok", "profile_id": profile_id, "platform": "codechef"}
