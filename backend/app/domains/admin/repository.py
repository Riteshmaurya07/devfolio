from typing import Optional, List, Tuple, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.domains.users.models import User
from app.domains.feed.models import Post, Comment
from app.domains.admin.models import AdminAuditLog, UserReport

class AdminRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user_report(self, reporter_id: UUID, target_type: str, target_id: UUID, reason: str) -> UserReport:
        report = UserReport(
            reporter_id=reporter_id,
            target_type=target_type,
            target_id=target_id,
            reason=reason
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def log_audit_action(self, admin_id: UUID, action_type: str, target_id: UUID, reason: Optional[str], ip_address: Optional[str] = None) -> AdminAuditLog:
        log = AdminAuditLog(
            admin_id=admin_id,
            action_type=action_type,
            target_id=target_id,
            reason=reason,
            ip_address=ip_address
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_users_paginated(self, page: int = 1, page_size: int = 20, search: Optional[str] = None) -> Tuple[List[User], int]:
        query = select(User)
        if search:
            query = query.where((User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))

        offset = (page - 1) * page_size
        res = await self.db.execute(query.order_by(User.created_at.desc()).offset(offset).limit(page_size))
        users = res.scalars().all()

        count_q = text("SELECT COUNT(*) FROM users")
        total = (await self.db.execute(count_q)).scalar() or 0
        return users, total

    async def toggle_user_suspension(self, user_id: UUID, is_suspended: bool) -> Optional[User]:
        res = await self.db.execute(select(User).where(User.id == user_id))
        user = res.scalars().first()
        if user:
            user.is_suspended = is_suspended
            await self.db.commit()
            await self.db.refresh(user)
        return user

    async def soft_delete_post(self, post_id: UUID) -> Optional[Post]:
        res = await self.db.execute(select(Post).where(Post.id == post_id))
        post = res.scalars().first()
        if post:
            post.is_deleted = True
            await self.db.commit()
            await self.db.refresh(post)
        return post

    async def soft_delete_comment(self, comment_id: UUID) -> Optional[Comment]:
        res = await self.db.execute(select(Comment).where(Comment.id == comment_id))
        comment = res.scalars().first()
        if comment:
            comment.is_deleted = True
            await self.db.commit()
            await self.db.refresh(comment)
        return comment

    async def get_user_reports(self, status: str = "pending") -> List[UserReport]:
        res = await self.db.execute(select(UserReport).where(UserReport.status == status).order_by(UserReport.created_at.desc()))
        return res.scalars().all()

    async def update_report_status(self, report_id: UUID, status: str) -> Optional[UserReport]:
        res = await self.db.execute(select(UserReport).where(UserReport.id == report_id))
        report = res.scalars().first()
        if report:
            report.status = status
            await self.db.commit()
            await self.db.refresh(report)
        return report

    async def get_audit_logs(self, limit: int = 50) -> List[AdminAuditLog]:
        res = await self.db.execute(select(AdminAuditLog).order_by(AdminAuditLog.timestamp.desc()).limit(limit))
        return res.scalars().all()

    async def get_platform_analytics(self) -> Dict[str, Any]:
        total_users = (await self.db.execute(text("SELECT COUNT(*) FROM users"))).scalar() or 0
        total_posts = (await self.db.execute(text("SELECT COUNT(*) FROM posts"))).scalar() or 0
        total_applications = (await self.db.execute(text("SELECT COUNT(*) FROM job_applications"))).scalar() or 0
        total_views = (await self.db.execute(text("SELECT COUNT(*) FROM analytics_events"))).scalar() or 0
        active_roadmaps = (await self.db.execute(text("SELECT COUNT(*) FROM roadmap_progress"))).scalar() or 0

        return {
            "total_users": total_users,
            "total_posts": total_posts,
            "total_applications": total_applications,
            "total_views": total_views,
            "active_roadmaps": active_roadmaps
        }
