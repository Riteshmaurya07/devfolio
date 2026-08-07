from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func
from app.domains.resumes.models import ResumeVersion

class ResumeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_profile_id(self, profile_id: UUID) -> List[ResumeVersion]:
        res = await self.db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.profile_id == profile_id)
            .order_by(ResumeVersion.version_number.desc())
        )
        return res.scalars().all()

    async def get_active_by_profile_id(self, profile_id: UUID) -> Optional[ResumeVersion]:
        res = await self.db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.profile_id == profile_id, ResumeVersion.is_active == True)
        )
        return res.scalars().first()

    async def get_by_id(self, version_id: UUID) -> Optional[ResumeVersion]:
        res = await self.db.execute(
            select(ResumeVersion).where(ResumeVersion.id == version_id)
        )
        return res.scalars().first()

    async def update_version(self, version_id: UUID, title: str, content: dict) -> Optional[ResumeVersion]:
        version = await self.get_by_id(version_id)
        if version:
            version.title = title
            version.content = content
            await self.db.commit()
            await self.db.refresh(version)
        return version

    async def get_next_version_number(self, profile_id: UUID) -> int:
        res = await self.db.execute(
            select(func.coalesce(func.max(ResumeVersion.version_number), 0)).where(ResumeVersion.profile_id == profile_id)
        )
        max_ver = res.scalar()
        return max_ver + 1

    async def create_version(self, profile_id: UUID, title: str, template_name: str, content: dict, is_active: bool = True) -> ResumeVersion:
        version_num = await self.get_next_version_number(profile_id)
        
        # Single-Transaction Activation Swap
        if is_active:
            await self.db.execute(
                update(ResumeVersion)
                .where(ResumeVersion.profile_id == profile_id, ResumeVersion.is_active == True)
                .values(is_active=False)
            )

        new_version = ResumeVersion(
            profile_id=profile_id,
            title=title,
            version_number=version_num,
            is_active=is_active,
            template_name=template_name,
            content=content
        )
        self.db.add(new_version)
        await self.db.commit()
        await self.db.refresh(new_version)
        return new_version

    async def activate_version(self, profile_id: UUID, version_id: UUID) -> ResumeVersion:
        # Single-Transaction Active Version Swap
        await self.db.execute(
            update(ResumeVersion)
            .where(ResumeVersion.profile_id == profile_id, ResumeVersion.is_active == True)
            .values(is_active=False)
        )
        
        target = await self.get_by_id(version_id)
        if target:
            target.is_active = True
            await self.db.commit()
            await self.db.refresh(target)
        return target
