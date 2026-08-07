import time
import httpx
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.exceptions import ValidationError, DomainException

logger = logging.getLogger("devfolio.github_client")

class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Devfolio-OS"
        }

    async def _request(self, method: str, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.BASE_URL}{path}" if path.startswith("/") else path
        async with httpx.AsyncClient() as client:
            res = await client.request(method, url, headers=self.headers, params=params, timeout=10.0)

            # Check Rate Limit Headers
            remaining = res.headers.get("X-RateLimit-Remaining")
            if res.status_code == 429 or (remaining is not None and int(remaining) == 0):
                reset_time = int(res.headers.get("X-RateLimit-Reset", time.time() + 60))
                retry_after = max(1, reset_time - int(time.time()))
                logger.warning(f"GitHub API Rate limit exceeded. Retry after {retry_after}s")
                raise DomainException(
                    message=f"GitHub API Rate Limit exceeded. Retry in {retry_after} seconds.",
                    code="RATE_LIMIT_EXCEEDED",
                    status_code=429,
                    details={"retry_after": retry_after}
                )

            if res.status_code != 200:
                logger.error(f"GitHub API Error [{res.status_code}]: {res.text}")
                raise DomainException(
                    message="Failed to communicate with GitHub API",
                    code="GITHUB_API_ERROR",
                    status_code=res.status_code
                )
            return res.json()

    async def get_user_profile(self) -> Dict[str, Any]:
        return await self._request("GET", "/user")

    async def get_user_repos(self) -> List[Dict[str, Any]]:
        return await self._request("GET", "/user/repos?per_page=100&sort=updated")

    async def get_repo_languages(self, owner: str, repo: str) -> Dict[str, int]:
        return await self._request("GET", f"/repos/{owner}/{repo}/languages")

    async def check_file_exists(self, owner: str, repo: str, filepath: str) -> bool:
        try:
            res = await self._request("GET", f"/repos/{owner}/{repo}/contents/{filepath}")
            return res is not None
        except Exception:
            return False

    async def get_readme(self, owner: str, repo: str) -> Optional[str]:
        try:
            res = await self._request("GET", f"/repos/{owner}/{repo}/readme")
            if res and "download_url" in res:
                async with httpx.AsyncClient() as client:
                    download_res = await client.get(res["download_url"], timeout=5.0)
                    if download_res.status_code == 200:
                        return download_res.text
            return None
        except Exception:
            return None
