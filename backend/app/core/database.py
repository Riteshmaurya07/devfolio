from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Lazy synchronous session for Celery tasks
# Only initialized when actually called, avoiding import-time driver dependency
_sync_session_factory = None

def SessionLocal():
    """Returns a synchronous session for Celery tasks. Uses asyncpg connection pool under asyncio.run()."""
    global _sync_session_factory
    if _sync_session_factory is None:
        from sqlalchemy import create_engine
        _sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        try:
            sync_engine = create_engine(_sync_url, echo=False, future=True)
            _sync_session_factory = sessionmaker(bind=sync_engine, expire_on_commit=False)
        except Exception:
            # Fallback: use asyncpg URL stripped to basic postgresql
            _sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
            sync_engine = create_engine(_sync_url, echo=False, future=True)
            _sync_session_factory = sessionmaker(bind=sync_engine, expire_on_commit=False)
    return _sync_session_factory()

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
