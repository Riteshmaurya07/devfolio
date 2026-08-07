import os
import logging
from sqlalchemy import text
from app.core.database import SessionLocal

logger = logging.getLogger("devfolio.admin_seed")

def seed_admin_user():
    """
    Startup task creating initial bootstrap admin account ONLY if no admin exists yet.
    Guarded by 'no admin exists yet' check to prevent account takeover or re-promotion on restart.
    """
    seed_email = os.getenv("ADMIN_SEED_EMAIL", "admin@devfolio.os")
    logger.info("Checking admin bootstrap status...")

    with SessionLocal() as db:
        # Check if any admin already exists in the system
        admin_res = db.execute(text("SELECT id FROM users WHERE is_admin = true LIMIT 1")).fetchone()
        if admin_res:
            logger.info("Admin account already exists. Skipping bootstrap seed.")
            return

        # No admin exists yet: create initial bootstrap admin account
        user_res = db.execute(text("SELECT id, is_admin FROM users WHERE email = :email"), {"email": seed_email}).fetchone()
        if user_res:
            db.execute(text("UPDATE users SET is_admin = true WHERE id = :uid"), {"uid": user_res.id})
            db.commit()
            logger.info(f"Promoted bootstrap account {seed_email} to is_admin=True")
        else:
            db.execute(
                text("""
                    INSERT INTO users (id, username, email, hashed_password, auth_provider, is_email_verified, is_admin, is_suspended, preferences, created_at)
                    VALUES (gen_random_uuid(), 'admin', :email, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', true, true, false, '{}'::jsonb, NOW())
                """),
                {"email": seed_email}
            )
            db.commit()
            logger.info(f"Created initial bootstrap admin account: {seed_email}")
