import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from app.core.database import Base
# Import all models here so Alembic can discover them
from app.domains.users.models import User
from app.domains.profiles.models import Profile, SocialLink, Follow, ProfileView
from app.domains.github.models import GitHubAccount, RepositoryModel
from app.domains.portfolio.models import PortfolioConfig, Project, Experience, Education, Skill, Certification, Achievement, PortfolioView as PView
from app.domains.platforms.models import CodingProfile, CodeforcesStats, LeetCodeStats, CodeChefStats
from app.domains.leaderboard.models import LeaderboardEntry, Badge, UserBadge
from app.domains.social.models import FriendRequest
from app.domains.notifications.models import Notification
from app.domains.jobs.models import JobApplication, JobStatusHistory, Interview
from app.domains.analytics.models import AnalyticsEvent, AnalyticsDailySummary
from app.domains.feed.models import Post, Comment, PostLike, Bookmark, TrendingProject
from app.domains.admin.models import AdminAuditLog, UserReport
from app.domains.resumes.models import ResumeVersion
from app.domains.ai.models import AIConversation, AIMessage
from app.domains.roadmaps.models import RoadmapTemplate, RoadmapProgress
target_metadata = Base.metadata

from app.core.config import settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
