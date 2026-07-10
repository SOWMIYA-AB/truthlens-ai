from datetime import timedelta

import jwt
from bson import ObjectId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    generate_secure_token,
    hash_password,
    hash_token,
    normalize_expiry,
    utc_now,
    verify_password,
)
from app.db.mongodb import get_database
from app.modules.auth.schemas import SignupRequest, UserPublic


def serialize_user(user: dict) -> UserPublic:
    return UserPublic(
        id=str(user["_id"]),
        fullName=user["fullName"],
        email=user["email"],
        role=user["role"],
        status=user["status"],
        emailVerified=user["emailVerified"],
        createdAt=user["createdAt"].isoformat(),
        updatedAt=user["updatedAt"].isoformat(),
    )


async def get_user_by_email(email: str) -> dict | None:
    database = get_database()
    return await database.users.find_one({"email": email.lower()})


async def get_user_by_id(user_id: str) -> dict | None:
    if not ObjectId.is_valid(user_id):
        return None

    database = get_database()
    return await database.users.find_one({"_id": ObjectId(user_id)})


async def create_user(payload: SignupRequest) -> tuple[dict, str]:
    database = get_database()
    now = utc_now()
    verification_token = generate_secure_token()

    user = {
        "fullName": payload.fullName.strip(),
        "email": payload.email.lower(),
        "passwordHash": hash_password(payload.password),
        "role": "user",
        "status": "active",
        "emailVerified": False,
        "emailVerificationTokenHash": hash_token(verification_token),
        "emailVerificationExpiresAt": now + timedelta(minutes=settings.email_token_minutes),
        "passwordResetTokenHash": None,
        "passwordResetExpiresAt": None,
        "refreshTokens": [],
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        result = await database.users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from exc

    user["_id"] = result.inserted_id
    return user, verification_token


async def issue_token_pair(user: dict) -> dict:
    database = get_database()
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, user["role"])
    refresh_token, refresh_expires_at = create_refresh_token(user_id)
    refresh_token_hash = hash_token(refresh_token)

    await database.users.update_one(
        {"_id": user["_id"]},
        {
            "$push": {
                "refreshTokens": {
                    "tokenHash": refresh_token_hash,
                    "expiresAt": refresh_expires_at,
                    "createdAt": utc_now(),
                    "revokedAt": None,
                }
            },
            "$set": {"updatedAt": utc_now()},
        },
    )

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "tokenType": "bearer",
    }


async def authenticate_user(email: str, password: str) -> dict:
    user = await get_user_by_email(email)
    if user is None or not verify_password(password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not active",
        )

    return user


async def refresh_tokens(refresh_token: str) -> dict:
    try:
        payload = decode_refresh_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await get_user_by_id(payload["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_hash = hash_token(refresh_token)
    matching_token = next(
        (
            item
            for item in user.get("refreshTokens", [])
            if item["tokenHash"] == token_hash and item.get("revokedAt") is None
        ),
        None,
    )

    if matching_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token was revoked")

    if normalize_expiry(matching_token["expiresAt"]) <= utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    database = get_database()
    await database.users.update_one(
        {"_id": user["_id"], "refreshTokens.tokenHash": token_hash},
        {"$set": {"refreshTokens.$.revokedAt": utc_now(), "updatedAt": utc_now()}},
    )

    updated_user = await get_user_by_id(str(user["_id"]))
    return await issue_token_pair(updated_user)


async def revoke_refresh_token(refresh_token: str) -> None:
    try:
        payload = decode_refresh_token(refresh_token)
    except jwt.PyJWTError:
        return

    if payload.get("type") != "refresh":
        return

    user = await get_user_by_id(payload["sub"])
    if user is None:
        return

    database = get_database()
    await database.users.update_one(
        {"_id": user["_id"], "refreshTokens.tokenHash": hash_token(refresh_token)},
        {"$set": {"refreshTokens.$.revokedAt": utc_now(), "updatedAt": utc_now()}},
    )


async def verify_email_token(token: str) -> None:
    database = get_database()
    user = await database.users.find_one({"emailVerificationTokenHash": hash_token(token)})

    if user is None or user.get("emailVerificationExpiresAt") is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

    if normalize_expiry(user["emailVerificationExpiresAt"]) <= utc_now():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token expired")

    await database.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "emailVerified": True,
                "emailVerificationTokenHash": None,
                "emailVerificationExpiresAt": None,
                "updatedAt": utc_now(),
            }
        },
    )


async def create_password_reset(email: str) -> str | None:
    database = get_database()
    user = await get_user_by_email(email)
    if user is None:
        return None

    reset_token = generate_secure_token()
    await database.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "passwordResetTokenHash": hash_token(reset_token),
                "passwordResetExpiresAt": utc_now() + timedelta(minutes=settings.password_reset_minutes),
                "updatedAt": utc_now(),
            }
        },
    )
    return reset_token


async def reset_password(token: str, password: str) -> None:
    database = get_database()
    user = await database.users.find_one({"passwordResetTokenHash": hash_token(token)})

    if user is None or user.get("passwordResetExpiresAt") is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    if normalize_expiry(user["passwordResetExpiresAt"]) <= utc_now():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token expired")

    await database.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "passwordHash": hash_password(password),
                "passwordResetTokenHash": None,
                "passwordResetExpiresAt": None,
                "refreshTokens": [],
                "updatedAt": utc_now(),
            }
        },
    )

