from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from app.domains.github.models import GitHubAccount, RepositoryModel
from app.utils.crypto import encrypt_token

class GitHubRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_profile_id(self, profile_id: UUID) -> Optional[GitHubAccount]:
        res = await self.db.execute(
            select(GitHubAccount)
            .options(selectinload(GitHubAccount.repositories))
            .where(GitHubAccount.profile_id == profile_id)
        )
        return res.scalars().first()

    async def get_by_username(self, username: str) -> Optional[GitHubAccount]:
        res = await self.db.execute(
            select(GitHubAccount)
            .options(selectinload(GitHubAccount.repositories))
            .where(GitHubAccount.github_username == username)
        )
        return res.scalars().first()

    async def get_repo_by_id(self, repo_id: UUID) -> Optional[RepositoryModel]:
        res = await self.db.execute(
            select(RepositoryModel).where(RepositoryModel.id == repo_id)
        )
        return res.scalars().first()

    async def save_account(
        self,
        profile_id: UUID,
        github_username: str,
        token: str,
        total_stars: int,
        total_followers: int,
        total_following: int,
        contribution_calendar: dict,
        languages_summary: dict
    ) -> GitHubAccount:
        account = await self.get_by_profile_id(profile_id)
        encrypted = encrypt_token(token)

        if not account:
            account = GitHubAccount(
                profile_id=profile_id,
                encrypted_token=encrypted,
                github_username=github_username,
                total_stars=total_stars,
                total_followers=total_followers,
                total_following=total_following,
                contribution_calendar=contribution_calendar,
                languages_summary=languages_summary
            )
            self.db.add(account)
        else:
            account.encrypted_token = encrypted
            account.github_username = github_username
            account.total_stars = total_stars
            account.total_followers = total_followers
            account.total_following = total_following
            account.contribution_calendar = contribution_calendar
            account.languages_summary = languages_summary
            self.db.add(account)

        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def replace_repositories(self, github_account_id: UUID, repos_data: List[dict]):
        await self.db.execute(delete(RepositoryModel).where(RepositoryModel.github_account_id == github_account_id))
        
        new_repos = [
            RepositoryModel(github_account_id=github_account_id, **data)
            for data in repos_data
        ]
        self.db.add_all(new_repos)
        await self.db.commit()
