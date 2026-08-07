import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(50), nullable=False)  # suspend_user, unsuspend_user, soft_delete_post, soft_delete_comment, resolve_report
    target_id = Column(UUID(as_uuid=True), nullable=False)
    reason = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type = Column(String(20), nullable=False)  # post, comment, user
    target_id = Column(UUID(as_uuid=True), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, resolved, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
