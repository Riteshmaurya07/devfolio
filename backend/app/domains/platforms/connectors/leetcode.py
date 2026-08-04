from typing import Dict, Any
import httpx
from app.domains.platforms.connectors.base import PlatformConnector

class LeetCodeConnector(PlatformConnector):
    @property
    def platform_name(self) -> str:
        return "leetcode"

    async def fetch_stats(self, username: str) -> Dict[str, Any]:
        # LeetCode uses a GraphQL endpoint
        query = """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                submitStats: submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
        """
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://leetcode.com/graphql",
                json={"query": query, "variables": {"username": username}}
            )
            resp.raise_for_status()
            return resp.json()

    def parse_metrics(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            stats = raw_data["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]
            total_solved = next((item["count"] for item in stats if item["difficulty"] == "All"), 0)
        except (KeyError, TypeError):
            total_solved = 0
            
        return {
            "total_problems_solved": total_solved
        }
