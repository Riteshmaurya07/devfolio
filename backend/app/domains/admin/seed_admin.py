import os
import logging
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

logger = logging.getLogger("devfolio.user_seed")

# Pre-computed bcrypt hash for 'password123'
DEFAULT_PASSWORD_HASH = "$2b$12$e5FdjfebAuPqbju8fVm7Ne.bNz.cP.WOvsBqxRTvMajklE1owMLv."

async def seed_users():
    """
    Startup task creating bootstrap accounts for:
    1. Admin User: admin@devfolio.com / password123 (is_admin=True)
    2. Regular User: user@devfolio.com / password123 (is_admin=False)
    """
    admin_email = os.getenv("ADMIN_SEED_EMAIL", "admin@devfolio.com")
    user_email = os.getenv("USER_SEED_EMAIL", "user@devfolio.com")

    logger.info("Checking bootstrap accounts...")

    async with AsyncSessionLocal() as db:
        # 1. Bootstrap Admin User
        admin_res = await db.execute(text("SELECT id, is_admin FROM users WHERE email = :email"), {"email": admin_email})
        admin_row = admin_res.fetchone()

        if admin_row:
            if not admin_row.is_admin:
                await db.execute(text("UPDATE users SET is_admin = true WHERE id = :uid"), {"uid": admin_row.id})
                await db.commit()
                logger.info(f"Promoted existing account {admin_email} to is_admin=True")
            else:
                logger.info(f"Admin account {admin_email} already exists and is verified.")
        else:
            admin_id = os.urandom(16)
            await db.execute(
                text("""
                    INSERT INTO users (id, username, email, hashed_password, auth_provider, is_email_verified, is_onboarded, is_admin, is_suspended, preferences, created_at)
                    VALUES (gen_random_uuid(), 'admin', :email, :password_hash, 'local', true, true, true, false, '{}'::jsonb, NOW())
                """),
                {"email": admin_email, "password_hash": DEFAULT_PASSWORD_HASH}
            )
            await db.commit()
            logger.info(f"Created initial bootstrap admin account: {admin_email}")

        # Ensure admin has a Profile record
        admin_u = (await db.execute(text("SELECT id, username, email FROM users WHERE email = :email"), {"email": admin_email})).fetchone()
        if admin_u:
            p_check = (await db.execute(text("SELECT id FROM profiles WHERE user_id = :uid"), {"uid": admin_u.id})).fetchone()
            if not p_check:
                await db.execute(
                    text("""
                        INSERT INTO profiles (id, user_id, name, username, email, visibility, followers_count, following_count, created_at)
                        VALUES (gen_random_uuid(), :uid, 'Admin', :username, :email, 'public', 0, 0, NOW())
                    """),
                    {"uid": admin_u.id, "username": admin_u.username, "email": admin_u.email}
                )
                await db.commit()
                logger.info(f"Created initial profile for admin: @{admin_u.username}")

        # 2. Bootstrap Standard Developer User
        user_res = await db.execute(text("SELECT id, is_admin FROM users WHERE email = :email"), {"email": user_email})
        user_row = user_res.fetchone()

        if user_row:
            logger.info(f"Regular test account {user_email} already exists.")
        else:
            await db.execute(
                text("""
                    INSERT INTO users (id, username, email, hashed_password, auth_provider, is_email_verified, is_onboarded, is_admin, is_suspended, preferences, created_at)
                    VALUES (gen_random_uuid(), 'developer', :email, :password_hash, 'local', true, true, false, false, '{}'::jsonb, NOW())
                """),
                {"email": user_email, "password_hash": DEFAULT_PASSWORD_HASH}
            )
            await db.commit()
            logger.info(f"Created initial bootstrap regular user account: {user_email}")

        # Ensure developer has a Profile record
        dev_u = (await db.execute(text("SELECT id, username, email FROM users WHERE email = :email"), {"email": user_email})).fetchone()
        if dev_u:
            p_check = (await db.execute(text("SELECT id FROM profiles WHERE user_id = :uid"), {"uid": dev_u.id})).fetchone()
            if not p_check:
                await db.execute(
                    text("""
                        INSERT INTO profiles (id, user_id, name, username, email, visibility, followers_count, following_count, created_at)
                        VALUES (gen_random_uuid(), :uid, 'Developer', :username, :email, 'public', 0, 0, NOW())
                    """),
                    {"uid": dev_u.id, "username": dev_u.username, "email": dev_u.email}
                )
                await db.commit()
                logger.info(f"Created initial profile for developer: @{dev_u.username}")


# Backward-compatible alias for existing imports
async def seed_admin_user():
    await seed_users()
