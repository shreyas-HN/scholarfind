import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150, description="Full name of student")
    email: EmailStr = Field(..., description="Valid student email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (at least 6 characters)")

    @field_validator("full_name")
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return cleaned

    @field_validator("email")
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserLogin(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email")
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    created_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered student email address")

    @field_validator("email")
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1, description="Password reset token")
    new_password: str = Field(..., min_length=6, max_length=128, description="New account password (at least 6 characters)")


class ForgotPasswordResponse(BaseModel):
    message: str
    email_sent: bool = False
    delivery_status: Optional[str] = None
    config_instructions: Optional[str] = None
    reset_link: Optional[str] = None

