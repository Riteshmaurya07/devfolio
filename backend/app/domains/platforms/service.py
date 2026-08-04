from fastapi import HTTPException, status
from app.domains.platforms.repository import PlatformRepository
from app.domains.platforms.tasks import sync_platform_account

class PlatformService:
    def __init__(self, repo: PlatformRepository):
        self.repo = repo

    async def connect_account(self, user_id: str, platform_name: str, username: str):
        # Prevent duplicates
        existing = await self.repo.get_accounts_by_user(user_id)
        if any(acc.platform_name == platform_name for acc in existing):
            raise HTTPException(status_code=400, detail=f"Platform {platform_name} already connected.")
            
        acc = await self.repo.create_account(user_id, platform_name, username)
        
        # Trigger background sync immediately after connecting
        sync_platform_account.delay(str(acc.id))
        
        return acc

    async def trigger_sync(self, account_id: str, user_id: str):
        acc = await self.repo.get_account_by_id(account_id)
        if not acc or acc.user_id != user_id:
            raise HTTPException(status_code=404, detail="Account not found.")
            
        # Trigger celery task
        sync_platform_account.delay(str(acc.id))
        return {"status": "Sync triggered successfully"}
