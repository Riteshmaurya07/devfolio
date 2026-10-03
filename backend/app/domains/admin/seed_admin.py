import os
import logging
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

logger = logging.getLogger("devfolio.admin_seed")

async def seed_admin_user():
    """
    Startup task creating initial bootstrap admin account ONLY if no admin exists yet.
    Guarded check ensures the specific seed account exists and is an admin.
    """
    seed_email = os.getenv("ADMIN_SEED_EMAIL", "admin@devfolio.com")
    logger.info(f"Checking bootstrap status for {seed_email}...")

    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT id, is_admin FROM users WHERE email = :email"), {"email": seed_email})
        user_res = res.fetchone()
        
        if user_res:
            if not user_res.is_admin:
                await db.execute(text("UPDATE users SET is_admin = true WHERE id = :uid"), {"uid": user_res.id})
                await db.commit()
                logger.info(f"Promoted existing account {seed_email} to is_admin=True")
            else:
                logger.info(f"Admin account {seed_email} already exists and is an admin.")
        else:
            await db.execute(
                text("""
                    INSERT INTO users (id, username, email, hashed_password, auth_provider, is_email_verified, is_admin, is_suspended, preferences, created_at)
                    VALUES (gen_random_uuid(), 'admin', :email, '$2b$12$e5FdjfebAuPqbju8fVm7Ne.bNz.cP.WOvsBqxRTvMajklE1owMLv.', 'local', true, true, false, '{}'::jsonb, NOW())
                """),
                {"email": seed_email}
            )
            await db.commit()
            logger.info(f"Created initial bootstrap admin account: {seed_email}")
