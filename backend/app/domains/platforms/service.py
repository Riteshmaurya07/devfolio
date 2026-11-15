from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
import logging
from app.domains.platforms.repository import CodingProfileRepository
from app.domains.platforms.models import CodingProfile
from app.domains.platforms.clients.codeforces import CodeforcesClient
from app.domains.platforms.clients.leetcode import LeetCodeClient
from app.domains.platforms.clients.codechef import CodeChefClient
from app.domains.platforms.clients.geeksforgeeks import GeeksforGeeksClient
from app.domains.platforms.weak_area_detector import detect_weak_areas
from app.domains.ai.service import AIService
from app.core.exceptions import ValidationError, NotFoundError

logger = logging.getLogger("devfolio.coding_service")

SYNC_COOLDOWN_SECONDS = 60

class CodingDashboardService:
    def __init__(self, repository: CodingProfileRepository):
        self.repository = repository
        self.codeforces_client = CodeforcesClient()
        self.leetcode_client = LeetCodeClient()
        self.codechef_client = CodeChefClient()
        self.gfg_client = GeeksforGeeksClient()

    async def sync_platform_stats(self, cp: CodingProfile) -> None:
        """Fetches latest external statistics and upserts into database."""
        try:
            if cp.platform == "leetcode":
                stats_data = await self.leetcode_client.fetch_user_info(cp.external_username)
                await self.repository.upsert_leetcode_stats(cp.id, stats_data)
            elif cp.platform == "codeforces":
                stats_data = await self.codeforces_client.fetch_user_info(cp.external_username)
                await self.repository.upsert_codeforces_stats(cp.id, stats_data)
            elif cp.platform == "codechef":
                stats_data = await self.codechef_client.fetch_user_info(cp.external_username)
                await self.repository.upsert_codechef_stats(cp.id, stats_data)
            elif cp.platform == "geeksforgeeks":
                stats_data = await self.gfg_client.fetch_user_info(cp.external_username)
                await self.repository.upsert_geeksforgeeks_stats(cp.id, stats_data)
            
            cp.sync_status = "ok"
            cp.sync_error_message = None
            cp.last_synced_at = datetime.utcnow()
            await self.repository.db.commit()
        except Exception as e:
            logger.error(f"Error syncing {cp.platform} stats for {cp.external_username}: {e}", exc_info=True)
            cp.sync_status = "error"
            cp.sync_error_message = str(e)
            await self.repository.db.commit()

    async def connect_platform(self, profile_id: UUID, platform: str, external_username: str) -> CodingProfile:
        platform = platform.lower()
        if platform not in ["codeforces", "leetcode", "codechef", "geeksforgeeks"]:
            raise ValidationError(message=f"Unsupported platform '{platform}'.")

        # 1. Connect-Time Immediate Username Verification
        if platform == "codeforces":
            valid = await self.codeforces_client.verify_username(external_username)
            if not valid:
                raise ValidationError(message=f"Codeforces user '{external_username}' not found.")
        elif platform == "leetcode":
            valid = await self.leetcode_client.verify_username(external_username)
            if not valid:
                raise ValidationError(message=f"LeetCode user '{external_username}' not found.")
        elif platform == "codechef":
            valid = await self.codechef_client.verify_username(external_username)
            if not valid:
                raise ValidationError(message=f"CodeChef user '{external_username}' not found.")
        elif platform == "geeksforgeeks":
            valid = await self.gfg_client.verify_username(external_username)
            if not valid:
                raise ValidationError(message=f"GeeksforGeeks user '{external_username}' not found.")

        # 2. Upsert profile linkage
        cp = await self.repository.upsert_coding_profile(profile_id, platform, external_username)

        # 3. Synchronously fetch and store stats immediately
        await self.sync_platform_stats(cp)
        await self.repository.db.refresh(cp)
        return cp

    async def trigger_manual_sync(self, profile_id: UUID, platform: str) -> CodingProfile:
        cp = await self.repository.get_by_profile_and_platform(profile_id, platform)
        if not cp:
            raise NotFoundError(message=f"Platform '{platform}' is not connected.")

        # Check if existing stats exist
        existing_stats = None
        if cp.platform == "leetcode":
            existing_stats = await self.repository.get_leetcode_stats(cp.id)
        elif cp.platform == "codeforces":
            existing_stats = await self.repository.get_codeforces_stats(cp.id)
        elif cp.platform == "codechef":
            existing_stats = await self.repository.get_codechef_stats(cp.id)
        elif cp.platform == "geeksforgeeks":
            existing_stats = await self.repository.get_geeksforgeeks_stats(cp.id)

        # Cooldown guard: only apply if stats already exist and sync was within cooldown window
        if existing_stats and cp.last_synced_at and (datetime.utcnow() - cp.last_synced_at) < timedelta(seconds=SYNC_COOLDOWN_SECONDS):
            remaining = SYNC_COOLDOWN_SECONDS - int((datetime.utcnow() - cp.last_synced_at).total_seconds())
            raise ValidationError(message=f"Sync on cooldown. Please wait {remaining} seconds before syncing again.")

        # Execute sync
        await self.sync_platform_stats(cp)
        await self.repository.db.refresh(cp)
        return cp

    async def get_dashboard_summary(self, profile_id: UUID) -> Dict[str, Any]:
        profiles = await self.repository.get_all_by_profile_id(profile_id)
        combined_topic_analysis: Dict[str, Dict[str, int]] = {}
        combined_calendar: Dict[str, int] = {}
        total_solved = 0
        enriched_profiles = []

        for cp in profiles:
            stats = None
            if cp.platform == "codeforces":
                stats = await self.repository.get_codeforces_stats(cp.id)
            elif cp.platform == "leetcode":
                stats = await self.repository.get_leetcode_stats(cp.id)
            elif cp.platform == "codechef":
                stats = await self.repository.get_codechef_stats(cp.id)
            elif cp.platform == "geeksforgeeks":
                stats = await self.repository.get_geeksforgeeks_stats(cp.id)
            
            # If cp has no stats yet but is connected, attempt an inline sync
            if not stats and cp.external_username:
                await self.sync_platform_stats(cp)
                if cp.platform == "leetcode":
                    stats = await self.repository.get_leetcode_stats(cp.id)
                elif cp.platform == "codeforces":
                    stats = await self.repository.get_codeforces_stats(cp.id)
                elif cp.platform == "codechef":
                    stats = await self.repository.get_codechef_stats(cp.id)
                elif cp.platform == "geeksforgeeks":
                    stats = await self.repository.get_geeksforgeeks_stats(cp.id)

            stats_dict = None
            if stats:
                total_solved += getattr(stats, "total_solved", 0) or 0
                
                if hasattr(stats, "topic_analysis") and isinstance(stats.topic_analysis, dict):
                    for topic, topic_data in stats.topic_analysis.items():
                        if topic not in combined_topic_analysis:
                            combined_topic_analysis[topic] = {"solved": 0, "attempts": 0}
                        combined_topic_analysis[topic]["solved"] += topic_data.get("solved", 0)
                        combined_topic_analysis[topic]["attempts"] += topic_data.get("attempts", 0)

                if hasattr(stats, "submission_calendar") and isinstance(stats.submission_calendar, dict):
                    for ts, cnt in stats.submission_calendar.items():
                        try:
                            combined_calendar[str(ts)] = combined_calendar.get(str(ts), 0) + int(cnt)
                        except (ValueError, TypeError):
                            pass

                if cp.platform == "leetcode":
                    stats_dict = {
                        "total_solved": stats.total_solved,
                        "easy_solved": stats.easy_solved,
                        "medium_solved": stats.medium_solved,
                        "hard_solved": stats.hard_solved,
                        "acceptance_rate": stats.acceptance_rate,
                        "ranking": stats.ranking,
                    }
                elif cp.platform == "codeforces":
                    stats_dict = {
                        "total_solved": stats.total_solved,
                        "rating": stats.rating,
                        "max_rating": stats.max_rating,
                        "rank": stats.rank,
                        "max_rank": stats.max_rank,
                    }
                elif cp.platform == "codechef":
                    stats_dict = {
                        "total_solved": stats.total_solved,
                        "current_rating": stats.current_rating,
                        "highest_rating": stats.highest_rating,
                        "stars": stats.stars,
                    }
                elif cp.platform == "geeksforgeeks":
                    stats_dict = {
                        "total_solved": stats.total_solved,
                        "coding_score": stats.coding_score,
                        "institute_rank": stats.institute_rank,
                    }

            enriched_profiles.append({
                "id": str(cp.id),
                "profile_id": str(cp.profile_id),
                "platform": cp.platform,
                "external_username": cp.external_username,
                "sync_status": cp.sync_status,
                "sync_error_message": cp.sync_error_message,
                "last_synced_at": cp.last_synced_at.isoformat() if cp.last_synced_at else None,
                "stats": stats_dict
            })

        weak_areas = detect_weak_areas(combined_topic_analysis, min_attempts=5, solve_ratio_cutoff=0.5)

        return {
            "profiles": enriched_profiles,
            "total_solved": total_solved,
            "topic_analysis": combined_topic_analysis,
            "weak_areas": weak_areas,
            "submission_calendar": combined_calendar
        }

    async def get_ai_recommendations(self, profile_id: UUID, ai_service: AIService) -> Dict[str, Any]:
        profiles = await self.repository.get_all_by_profile_id(profile_id)
        if not profiles:
            raise NotFoundError(message="No coding profiles connected.")

        target_cp = profiles[0]
        if target_cp.ai_recommendation:
            return target_cp.ai_recommendation

        summary = await self.get_dashboard_summary(profile_id)
        weak_topics = [w["topic"] for w in summary.get("weak_areas", [])]

        rec = {
            "focus_topics": weak_topics if weak_topics else ["Dynamic Programming"],
            "suggested_problems": ["LeetCode #53 - Maximum Subarray", "Codeforces 1364A - Most Unstable Array"],
            "advice": "Focus on Dynamic Programming subproblem transitions before moving to Segment Trees."
        }

        target_cp.ai_recommendation = rec
        await self.repository.db.commit()
        return rec
