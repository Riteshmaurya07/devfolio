import pytest
from app.domains.users.repository import UserRepository
from app.domains.users.schemas import UserCreate

@pytest.mark.asyncio
async def test_create_and_get_user(db_session):
    repo = UserRepository(db_session)
    user_in = UserCreate(
        username="test_repo_user",
        email="test_repo@example.com",
        password="secretpassword"
    )
    user = await repo.create(user_in)
    assert user.id is not None
    assert user.username == "test_repo_user"

    fetched = await repo.get_by_email("test_repo@example.com")
    assert fetched is not None
    assert fetched.id == user.id
