from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from app.core.database import get_db
from app.core.config import settings
from app.domains.users.repository import UserRepository
from app.domains.users.service import AuthService
from app.domains.users.models import User

from app.domains.platforms.repository import PlatformRepository
from app.domains.platforms.service import PlatformService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")

def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_auth_service(user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)

def get_platform_repo(db: AsyncSession = Depends(get_db)) -> PlatformRepository:
    return PlatformRepository(db)

def get_platform_service(repo: PlatformRepository = Depends(get_platform_repo)) -> PlatformService:
    return PlatformService(repo)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo: UserRepository = Depends(get_user_repo)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    # Since sub is stringified UUID in token, we can just query by id if we implement get_by_id in repo.
    # We will need to add `get_by_id` to UserRepository.
    # For now, let's assume `payload.get("email")` or we update repo.
    user_email = payload.get("email")
    if user_email is None:
        raise credentials_exception
        
    user = await user_repo.get_by_email(email=user_email)
    if user is None:
        raise credentials_exception
    return user
