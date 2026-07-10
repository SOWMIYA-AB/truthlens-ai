from fastapi import APIRouter, Depends, status

from app.core.config import settings
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RefreshResponse,
    ResetPasswordRequest,
    SignupRequest,
    VerifyEmailRequest,
)
from app.modules.auth.service import (
    authenticate_user,
    create_password_reset,
    create_user,
    issue_token_pair,
    refresh_tokens,
    reset_password,
    revoke_refresh_token,
    serialize_user,
    verify_email_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    user, verification_token = await create_user(payload)
    tokens = await issue_token_pair(user)

    return AuthResponse(
        user=serialize_user(user),
        tokens=tokens,
        emailVerificationToken=verification_token if settings.app_env == "development" else None,
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    user = await authenticate_user(payload.email, payload.password)
    tokens = await issue_token_pair(user)

    return AuthResponse(user=serialize_user(user), tokens=tokens)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(payload: RefreshRequest):
    tokens = await refresh_tokens(payload.refreshToken)
    return RefreshResponse(tokens=tokens)


@router.post("/logout", response_model=MessageResponse)
async def logout(payload: RefreshRequest):
    await revoke_refresh_token(payload.refreshToken)
    return MessageResponse(message="Logged out successfully")


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(payload: VerifyEmailRequest):
    await verify_email_token(payload.token)
    return MessageResponse(message="Email verified successfully")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(payload: ForgotPasswordRequest):
    reset_token = await create_password_reset(payload.email)
    return ForgotPasswordResponse(
        message="If an account exists, password reset instructions have been prepared",
        resetToken=reset_token if settings.app_env == "development" else None,
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password_route(payload: ResetPasswordRequest):
    await reset_password(payload.token, payload.password)
    return MessageResponse(message="Password reset successfully")


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)

