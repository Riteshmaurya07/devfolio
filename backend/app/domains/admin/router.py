from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, Query, Request
from app.domains.users.models import User
from app.api.dependencies import get_current_user, get_current_admin_user
from app.domains.admin.schemas import (
    UserReportCreate, UserReportResponse, SuspendUserRequest, SoftDeleteRequest, ReportStatusUpdate, AdminAuditLogResponse
)
from app.domains.admin.repository import AdminRepository
from app.domains.admin.service import AdminService
from app.core.database import get_db

router = APIRouter(tags=["admin"])

def get_admin_service(db = Depends(get_db)) -> AdminService:
    return AdminService(AdminRepository(db))

# Public authenticated reporting endpoint
@router.post("/reports", response_model=UserReportResponse)
async def create_user_report(
    request: UserReportCreate,
    current_user: User = Depends(get_current_user),
    service: AdminService = Depends(get_admin_service)
):
    return await service.create_user_report(current_user.id, request.target_type, request.target_id, request.reason)

# Protected Admin Endpoints
@router.get("/admin/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    users, total = await service.repository.get_users_paginated(page, page_size, search)
    return {
        "users": [
            {
                "id": str(u.id),
                "username": u.username,
                "email": u.email,
                "is_admin": u.is_admin,
                "is_suspended": u.is_suspended,
                "created_at": u.created_at
            }
            for u in users
        ],
        "page": page,
        "page_size": page_size,
        "total_count": total
    }

@router.put("/admin/users/{user_id}/suspend")
async def suspend_user(
    user_id: UUID,
    request: SuspendUserRequest,
    req: Request,
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    ip_addr = req.client.host if req.client else "127.0.0.1"
    user = await service.suspend_user(admin, user_id, request.is_suspended, request.reason, ip_addr)
    return {"id": str(user.id), "is_suspended": user.is_suspended}

@router.get("/admin/analytics")
async def get_admin_analytics(
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    return await service.get_platform_analytics()

@router.put("/admin/moderation/posts/{post_id}/soft-delete")
async def soft_delete_post(
    post_id: UUID,
    request: SoftDeleteRequest,
    req: Request,
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    ip_addr = req.client.host if req.client else "127.0.0.1"
    post = await service.soft_delete_post(admin, post_id, request.reason, ip_addr)
    return {"id": str(post.id), "is_deleted": post.is_deleted}

@router.get("/admin/reports", response_model=List[UserReportResponse])
async def list_user_reports(
    status: str = Query("pending"),
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    return await service.repository.get_user_reports(status)

@router.put("/admin/reports/{report_id}/status", response_model=UserReportResponse)
async def update_report_status(
    report_id: UUID,
    request: ReportStatusUpdate,
    req: Request,
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    ip_addr = req.client.host if req.client else "127.0.0.1"
    return await service.resolve_report(admin, report_id, request.status, ip_addr)

@router.get("/admin/audit-logs", response_model=List[AdminAuditLogResponse])
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_current_admin_user),
    service: AdminService = Depends(get_admin_service)
):
    return await service.get_audit_logs(limit)
