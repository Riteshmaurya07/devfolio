from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from app.domains.users.models import User
from app.api.dependencies import get_current_user
from app.domains.ai.schemas import (
    CreateConversationRequest, AIConversationResponse, AIMessageSchema, ChatStreamRequest
)
from app.domains.ai.repository import AIRepository
from app.domains.ai.service import AIService
from app.domains.profiles.repository import ProfileRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/ai", tags=["ai"])

def get_ai_service_with_repo(db = Depends(get_db)) -> AIService:
    return AIService(AIRepository(db))

@router.get("/conversations", response_model=List[AIConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service_with_repo),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        return []
    return await service.repository.get_all_conversations(profile.id)

@router.post("/conversations", response_model=AIConversationResponse)
async def create_conversation(
    request: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service_with_repo),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")

    snapshot = await service.build_context_snapshot_for_profile(profile, db)
    return await service.repository.create_conversation(
        profile_id=profile.id,
        title=request.title or "Career Advice Session",
        mode=request.mode or "career_advice",
        context_snapshot=snapshot
    )

@router.get("/conversations/{conversation_id}/messages", response_model=List[AIMessageSchema])
async def get_conversation_messages(
    conversation_id: UUID,
    service: AIService = Depends(get_ai_service_with_repo)
):
    return await service.repository.get_messages(conversation_id)

@router.post("/chat/stream")
async def chat_stream(
    request: ChatStreamRequest,
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service_with_repo),
    db = Depends(get_db)
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    if not profile:
        raise NotFoundError(message="User profile not found")

    # Enforce Rate Limit per user
    service.check_rate_limit(str(profile.id))

    return StreamingResponse(
        service.stream_chat_response(request.conversation_id, request.message, str(profile.id), db),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )
