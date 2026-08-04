from fastapi import APIRouter, Depends
from app.domains.platforms.schemas import ConnectAccountRequest, ConnectedAccountResponse, SyncAccountResponse
from app.domains.platforms.service import PlatformService
from app.api.dependencies import get_platform_service, get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/platforms", tags=["platforms"])

@router.post("/connect", response_model=ConnectedAccountResponse)
async def connect_account(
    req: ConnectAccountRequest,
    current_user: User = Depends(get_current_user),
    service: PlatformService = Depends(get_platform_service)
):
    return await service.connect_account(str(current_user.id), req.platform_name, req.username)

@router.post("/sync/{account_id}", response_model=SyncAccountResponse)
async def sync_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    service: PlatformService = Depends(get_platform_service)
):
    return await service.trigger_sync(account_id, str(current_user.id))
