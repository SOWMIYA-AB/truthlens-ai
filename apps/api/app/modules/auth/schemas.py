from pydantic import BaseModel, EmailStr, Field, field_validator


class UserPublic(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    role: str
    status: str
    emailVerified: bool
    createdAt: str
    updatedAt: str


class SignupRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not any(char.isalpha() for char in value):
            raise ValueError("Password must include at least one letter")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must include at least one number")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenPair(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"


class AuthResponse(BaseModel):
    user: UserPublic
    tokens: TokenPair
    emailVerificationToken: str | None = None


class RefreshRequest(BaseModel):
    refreshToken: str = Field(min_length=20)


class RefreshResponse(BaseModel):
    tokens: TokenPair


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=20)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    resetToken: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not any(char.isalpha() for char in value):
            raise ValueError("Password must include at least one letter")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must include at least one number")
        return value


class MessageResponse(BaseModel):
    message: str

