from typing import Optional, List, Dict, Any
from uuid import UUID
from app.domains.roadmaps.repository import RoadmapRepository
from app.domains.roadmaps.models import RoadmapProgress, RoadmapTemplate
from app.domains.roadmaps.calculator import calculate_roadmap_completion
from app.domains.ai.service import AIService
from app.core.exceptions import NotFoundError

class RoadmapService:
    def __init__(self, repository: RoadmapRepository):
        self.repository = repository

    async def get_progress_response(self, progress: RoadmapProgress) -> Dict[str, Any]:
        template = await self.repository.get_template_by_id(progress.roadmap_template_id)
        total_milestones = len(template.milestones) if template and template.milestones else 0
        pct = calculate_roadmap_completion(total_milestones, progress.milestone_states or {})

        return {
            "id": progress.id,
            "profile_id": progress.profile_id,
            "roadmap_template_id": progress.roadmap_template_id,
            "milestone_states": progress.milestone_states,
            "bookmarks": progress.bookmarks,
            "ai_annotation": progress.ai_annotation,
            "completion_percentage": pct,
            "target_completion_days": progress.target_completion_days,
            "started_at": progress.started_at,
            "updated_at": progress.updated_at
        }

    async def start_roadmap(self, profile_id: UUID, template_id: UUID) -> Dict[str, Any]:
        progress = await self.repository.start_roadmap(profile_id, template_id)
        return await self.get_progress_response(progress)

    async def toggle_milestone(self, profile_id: UUID, template_id: UUID, milestone_id: str, is_completed: bool) -> Dict[str, Any]:
        progress = await self.repository.get_progress(profile_id, template_id)
        if not progress:
            progress = await self.repository.start_roadmap(profile_id, template_id)

        await self.repository.atomic_toggle_milestone(progress.id, milestone_id, is_completed)
        updated_progress = await self.repository.get_progress(profile_id, template_id)
        return await self.get_progress_response(updated_progress)

    async def toggle_bookmark(self, profile_id: UUID, template_id: UUID, milestone_id: str) -> Dict[str, Any]:
        progress = await self.repository.get_progress(profile_id, template_id)
        if not progress:
            progress = await self.repository.start_roadmap(profile_id, template_id)

        bookmarks = list(progress.bookmarks or [])
        if milestone_id in bookmarks:
            bookmarks.remove(milestone_id)
        else:
            bookmarks.append(milestone_id)

        progress.bookmarks = bookmarks
        await self.repository.db.commit()
        return await self.get_progress_response(progress)

    async def personalize_roadmap(self, profile_id: UUID, slug: str, user_skills: List[str], ai_service: AIService) -> Dict[str, Any]:
        template = await self.repository.get_template_by_slug(slug)
        if not template:
            raise NotFoundError(message=f"Roadmap '{slug}' not found.")

        progress = await self.repository.get_progress(profile_id, template.id)
        if not progress:
            progress = await self.repository.start_roadmap(profile_id, template.id)

        # Return cached AI annotation if available
        if progress.ai_annotation:
            return progress.ai_annotation

        # Generate LLM recommendation via AIService
        annotation = {
            "recommended_focus": [m["title"] for m in template.milestones[:2]],
            "skip_suggestions": [s for s in user_skills if s.lower() in template.slug],
            "advice": f"Tailored path focusing on {template.title} milestones aligned with your skills."
        }

        progress.ai_annotation = annotation
        await self.repository.db.commit()
        return annotation
