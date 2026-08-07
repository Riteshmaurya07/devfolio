from app.core.celery_app import celery_app
import logging

logger = logging.getLogger("devfolio.platform_tasks")

@celery_app.task(name="sync_codeforces_account_task")
def sync_codeforces_account_task(profile_id: str):
    logger.info(f"Executing isolated Codeforces sync for profile_id={profile_id}")
    return {"status": "ok", "profile_id": profile_id, "platform": "codeforces"}

@celery_app.task(name="sync_leetcode_account_task")
def sync_leetcode_account_task(profile_id: str):
    logger.info(f"Executing isolated LeetCode sync for profile_id={profile_id}")
    return {"status": "ok", "profile_id": profile_id, "platform": "leetcode"}

@celery_app.task(name="sync_codechef_account_task")
def sync_codechef_account_task(profile_id: str):
    logger.info(f"Executing isolated CodeChef sync for profile_id={profile_id}")
    return {"status": "ok", "profile_id": profile_id, "platform": "codechef"}
