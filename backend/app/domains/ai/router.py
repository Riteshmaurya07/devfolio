from fastapi import APIRouter, Depends
from typing import List
from app.domains.ai.schemas import ChatCreate, ChatResponse, MessageCreate, MessageResponse
from app.domains.ai.service import AIService
from app.api.dependencies import get_ai_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/ai/chats", tags=["ai"])

@router.post("/", response_model=ChatResponse)
async def create_chat(
    req: ChatCreate,
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    return await service.create_chat(str(current_user.id), req)

@router.get("/", response_model=List[ChatResponse])
async def list_chats(
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    return await service.get_user_chats(str(current_user.id))

@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    return await service.get_chat_history(str(current_user.id), chat_id)

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: str,
    req: MessageCreate,
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    return await service.send_message(str(current_user.id), chat_id, req)
