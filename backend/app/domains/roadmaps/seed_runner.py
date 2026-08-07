import logging
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.domains.roadmaps.models import RoadmapTemplate
from app.domains.roadmaps.seed_data import SEED_ROADMAPS

logger = logging.getLogger("devfolio.roadmaps_seed")

async def run_roadmap_seed():
    """
    Idempotent standalone seed runner that upserts 14 curated learning roadmaps by slug.
    """
    logger.info("Executing roadmap seed runner...")
    async with AsyncSessionLocal() as db:
        for data in SEED_ROADMAPS:
            res = await db.execute(select(RoadmapTemplate).where(RoadmapTemplate.slug == data["slug"]))
            existing = res.scalars().first()
            if not existing:
                template = RoadmapTemplate(
                    slug=data["slug"],
                    title=data["title"],
                    category=data["category"],
                    description=data["description"],
                    milestones=data["milestones"]
                )
                db.add(template)
            else:
                existing.title = data["title"]
                existing.category = data["category"]
                existing.description = data["description"]
                existing.milestones = data["milestones"]
        await db.commit()
    logger.info("Roadmap seed execution complete.")
