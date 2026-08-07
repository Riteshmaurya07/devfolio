from typing import Optional, List, Dict, Any
from uuid import UUID
from app.domains.admin.repository import AdminRepository
from app.domains.users.models import User
from app.domains.admin.models import AdminAuditLog, UserReport
from app.domains.feed.models import Post, Comment
from app.core.exceptions import ValidationError, NotFoundError

class AdminService:
    def __init__(self, repository: AdminRepository):
        self.repository = repository

    async def create_user_report(self, reporter_id: UUID, target_type: str, target_id: UUID, reason: str) -> UserReport:
        return await self.repository.create_user_report(reporter_id, target_type, target_id, reason)

    async def suspend_user(self, admin: User, target_user_id: UUID, is_suspended: bool, reason: str, ip_address: Optional[str] = None) -> User:
        if admin.id == target_user_id:
            raise ValidationError(message="Admins cannot suspend their own account.")

        target_user = (await self.repository.db.execute(
            self.repository.db.select(User).where(User.id == target_user_id)
        )).scalars().first() if hasattr(self.repository.db, "select") else None

        # Protection Rule: Admins cannot suspend other admins via API
        if target_user and target_user.is_admin:
            raise ValidationError(message="Admins cannot suspend another admin account.")

        user = await self.repository.toggle_user_suspension(target_user_id, is_suspended)
        if not user:
            raise NotFoundError(message="Target user not found.")

        action = "suspend_user" if is_suspended else "unsuspend_user"
        await self.repository.log_audit_action(admin.id, action, target_user_id, reason, ip_address)
        return user

    async def soft_delete_post(self, admin: User, post_id: UUID, reason: str, ip_address: Optional[str] = None) -> Post:
        post = await self.repository.soft_delete_post(post_id)
        if not post:
            raise NotFoundError(message="Post not found.")

        await self.repository.log_audit_action(admin.id, "soft_delete_post", post_id, reason, ip_address)
        return post

    async def soft_delete_comment(self, admin: User, comment_id: UUID, reason: str, ip_address: Optional[str] = None) -> Comment:
        comment = await self.repository.soft_delete_comment(comment_id)
        if not comment:
            raise NotFoundError(message="Comment not found.")

        await self.repository.log_audit_action(admin.id, "soft_delete_comment", comment_id, reason, ip_address)
        return comment

    async def resolve_report(self, admin: User, report_id: UUID, status: str, ip_address: Optional[str] = None) -> UserReport:
        report = await self.repository.update_report_status(report_id, status)
        if not report:
            raise NotFoundError(message="Report not found.")

        await self.repository.log_audit_action(admin.id, f"report_{status}", report_id, f"Report status set to {status}", ip_address)
        return report

    async def get_platform_analytics(self) -> Dict[str, Any]:
        return await self.repository.get_platform_analytics()

    async def get_audit_logs(self, limit: int = 50) -> List[AdminAuditLog]:
        return await self.repository.get_audit_logs(limit)
