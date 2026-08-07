import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# Import all models so Base.metadata contains all tables for setup_test_db
from app.domains.users.models import User
from app.domains.profiles.models import Profile, SocialLink, Follow, ProfileView
from app.domains.github.models import GitHubAccount, RepositoryModel
from app.domains.portfolio.models import PortfolioConfig, Project, Experience, Education, Skill, Certification, Achievement, PortfolioView
from app.domains.resumes.models import ResumeVersion
from app.domains.roadmaps.models import RoadmapTemplate, RoadmapProgress
from app.domains.platforms.models import CodingProfile, CodeforcesStats, LeetCodeStats, CodeChefStats

TEST_DATABASE_URL = settings.DATABASE_URL.replace("devfolio_db", "devfolio_db_test")

engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool, echo=False)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

import asyncio

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()
        await session.close()

@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def _get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
