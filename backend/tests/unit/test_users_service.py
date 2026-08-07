import pytest
from app.domains.users.repository import UserRepository
from app.domains.users.service import AuthService
from app.domains.users.schemas import UserCreate, LoginRequest
from app.core.exceptions import ConflictError, UnauthorizedError

@pytest.mark.asyncio
async def test_auth_service_register_and_authenticate(db_session):
    repo = UserRepository(db_session)
    service = AuthService(repo)

    user_in = UserCreate(
        username="service_user",
        email="service@example.com",
        password="password123"
    )
    user = await service.register_user(user_in)
    assert user.email == "service@example.com"

    # Test duplicate registration raises ConflictError
    with pytest.raises(ConflictError):
        await service.register_user(user_in)

    # Test authentication
    auth_user = await service.authenticate_user(
        LoginRequest(email="service@example.com", password="password123")
    )
    assert auth_user.id == user.id

    # Test invalid password raises UnauthorizedError
    with pytest.raises(UnauthorizedError):
        await service.authenticate_user(
            LoginRequest(email="service@example.com", password="wrongpassword")
        )
