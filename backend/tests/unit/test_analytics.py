import pytest
from app.domains.analytics.models import hash_ip_address

def test_ip_hashing_privacy():
    raw_ip = "192.168.1.50"
    hashed = hash_ip_address(raw_ip)

    # Must produce 64-char SHA-256 string
    assert len(hashed) == 64
    assert hashed != raw_ip

    # Must be deterministic for same IP
    assert hash_ip_address(raw_ip) == hashed
    assert hash_ip_address("10.0.0.1") != hashed

def test_empty_ip_hashing():
    assert hash_ip_address("") == ""
