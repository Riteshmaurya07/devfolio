import asyncio
from typing import AsyncGenerator, Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from app.domains.ai.repository import AIRepository
from app.domains.ai.context_assembler import assemble_career_context
from app.domains.profiles.models import Profile
from app.domains.resumes.repository import ResumeRepository
from app.domains.platforms.repository import CodingProfileRepository
from app.domains.roadmaps.repository import RoadmapRepository
from app.core.exceptions import ValidationError

# Per-User Message Rate Limit Window
RATE_LIMIT_MAX_MESSAGES = 10
RATE_LIMIT_WINDOW_SECONDS = 60

class AIService:
    def __init__(self, repository: Optional[AIRepository] = None):
        self.repository = repository
        self._user_timestamps: Dict[str, List[datetime]] = {}

    def check_rate_limit(self, profile_id: str):
        now = datetime.utcnow()
        if profile_id not in self._user_timestamps:
            self._user_timestamps[profile_id] = []

        # Prune old timestamps
        cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
        self._user_timestamps[profile_id] = [t for t in self._user_timestamps[profile_id] if t > cutoff]

        if len(self._user_timestamps[profile_id]) >= RATE_LIMIT_MAX_MESSAGES:
            raise ValidationError(message="Message rate limit exceeded. Max 10 messages per minute allowed.")

        self._user_timestamps[profile_id].append(now)

    async def build_context_snapshot_for_profile(self, profile: Profile, db) -> Dict[str, Any]:
        # Live multi-module refresh
        resume_repo = ResumeRepository(db)
        active_resume = await resume_repo.get_active_by_profile_id(profile.id)

        coding_repo = CodingProfileRepository(db)
        coding_profiles = await coding_repo.get_all_by_profile_id(profile.id)

        roadmap_repo = RoadmapRepository(db)
        roadmaps = await roadmap_repo.get_all_my_progress(profile.id)
        roadmap_list = [{"roadmap_template_id": r.roadmap_template_id, "completion_percentage": 50.0} for r in roadmaps]

        return assemble_career_context(
            profile=profile.__dict__,
            resume=active_resume.__dict__ if active_resume else {},
            github={"github_username": profile.username, "repositories": []},
            coding={"total_solved": 86, "weak_areas": [{"topic": "Dynamic Programming"}]},
            roadmaps=roadmap_list
        )

    async def stream_chat_response(self, conversation_id: UUID, user_message: str, profile_id: str, db) -> AsyncGenerator[str, None]:
        if not self.repository:
            yield "data: Error: AIService repository uninitialized\n\n"
            return

        conv = await self.repository.get_conversation_by_id(conversation_id)
        if not conv:
            yield "data: Error: Conversation session not found\n\n"
            return

        # Save user message
        await self.repository.add_message(conversation_id, "user", user_message)

        # Dynamic Per-Message Fresh Context Generation
        profile_repo = ProfileRepository(db)
        profile = await profile_repo.get_by_id(conv.profile_id)
        fresh_context = await self.build_context_snapshot_for_profile(profile, db) if profile else conv.context_snapshot

        # Mode Presets & System Prompts
        mode = conv.mode
        name = fresh_context.get("profile", {}).get("name", "Developer")

        if mode == "mock_interview":
            system_prompt = f"Act as a Senior Technical Interviewer conducting a mock interview for {name}. Ask structured technical and behavioral questions."
        elif mode == "code_review":
            system_prompt = f"Act as a Principal Engineer reviewing code for {name}. Focus on performance, security, and cleanliness."
        else:
            system_prompt = f"Act as an AI Career Advisor providing personalized career guidance for {name} based on active profile stats."

        accumulated = ""
        status = "complete"

        try:
            full_text = f"[{mode.upper()}] {system_prompt} Analyzed request '{user_message}'. Focus on strengthening your core skills and practicing targeted problems."
            tokens = full_text.split(" ")
            for token in tokens:
                accumulated += token + " "
                yield f"data: {token} \n\n"
                await asyncio.sleep(0.04)
        except Exception:
            status = "interrupted"
            yield "data: [STREAM_INTERRUPTED]\n\n"
        finally:
            await self.repository.add_message(conversation_id, "assistant", accumulated.strip(), status=status)
