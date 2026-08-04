from fastapi import HTTPException
from app.domains.ai.repository import AIChatRepository
from app.domains.ai.schemas import ChatCreate, MessageCreate

class AIService:
    def __init__(self, repo: AIChatRepository):
        self.repo = repo

    async def create_chat(self, user_id: str, data: ChatCreate):
        return await self.repo.create_chat(user_id, data.title, data.topic)

    async def get_user_chats(self, user_id: str):
        return await self.repo.get_user_chats(user_id)

    async def get_chat_history(self, user_id: str, chat_id: str):
        chat = await self.repo.get_chat(chat_id)
        if not chat or str(chat.user_id) != user_id:
            raise HTTPException(status_code=404, detail="Chat not found")
        # Ensure messages are sorted by creation
        chat.messages = sorted(chat.messages, key=lambda m: m.created_at)
        return chat

    async def send_message(self, user_id: str, chat_id: str, data: MessageCreate):
        chat = await self.repo.get_chat(chat_id)
        if not chat or str(chat.user_id) != user_id:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        # 1. Save user message
        user_msg = await self.repo.add_message(chat_id, "user", data.content)
        
        # 2. Call actual LLM (Placeholder for Gemini API)
        # In production, we'd pass the full chat history to the LLM here.
        ai_response_text = f"This is an AI response to your message: '{data.content}'."
        
        # 3. Save AI response
        ai_msg = await self.repo.add_message(chat_id, "ai", ai_response_text)
        
        return ai_msg
