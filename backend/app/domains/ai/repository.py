from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.domains.ai.models import AIConversation, AIMessage

class AIRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_conversations(self, profile_id: UUID) -> List[AIConversation]:
        res = await self.db.execute(
            select(AIConversation)
            .where(AIConversation.profile_id == profile_id)
            .order_by(AIConversation.updated_at.desc())
        )
        return res.scalars().all()

    async def get_conversation_by_id(self, conversation_id: UUID) -> Optional[AIConversation]:
        res = await self.db.execute(
            select(AIConversation).where(AIConversation.id == conversation_id)
        )
        return res.scalars().first()

    async def create_conversation(self, profile_id: UUID, title: str, mode: str, context_snapshot: dict) -> AIConversation:
        conv = AIConversation(
            profile_id=profile_id,
            title=title,
            mode=mode,
            context_snapshot=context_snapshot
        )
        self.db.add(conv)
        await self.db.commit()
        await self.db.refresh(conv)
        return conv

    async def get_messages(self, conversation_id: UUID) -> List[AIMessage]:
        res = await self.db.execute(
            select(AIMessage)
            .where(AIMessage.conversation_id == conversation_id)
            .order_by(AIMessage.created_at.asc())
        )
        return res.scalars().all()

    async def add_message(self, conversation_id: UUID, role: str, content: str, status: str = "complete") -> AIMessage:
        msg = AIMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
            status=status
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg
