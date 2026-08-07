import os
import base64
import logging
from cryptography.fernet import Fernet
from app.core.config import settings

logger = logging.getLogger("devfolio.crypto")

def _get_fernet_key() -> bytes:
    # Environment Secret Provisioning
    key_str = os.getenv("ENCRYPTION_KEY", settings.SECRET_KEY)
    key = key_str.encode('utf-8')
    if len(key) < 32:
        key = key.ljust(32, b'0')
    else:
        key = key[:32]
    return base64.urlsafe_b64encode(key)

def encrypt_token(token: str) -> str:
    if not token:
        return ""
    f = Fernet(_get_fernet_key())
    return f.encrypt(token.encode('utf-8')).decode('utf-8')

def decrypt_token(encrypted_token: str) -> str:
    if not encrypted_token:
        return ""
    f = Fernet(_get_fernet_key())
    return f.decrypt(encrypted_token.encode('utf-8')).decode('utf-8')
