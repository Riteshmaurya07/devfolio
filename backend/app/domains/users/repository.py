from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.domains.users.models import User
from app.domains.users.schemas import UserCreate
from app.utils.pagination import PageParams
from app.utils.query_builder import QueryBuilder
import bcrypt

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    async def list_paginated(
        self,
        params: PageParams,
        sort_by: Optional[str] = "created_at",
        order: str = "desc"
    ) -> Tuple[List[User], int]:
        # Count total
        count_stmt = select(func.count()).select_from(User)
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar() or 0

        # Query items
        stmt = select(User)
        stmt = QueryBuilder.apply_sort(stmt, User, sort_by=sort_by, order=order)
        stmt = stmt.offset(params.offset).limit(params.limit)

        res = await self.db.execute(stmt)
        items = list(res.scalars().all())

        return items, total

    async def create(self, user_in: UserCreate) -> User:
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user_in.password.encode('utf-8'), salt).decode('utf-8')
        db_user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=hashed_password,
            avatar_url=user_in.avatar_url,
            auth_provider="local"
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
