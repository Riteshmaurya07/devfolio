import asyncio
from app.core.database import AsyncSessionLocal
from app.domains.users.repository import UserRepository
from app.domains.users.schemas import UserCreate

async def seed_admin():
    async with AsyncSessionLocal() as session:
        repo = UserRepository(session)
        user_in = UserCreate(
            username="admin",
            email="admin@devfolio.com",
            password="password123"
        )
        try:
            # Check if user already exists by username
            existing_user = await repo.get_by_username("admin")
            if existing_user:
                print(f"Admin user already exists with email: {existing_user.email}")
                # Update password
                import bcrypt
                salt = bcrypt.gensalt()
                hashed_password = bcrypt.hashpw("password123".encode('utf-8'), salt).decode('utf-8')
                existing_user.hashed_password = hashed_password
                existing_user.is_admin = True
                await session.commit()
                print("Password reset to 'password123' and made admin.")
                return
                
            user = await repo.create(user_in)
            user.is_admin = True
            await session.commit()
            print(f"Admin user created successfully with email: {user.email}")
        except Exception as e:
            print(f"Failed to create admin user: {e}")

if __name__ == "__main__":
    asyncio.run(seed_admin())
