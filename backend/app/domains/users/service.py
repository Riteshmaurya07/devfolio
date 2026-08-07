from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from uuid import UUID
import jwt
import bcrypt
from app.domains.users.repository import UserRepository
from app.domains.users.schemas import UserCreate, LoginRequest, UserResponse
from app.domains.users.models import User
from app.core.config import settings
from app.core.exceptions import ConflictError, UnauthorizedError, NotFoundError
from app.utils.pagination import PageParams, PaginatedResponse

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    async def register_user(self, user_in: UserCreate) -> User:
        if await self.user_repo.get_by_email(user_in.email):
            raise ConflictError(message="Email already registered")
        if await self.user_repo.get_by_username(user_in.username):
            raise ConflictError(message="Username already taken")
        return await self.user_repo.create(user_in)

    async def authenticate_user(self, login_data: LoginRequest) -> User:
        user = await self.user_repo.get_by_email(login_data.email)
        if not user or not user.hashed_password:
            raise UnauthorizedError(message="Invalid credentials")
        if user.is_suspended:
            raise UnauthorizedError(message="Account suspended. Access denied.")
        if not self.verify_password(login_data.password, user.hashed_password):
            raise UnauthorizedError(message="Invalid credentials")
        return user

    async def get_user_by_id(self, user_id: UUID) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(message="User not found")
        return user

    async def list_users(self, params: PageParams) -> PaginatedResponse[UserResponse]:
        items, total = await self.user_repo.list_paginated(params)
        user_responses = [UserResponse.model_validate(u) for u in items]
        return PaginatedResponse.create(items=user_responses, total=total, params=params)
