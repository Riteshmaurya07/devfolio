from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import update
from app.domains.roadmaps.models import Roadmap, RoadmapWeek, RoadmapTask

class RoadmapRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_roadmaps(self, user_id: str) -> List[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id)
            .order_by(Roadmap.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_roadmap_details(self, roadmap_id: str) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.id == roadmap_id)
            .options(
                selectinload(Roadmap.weeks).selectinload(RoadmapWeek.tasks)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_roadmap(self, user_id: str, goal: str) -> Roadmap:
        roadmap = Roadmap(user_id=user_id, goal=goal)
        self.db.add(roadmap)
        await self.db.commit()
        await self.db.refresh(roadmap)
        return roadmap

    async def add_week(self, roadmap_id: str, week_number: int, title: str) -> RoadmapWeek:
        week = RoadmapWeek(roadmap_id=roadmap_id, week_number=week_number, title=title)
        self.db.add(week)
        await self.db.commit()
        await self.db.refresh(week)
        return week

    async def add_task(self, week_id: str, description: str) -> RoadmapTask:
        task = RoadmapTask(week_id=week_id, description=description)
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def toggle_task(self, task_id: str, is_completed: bool):
        await self.db.execute(
            update(RoadmapTask)
            .where(RoadmapTask.id == task_id)
            .values(is_completed=is_completed)
        )
        await self.db.commit()
