from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.domains.ai.models import AIChat, AIMessage

class AIChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_chat(self, user_id: str, title: str, topic: str) -> AIChat:
        chat = AIChat(user_id=user_id, title=title, topic=topic)
        self.db.add(chat)
        await self.db.commit()
        await self.db.refresh(chat)
        return chat

    async def add_message(self, chat_id: str, role: str, content: str) -> AIMessage:
        msg = AIMessage(chat_id=chat_id, role=role, content=content)
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def get_chat(self, chat_id: str) -> Optional[AIChat]:
        stmt = (
            select(AIChat)
            .where(AIChat.id == chat_id)
            .options(selectinload(AIChat.messages))
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_user_chats(self, user_id: str) -> List[AIChat]:
        stmt = (
            select(AIChat)
            .where(AIChat.user_id == user_id)
            .order_by(AIChat.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
