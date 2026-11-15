import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID
import httpx
from sqlalchemy.future import select
from app.domains.profiles.models import Profile
from app.domains.github.repository import GitHubRepository
from app.domains.github.client import GitHubClient
from app.domains.github.health_score import calculate_repo_health_score
from app.domains.github.models import GitHubAccount
from app.utils.crypto import decrypt_token
from app.core.exceptions import NotFoundError, DomainException
from app.core.config import settings

import secrets
import hmac
import hashlib
from datetime import datetime, timezone, timedelta

class GitHubService:
    def __init__(self, repository: GitHubRepository):
        self.repository = repository

    def generate_oauth_state(self, user_id: UUID) -> str:
        secret = settings.SECRET_KEY.encode('utf-8')
        message = f"github_oauth_{user_id}".encode('utf-8')
        signature = hmac.new(secret, message, hashlib.sha256).hexdigest()
        return f"{user_id}:{signature}"

    def verify_oauth_state(self, state: str, user_id: UUID) -> bool:
        try:
            expected_state = self.generate_oauth_state(user_id)
            return hmac.compare_digest(state, expected_state)
        except Exception:
            return False

    def extract_and_verify_user_id(self, state: str) -> Optional[UUID]:
        try:
            if not state or ":" not in state:
                return None
            user_id_str, _ = state.split(":", 1)
            user_id = UUID(user_id_str)
            if self.verify_oauth_state(state, user_id):
                return user_id
        except Exception:
            return None
        return None

    def get_oauth_url(self, user_id: UUID) -> str:
        client_id = getattr(settings, "GITHUB_CLIENT_ID", "").strip()
        if not client_id or client_id in ("dummy_github_client_id", "your_github_client_id_here"):
            raise DomainException(
                message="GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file.",
                status_code=400
            )
        state = self.generate_oauth_state(user_id)
        return f"https://github.com/login/oauth/authorize?client_id={client_id}&scope=read:user,repo&state={state}"

    async def exchange_code_for_token(self, code: str) -> str:
        client_id = getattr(settings, "GITHUB_CLIENT_ID", "").strip()
        client_secret = getattr(settings, "GITHUB_CLIENT_SECRET", "").strip()

        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={"client_id": client_id, "client_secret": client_secret, "code": code},
                timeout=10.0
            )
            data = res.json()
            if "access_token" not in data:
                error_msg = data.get("error_description", data.get("error", "GitHub authorization failed or code expired"))
                raise DomainException(message=f"GitHub OAuth error: {error_msg}", status_code=400)
            return data["access_token"]

    async def sync_github(self, profile_id: UUID, access_token: str, is_manual: bool = False) -> GitHubAccount:
        account = await self.repository.get_by_profile_id(profile_id)
        
        # Debounce rapid manual syncs to protect GitHub rate limits
        if is_manual and account and account.updated_at:
            now = datetime.now(timezone.utc)
            updated_at = account.updated_at if account.updated_at.tzinfo else account.updated_at.replace(tzinfo=timezone.utc)
            if (now - updated_at).total_seconds() < 15:
                return account

        client = GitHubClient(access_token)
        gh_user = await client.get_user_profile()
        gh_repos = await client.get_user_repos()

        username = gh_user.get("login")
        total_followers = gh_user.get("followers", 0)
        total_following = gh_user.get("following", 0)

        total_stars = 0
        languages_summary: Dict[str, int] = {}
        repos_data = []

        for repo in gh_repos[:20]:
            stars = repo.get("stargazers_count", 0)
            forks = repo.get("forks_count", 0)
            total_stars += stars
            lang = repo.get("language")
            if lang:
                languages_summary[lang] = languages_summary.get(lang, 0) + stars + 1

            pushed_at_str = repo.get("pushed_at")
            last_commit = datetime.fromisoformat(pushed_at_str.replace("Z", "+00:00")) if pushed_at_str else None

            has_readme = repo.get("has_wiki", True)
            has_tests = False

            score = calculate_repo_health_score(last_commit, has_readme, has_tests, stars, forks)

            repos_data.append({
                "repo_id": repo.get("id"),
                "name": repo.get("name"),
                "full_name": repo.get("full_name"),
                "description": repo.get("description"),
                "html_url": repo.get("html_url"),
                "stars_count": stars,
                "forks_count": forks,
                "language": lang,
                "is_pinned": repo.get("stargazers_count", 0) > 0,
                "has_readme": has_readme,
                "has_tests": has_tests,
                "health_score": score,
                "last_commit_at": last_commit
            })

        calendar = await client.get_contribution_calendar(username)
        if not calendar:
            calendar = {
                datetime.now(timezone.utc).strftime("%Y-%m-%d"): len(gh_repos)
            }

        account = await self.repository.save_account(
            profile_id=profile_id,
            github_username=username,
            token=access_token,
            total_stars=total_stars,
            total_followers=total_followers,
            total_following=total_following,
            contribution_calendar=calendar,
            languages_summary=languages_summary
        )

        # Upsert-and-Prune strategy (deletes missing/renamed repos)
        await self.repository.replace_repositories(account.id, repos_data)
        return await self.repository.get_by_profile_id(profile_id)

    async def get_stats_by_username(self, username: str) -> Optional[GitHubAccount]:
        account = await self.repository.get_by_username(username)
        if not account:
            # Also check if profile_id matches a profile with this Devfolio username
            res = await self.repository.db.execute(
                select(Profile).where(Profile.username == username)
            )
            profile = res.scalars().first()
            if profile:
                account = await self.repository.get_by_profile_id(profile.id)
        if not account:
            raise NotFoundError(message=f"GitHub account for @{username} not connected")
        return account
