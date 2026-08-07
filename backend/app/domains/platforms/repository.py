from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.domains.platforms.models import CodingProfile, CodeforcesStats, LeetCodeStats, CodeChefStats

class CodingProfileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_profile_and_platform(self, profile_id: UUID, platform: str) -> Optional[CodingProfile]:
        res = await self.db.execute(
            select(CodingProfile).where(
                CodingProfile.profile_id == profile_id,
                CodingProfile.platform == platform
            )
        )
        return res.scalars().first()

    async def get_all_by_profile_id(self, profile_id: UUID) -> List[CodingProfile]:
        res = await self.db.execute(
            select(CodingProfile).where(CodingProfile.profile_id == profile_id)
        )
        return res.scalars().all()

    async def upsert_coding_profile(self, profile_id: UUID, platform: str, external_username: str) -> CodingProfile:
        existing = await self.get_by_profile_and_platform(profile_id, platform)
        if existing:
            existing.external_username = external_username
            existing.sync_status = "ok"
            existing.sync_error_message = None
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        cp = CodingProfile(
            profile_id=profile_id,
            platform=platform,
            external_username=external_username,
            sync_status="ok"
        )
        self.db.add(cp)
        await self.db.commit()
        await self.db.refresh(cp)
        return cp

    async def update_sync_status(self, profile_id: UUID, platform: str, status: str, error_msg: Optional[str] = None):
        cp = await self.get_by_profile_and_platform(profile_id, platform)
        if cp:
            cp.sync_status = status
            cp.sync_error_message = error_msg
            if status == "ok":
                cp.last_synced_at = datetime.utcnow()
            await self.db.commit()
