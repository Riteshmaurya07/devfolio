from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from datetime import datetime
from app.domains.platforms.models import ConnectedAccount, PlatformStatsHistory

class PlatformRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_account_by_id(self, account_id: str) -> Optional[ConnectedAccount]:
        result = await self.db.execute(select(ConnectedAccount).where(ConnectedAccount.id == account_id))
        return result.scalars().first()

    async def get_accounts_by_user(self, user_id: str) -> List[ConnectedAccount]:
        result = await self.db.execute(select(ConnectedAccount).where(ConnectedAccount.user_id == user_id))
        return result.scalars().all()

    async def create_account(self, user_id: str, platform_name: str, username: str) -> ConnectedAccount:
        acc = ConnectedAccount(
            user_id=user_id,
            platform_name=platform_name,
            platform_username=username
        )
        self.db.add(acc)
        await self.db.commit()
        await self.db.refresh(acc)
        return acc

    async def create_history(self, account_id: str, raw_data: dict, parsed_metrics: dict) -> PlatformStatsHistory:
        hist = PlatformStatsHistory(
            account_id=account_id,
            raw_data=raw_data,
            parsed_metrics=parsed_metrics
        )
        self.db.add(hist)
        
        # Update last_synced_at
        await self.db.execute(
            update(ConnectedAccount)
            .where(ConnectedAccount.id == account_id)
            .values(last_synced_at=datetime.utcnow())
        )
        
        await self.db.commit()
        await self.db.refresh(hist)
        return hist
