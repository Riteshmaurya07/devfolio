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

app = FastAPI(
    title="Devfolio OS API",
    description="Multi-user SaaS platform for developers",
    version="1.0.0"
)

app.include_router(health_router.router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(platforms_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(roadmaps_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Devfolio OS API"}
