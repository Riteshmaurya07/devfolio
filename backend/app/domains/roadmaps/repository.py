from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.domains.roadmaps.models import RoadmapTemplate, RoadmapProgress

class RoadmapRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_templates(self) -> List[RoadmapTemplate]:
        res = await self.db.execute(select(RoadmapTemplate))
        return res.scalars().all()

    async def get_template_by_slug(self, slug: str) -> Optional[RoadmapTemplate]:
        res = await self.db.execute(select(RoadmapTemplate).where(RoadmapTemplate.slug == slug))
        return res.scalars().first()

    async def get_template_by_id(self, template_id: UUID) -> Optional[RoadmapTemplate]:
        res = await self.db.execute(select(RoadmapTemplate).where(RoadmapTemplate.id == template_id))
        return res.scalars().first()

    async def get_progress(self, profile_id: UUID, template_id: UUID) -> Optional[RoadmapProgress]:
        res = await self.db.execute(
            select(RoadmapProgress).where(
                RoadmapProgress.profile_id == profile_id,
                RoadmapProgress.roadmap_template_id == template_id
            )
        )
        return res.scalars().first()

    async def get_all_my_progress(self, profile_id: UUID) -> List[RoadmapProgress]:
        res = await self.db.execute(
            select(RoadmapProgress).where(RoadmapProgress.profile_id == profile_id)
        )
        return res.scalars().all()

    async def start_roadmap(self, profile_id: UUID, template_id: UUID) -> RoadmapProgress:
        existing = await self.get_progress(profile_id, template_id)
        if existing:
            return existing  # Idempotent start

        progress = RoadmapProgress(
            profile_id=profile_id,
            roadmap_template_id=template_id,
            milestone_states={},
            bookmarks=[]
        )
        self.db.add(progress)
        await self.db.commit()
        await self.db.refresh(progress)
        return progress

    async def atomic_toggle_milestone(self, progress_id: UUID, milestone_id: str, is_completed: bool):
        # Atomic PostgreSQL jsonb_set update statement avoiding application read-modify-write race conditions
        query = text(
            "UPDATE roadmap_progress SET milestone_states = jsonb_set(milestone_states, ARRAY[:mid], :val::jsonb), updated_at = NOW() WHERE id = :pid"
        )
        await self.db.execute(query, {
            "mid": milestone_id,
            "val": "true" if is_completed else "false",
            "pid": progress_id
        })
        await self.db.commit()
