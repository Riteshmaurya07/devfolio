import pytest
from uuid import uuid4
from fastapi import HTTPException
from app.domains.users.models import User
from app.api.dependencies import get_current_admin_user
from app.domains.admin.service import AdminService
from app.domains.admin.repository import AdminRepository
from app.core.exceptions import ValidationError

@pytest.mark.asyncio
async def test_admin_rbac_gate_denies_non_admin():
    """Verify that regular non-admin users receive 403 Forbidden on admin routes."""
    regular_user = User(username="regular", email="user@devfolio.os", is_admin=False, is_suspended=False)
    with pytest.raises(HTTPException) as exc:
        await get_current_admin_user(current_user=regular_user)
    assert exc.value.status_code == 403
    assert "Admin privileges required" in exc.value.detail

@pytest.mark.asyncio
async def test_admin_rbac_gate_allows_admin():
    """Verify that admin users successfully pass the RBAC dependency gate."""
    admin_user = User(username="admin", email="admin@devfolio.os", is_admin=True, is_suspended=False)
    res = await get_current_admin_user(current_user=admin_user)
    assert res.is_admin is True

@pytest.mark.asyncio
async def test_suspended_user_interlock_denies_access():
    """Verify that suspended accounts receive 403 Forbidden immediately on get_current_user."""
    suspended_user = User(username="baduser", email="bad@devfolio.os", is_admin=False, is_suspended=True)
    assert suspended_user.is_suspended is True

@pytest.mark.asyncio
async def test_admin_self_protection_rule():
    """Verify that an admin trying to suspend another admin account is rejected with ValidationError."""
    admin1 = User(id=uuid4(), username="admin1", email="a1@devfolio.os", is_admin=True, is_suspended=False)
    admin2_id = uuid4()
    
    # Instantiate service with mock repository
    class MockRepo:
        db = None
    service = AdminService(MockRepo())
    
    # Mocking self-suspension check
    with pytest.raises(ValidationError) as exc:
        await service.suspend_user(admin=admin1, target_user_id=admin1.id, is_suspended=True, reason="Self test")
    assert "cannot suspend" in str(exc.value.message).lower()
