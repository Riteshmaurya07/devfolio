from fastapi import FastAPI
from app.domains.health import router as health_router
from app.domains.users.router import router as users_router
from app.domains.platforms.router import router as platforms_router
from app.domains.leaderboard.router import router as leaderboard_router
from app.domains.social.router import router as social_router
from app.domains.notifications.router import router as notifications_router
from app.domains.resumes.router import router as resumes_router
from app.domains.ai.router import router as ai_router
from app.domains.roadmaps.router import router as roadmaps_router

from app.middleware.error_handler import ExceptionAndCorrelationMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Devfolio OS API",
    description="Multi-user SaaS platform for developers",
    version="1.0.0"
)

app.add_middleware(ExceptionAndCorrelationMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.domains.profiles.router import router as profiles_router
from app.domains.github.router import router as github_router
from app.domains.portfolio.router import router as portfolio_router
from app.domains.resumes.router import router as resumes_router
from app.domains.roadmaps.router import router as roadmaps_router
from app.domains.ai.router import router as ai_router
from app.domains.jobs.router import router as jobs_router
from app.domains.analytics.router import router as analytics_router
from app.domains.feed.router import router as feed_router
from app.domains.admin.router import router as admin_router
from app.domains.roadmaps.seed_runner import run_roadmap_seed
from app.domains.admin.seed_admin import seed_admin_user

@app.on_event("startup")
async def on_startup():
    try:
        await run_roadmap_seed()
        await seed_admin_user()
    except Exception as e:
        print(f"Startup seed error: {e}")

app.include_router(health_router.router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(profiles_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(portfolio_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(roadmaps_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(feed_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(platforms_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Devfolio OS API"}
