from typing import Dict, Any
import httpx
from app.domains.platforms.connectors.base import PlatformConnector

class GitHubConnector(PlatformConnector):
    @property
    def platform_name(self) -> str:
        return "github"

    async def fetch_stats(self, username: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            user_resp = await client.get(f"https://api.github.com/users/{username}")
            user_resp.raise_for_status()
            user_data = user_resp.json()
            
            # Optionally fetch repos to get total stars (omitted for brevity, just an example)
            # In a real scenario, handle pagination and rate limits
            return {"user": user_data, "repos": []}

    def parse_metrics(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        user_data = raw_data.get("user", {})
        return {
            "public_repos": user_data.get("public_repos", 0),
            "followers": user_data.get("followers", 0),
            "total_stars": 0, # Placeholder
        }
