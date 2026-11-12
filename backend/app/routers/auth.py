import os
import uuid
import secrets
import hashlib
import datetime
from typing import Tuple, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.app.models.user import User, RevokedToken
from backend.app.models.password_reset import PasswordResetToken
from backend.app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    AuthResponse,
    MessageResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ForgotPasswordResponse
)
from backend.app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    revoke_token
)
from backend.app.services.email_service import send_password_reset_email
from backend.app.dependencies.auth import (
    get_current_user,
    get_current_user_and_token,
    extract_token_from_request
)

router = APIRouter(prefix="", tags=["Authentication"])

COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


def set_auth_cookie(response: Response, token: str, is_secure: bool = False):
    """Set secure HttpOnly cookie for session token."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        expires=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        path="/"
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegister,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Register a new student account.
    - Validates email and name.
    - Rejects duplicate email registrations.
    - Hashes password with Argon2id.
    - Generates JWT and sets HttpOnly cookie.
    """
    clean_email = payload.email.lower().strip()
    
    # 1. Check if email already registered
    existing_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account already exists with this email address. Please log in instead."
        )

    # 2. Hash password securely using Argon2
    hashed_pwd = hash_password(payload.password)

    # 3. Create user record
    new_user = User(
        full_name=payload.full_name.strip(),
        email=clean_email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Generate JWT
    token, jti, expire = create_access_token(user_id=new_user.id, email=new_user.email)

    # 5. Set HttpOnly Cookie (secure if https)
    is_secure = request.url.scheme == "https"
    set_auth_cookie(response, token, is_secure=is_secure)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=AuthResponse)
def login(
    payload: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticate an existing student.
    - Verifies email existence.
    - Validates password against stored Argon2 hash.
    - Rejects incorrect credentials with 401.
    - Generates JWT and sets HttpOnly cookie.
    """
    clean_email = payload.email.lower().strip()

    # 1. Look up user by email
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 2. Verify Argon2 password hash
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 3. Generate JWT
    token, jti, expire = create_access_token(user_id=user.id, email=user.email)

    # 4. Set HttpOnly Cookie
    is_secure = request.url.scheme == "https"
    set_auth_cookie(response, token, is_secure=is_secure)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get profile of currently authenticated student.
    Returns 401 if unauthenticated, token expired, or token revoked.
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
def logout(
    response: Response,
    auth_data: Tuple[User, str, dict] = Depends(get_current_user_and_token),
    db: Session = Depends(get_db)
):
    """
    Log out student:
    - Revokes token server-side in RevokedToken table.
    - Deletes HttpOnly cookie.
    """
    user, raw_token, payload = auth_data
    jti = payload.get("jti")
    exp_ts = payload.get("exp")
    expires_at = datetime.datetime.utcfromtimestamp(exp_ts) if exp_ts else None

    # Server-side revocation
    if jti:
        revoke_token(
            db=db,
            jti=jti,
            user_id=user.id,
            expires_at=expires_at,
            raw_token=raw_token
        )

    # Clear HttpOnly Cookie
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax"
    )

    return MessageResponse(message="Successfully logged out.")


# ==================== FORGOT & RESET PASSWORD APIS ====================

_forgot_password_rate_limits = {}

def is_rate_limited(identifier: str, limit: int = 5, window_seconds: int = 900) -> bool:
    """Sliding window rate limiter: maximum 5 requests per 15 minutes per identifier/IP."""
    now = datetime.datetime.utcnow().timestamp()
    history = _forgot_password_rate_limits.get(identifier, [])
    history = [t for t in history if now - t < window_seconds]
    if len(history) >= limit:
        return True
    history.append(now)
    _forgot_password_rate_limits[identifier] = history
    return False


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Request password reset link.
    - Rate limited to prevent abuse.
    - Generates cryptographically secure token.
    - Stores only the SHA-256 hash in database.
    - Sets token expiration to 20 minutes.
    - Sends branded HTML email with reset link.
    - Generic response: does not leak whether an email exists.
    """
    clean_email = payload.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown"

    # 1. Rate limiting check (per email and per IP)
    if is_rate_limited(clean_email, limit=5, window_seconds=900) or is_rate_limited(client_ip, limit=10, window_seconds=900):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests. Please wait 15 minutes before trying again."
        )

    # 2. Look up user by email
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    email_dispatched = False
    delivery_status = "NO_ACCOUNT"
    config_note = None
    reset_url_debug = None

    if user:
        # Invalidate previous unused tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False
        ).update({"used": True})

        # 3. Generate cryptographically secure token
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=20)

        # 4. Store hashed token in database
        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            used=False
        )
        db.add(reset_record)
        db.commit()

        # 5. Build reset URL
        app_url = os.getenv("APP_URL", "").rstrip("/")
        if not app_url:
            # Fallback to incoming request origin
            app_url = str(request.base_url).rstrip("/")
        
        reset_url = f"{app_url}/reset-password?token={raw_token}"
        reset_url_debug = reset_url

        # 6. Send Email via Resend or SMTP
        success, status_str, note = send_password_reset_email(
            recipient_email=user.email,
            recipient_name=user.full_name,
            reset_url=reset_url,
            expires_in_minutes=20
        )
        email_dispatched = success
        delivery_status = status_str
        config_note = note

    # Always return a generic response so email presence is never leaked
    return ForgotPasswordResponse(
        message="If an account exists with this email, a password reset link has been sent.",
        email_sent=email_dispatched,
        delivery_status=delivery_status,
        config_instructions=config_note,
        reset_link=reset_url_debug
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Reset account password using valid reset token.
    - Validates token hash and 20-minute expiration.
    - Rejects already-used or invalid tokens.
    - Hashes new password with Argon2.
    - Updates user password and marks token as used.
    - Invalidates existing authentication sessions.
    """
    token_str = payload.token.strip()
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is required."
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    # 1. Compute SHA-256 hash of provided token
    token_hash = hashlib.sha256(token_str.encode("utf-8")).hexdigest()

    # 2. Look up token in database
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or unrecognized password reset token."
        )

    # 3. Check if already used
    if token_record.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link has already been used. Please request a new link."
        )

    # 4. Check expiration (20 minutes)
    if token_record.expires_at < datetime.datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link has expired (valid for 20 minutes). Please request a new link."
        )

    # 5. Look up corresponding user
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account associated with this reset link was not found."
        )

    # 6. Hash new password using Argon2
    user.hashed_password = hash_password(payload.new_password)
    user.updated_at = datetime.datetime.utcnow()

    # 7. Mark token as used (single-use enforcement)
    token_record.used = True

    # 8. Invalidate existing sessions for this user
    revocation_entry = RevokedToken(
        jti=f"pwd-reset-{user.id}-{uuid.uuid4()}",
        user_id=user.id,
        revoked_at=datetime.datetime.utcnow()
    )
    db.add(revocation_entry)

    # Clear HttpOnly Cookie if present
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax"
    )

    db.commit()

    return MessageResponse(
        message="Password reset successfully. You can now log in with your new password."
    )

