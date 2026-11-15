import asyncio
from app.core.database import AsyncSessionLocal
from app.domains.users.repository import UserRepository
from app.domains.users.schemas import UserCreate
import bcrypt

async def seed_users_cli():
    """CLI script to seed or reset both admin and regular developer users."""
    async with AsyncSessionLocal() as session:
        repo = UserRepository(session)
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw("password123".encode('utf-8'), salt).decode('utf-8')

        # 1. Seed or Reset Admin User
        existing_admin = await repo.get_by_email("admin@devfolio.com")
        admin_id = None
        if existing_admin:
            existing_admin.hashed_password = hashed_password
            existing_admin.is_admin = True
            existing_admin.is_onboarded = True
            await session.commit()
            admin_id = existing_admin.id
            print(f"Admin user updated (email: {existing_admin.email}, password: password123)")
        else:
            admin_user = await repo.create(UserCreate(
                username="admin",
                email="admin@devfolio.com",
                password="password123"
            ))
            admin_user.is_admin = True
            admin_user.is_onboarded = True
            await session.commit()
            admin_id = admin_user.id
            print(f"Admin user created (email: {admin_user.email}, password: password123)")

        # Ensure Admin profile
        if admin_id:
            from app.domains.profiles.repository import ProfileRepository
            from app.domains.profiles.schemas import ProfileCreate
            p_repo = ProfileRepository(session)
            if not await p_repo.get_by_user_id(admin_id):
                await p_repo.create(admin_id, ProfileCreate(name="Admin", username="admin", email="admin@devfolio.com"))
                print("Admin profile created.")

        # 2. Seed or Reset Regular User
        existing_user = await repo.get_by_email("user@devfolio.com")
        dev_id = None
        if existing_user:
            existing_user.hashed_password = hashed_password
            existing_user.is_admin = False
            existing_user.is_onboarded = True
            await session.commit()
            dev_id = existing_user.id
            print(f"Regular user updated (email: {existing_user.email}, password: password123)")
        else:
            reg_user = await repo.create(UserCreate(
                username="developer",
                email="user@devfolio.com",
                password="password123"
            ))
            reg_user.is_admin = False
            reg_user.is_onboarded = True
            await session.commit()
            dev_id = reg_user.id
            print(f"Regular user created (email: {reg_user.email}, password: password123)")

        # Ensure Developer profile
        if dev_id:
            from app.domains.profiles.repository import ProfileRepository
            from app.domains.profiles.schemas import ProfileCreate
            p_repo = ProfileRepository(session)
            if not await p_repo.get_by_user_id(dev_id):
                await p_repo.create(dev_id, ProfileCreate(name="Developer", username="developer", email="user@devfolio.com"))
                print("Developer profile created.")

if __name__ == "__main__":
    asyncio.run(seed_users_cli())
