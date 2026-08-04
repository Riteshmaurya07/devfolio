from fastapi import HTTPException
from app.domains.roadmaps.repository import RoadmapRepository
from app.domains.roadmaps.schemas import RoadmapCreate

class RoadmapService:
    def __init__(self, repo: RoadmapRepository):
        self.repo = repo

    async def generate_roadmap(self, user_id: str, data: RoadmapCreate):
        # 1. Create Roadmap Goal
        roadmap = await self.repo.create_roadmap(user_id, data.goal)
        
        # 2. Mock AI Generation (Placeholder for LLM chain)
        # In production, we'd pass the goal to an LLM, parse JSON, and insert weeks/tasks
        week1 = await self.repo.add_week(str(roadmap.id), 1, "Fundamentals")
        await self.repo.add_task(str(week1.id), "Learn the basics of HTTP")
        await self.repo.add_task(str(week1.id), "Understand RESTful principles")
        
        week2 = await self.repo.add_week(str(roadmap.id), 2, "Advanced Concepts")
        await self.repo.add_task(str(week2.id), "Build a CRUD API")
        
        # Fetch the full generated roadmap to return
        return await self.repo.get_roadmap_details(str(roadmap.id))

    async def get_roadmaps(self, user_id: str):
        return await self.repo.get_user_roadmaps(user_id)

    async def get_roadmap(self, user_id: str, roadmap_id: str):
        roadmap = await self.repo.get_roadmap_details(roadmap_id)
        if not roadmap or str(roadmap.user_id) != user_id:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        # Ensure weeks are sorted
        roadmap.weeks = sorted(roadmap.weeks, key=lambda w: w.week_number)
        return roadmap

    async def toggle_task_completion(self, user_id: str, roadmap_id: str, task_id: str, is_completed: bool):
        # Verify ownership first
        roadmap = await self.repo.get_roadmap_details(roadmap_id)
        if not roadmap or str(roadmap.user_id) != user_id:
            raise HTTPException(status_code=404, detail="Roadmap not found")
            
        # Optional: check if task actually belongs to this roadmap
        await self.repo.toggle_task(task_id, is_completed)
        return {"status": "success", "is_completed": is_completed}
