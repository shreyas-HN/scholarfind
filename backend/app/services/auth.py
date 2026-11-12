import os
import uuid
import datetime
from typing import Optional, Tuple
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError, VerificationError
from sqlalchemy.orm import Session
from backend.app.models.user import RevokedToken

# Configure Argon2 Password Hasher
ph = PasswordHasher()

# JWT Settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "scholarfind-sec-token-hash-2026-auth-prod-key-32b")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days


def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against Argon2 hash."""
    if not hashed_password or not plain_password:
        return False
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError, VerificationError):
        return False
    except Exception:
        return False


def create_access_token(
    user_id: str,
    email: str,
    expires_delta: Optional[datetime.timedelta] = None
) -> Tuple[str, str, datetime.datetime]:
    """
    Generate JWT access token with JTI for server-side revocation.
    Returns: (token, jti, expire_datetime)
    """
    jti = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": user_id,
        "email": email,
        "jti": jti,
        "iat": now,
        "exp": expire
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token, jti, expire


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token signature & expiration."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def is_token_revoked(db: Session, jti: str) -> bool:
    """Check if token JTI has been revoked on server."""
    if not jti:
        return True
    revoked = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    return revoked is not None


def revoke_token(
    db: Session,
    jti: str,
    user_id: Optional[str] = None,
    expires_at: Optional[datetime.datetime] = None,
    raw_token: Optional[str] = None
) -> None:
    """Record token JTI into server-side RevokedToken table."""
    if not jti:
        return
    # Check if already revoked
    existing = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    if not existing:
        record = RevokedToken(
            jti=jti,
            token=raw_token,
            user_id=user_id,
            revoked_at=datetime.datetime.utcnow(),
            expires_at=expires_at
        )
        db.add(record)
        db.commit()
