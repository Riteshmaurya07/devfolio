import asyncio
from app.core.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.domains.platforms.repository import PlatformRepository
from app.domains.platforms.connectors.github import GitHubConnector
from app.domains.platforms.connectors.leetcode import LeetCodeConnector

# Connector registry
CONNECTORS = {
    "github": GitHubConnector(),
    "leetcode": LeetCodeConnector()
}

async def _sync_account_async(account_id: str):
    async with AsyncSessionLocal() as db:
        repo = PlatformRepository(db)
        account = await repo.get_account_by_id(account_id)
        if not account:
            return
            
        connector = CONNECTORS.get(account.platform_name)
        if not connector:
            return

        try:
            raw_data = await connector.fetch_stats(account.platform_username)
            parsed_metrics = connector.parse_metrics(raw_data)
            
            await repo.create_history(
                account_id=account.id,
                raw_data=raw_data,
                parsed_metrics=parsed_metrics
            )
            # In a full implementation, we'd also trigger an update to USER_METRICS here.
        except Exception as e:
            # Handle logging and retry logic
            raise e

@celery_app.task(bind=True, max_retries=3)
def sync_platform_account(self, account_id: str):
    """Celery task to sync a single platform account."""
    try:
        # Run async code inside sync celery task
        loop = asyncio.get_event_loop()
        loop.run_until_complete(_sync_account_async(account_id))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
