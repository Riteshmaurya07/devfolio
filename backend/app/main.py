from fastapi import FastAPI
from app.domains.health import router as health_router
from app.domains.users.router import router as users_router
from app.domains.platforms.router import router as platforms_router

app = FastAPI(
    title="Devfolio OS API",
    description="Multi-user SaaS platform for developers",
    version="1.0.0"
)

app.include_router(health_router.router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(platforms_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Devfolio OS API"}
