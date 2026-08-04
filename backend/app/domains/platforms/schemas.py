from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ConnectAccountRequest(BaseModel):
    platform_name: str
    username: str

class ConnectedAccountResponse(BaseModel):
    id: UUID
    platform_name: str
    platform_username: str
    last_synced_at: Optional[datetime]

    class Config:
        from_attributes = True

class SyncAccountResponse(BaseModel):
    status: str
