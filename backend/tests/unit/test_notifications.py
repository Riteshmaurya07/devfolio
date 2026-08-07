import pytest
from uuid import uuid4
from pydantic import ValidationError
from app.domains.notifications.schemas import NotificationCreate

def test_action_url_relative_path_valid():
    """Verify that relative internal paths starting with '/' pass schema validation."""
    req = NotificationCreate(
        user_id=uuid4(),
        category="interview",
        title="Test Title",
        message="Test message",
        payload={"action_url": "/job-tracker"}
    )
    assert req.payload["action_url"] == "/job-tracker"

def test_action_url_absolute_path_invalid():
    """Verify that absolute external URLs fail validation to prevent open-redirect vulnerabilities."""
    with pytest.raises(ValidationError):
        NotificationCreate(
            user_id=uuid4(),
            category="interview",
            title="Test Title",
            message="Test message",
            payload={"action_url": "https://malicious-site.com/login"}
        )

def test_action_url_protocol_relative_invalid():
    """Verify protocol-relative URLs starting with '//' are rejected."""
    with pytest.raises(ValidationError):
        NotificationCreate(
            user_id=uuid4(),
            category="interview",
            title="Test Title",
            message="Test message",
            payload={"action_url": "//malicious-site.com"}
        )
