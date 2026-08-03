from fastapi import FastAPI
from app.domains.health import router as health_router

app = FastAPI(
    title="Devfolio OS API",
    description="Multi-user SaaS platform for developers",
    version="1.0.0"
)

app.include_router(health_router.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Devfolio OS API"}
