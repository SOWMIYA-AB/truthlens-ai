from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import token_urlsafe
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.core.config import settings

password_hasher = PasswordHasher()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def generate_secure_token() -> str:
    return token_urlsafe(48)


def create_access_token(subject: str, role: str) -> str:
    expires_at = utc_now() + timedelta(minutes=settings.access_token_minutes)
    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "type": "access",
        "exp": expires_at,
        "iat": utc_now(),
    }
    return jwt.encode(payload, settings.jwt_access_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> tuple[str, datetime]:
    expires_at = utc_now() + timedelta(days=settings.refresh_token_days)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": "refresh",
        "exp": expires_at,
        "iat": utc_now(),
        "jti": generate_secure_token(),
    }
    token = jwt.encode(payload, settings.jwt_refresh_secret, algorithm=settings.jwt_algorithm)
    return token, expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_access_secret, algorithms=[settings.jwt_algorithm])


def decode_refresh_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_refresh_secret, algorithms=[settings.jwt_algorithm])


def normalize_expiry(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value

