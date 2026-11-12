from typing import Optional, Tuple
from fastapi import Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.app.models.user import User
from backend.app.services.auth import decode_access_token, is_token_revoked

security_bearer = HTTPBearer(auto_error=False)


def extract_token_from_request(request: Request, bearer_auth: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
    """
    Extract token from either:
    1. Authorization: Bearer <token> header
    2. HttpOnly Cookie: access_token
    """
    if bearer_auth and bearer_auth.credentials:
        return bearer_auth.credentials.strip()

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        # If token was stored as "Bearer <token>" in cookie
        if cookie_token.startswith("Bearer "):
            return cookie_token[7:].strip()
        return cookie_token.strip()

    return None


def get_current_user_and_token(
    request: Request,
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Tuple[User, str, dict]:
    """
    Validate session token and return (User, token_string, payload).
    Enforces server-side session revocation.
    """
    token = extract_token_from_request(request, bearer_auth)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to continue.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    jti = payload.get("jti")
    if not jti or is_token_revoked(db, jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked or logged out. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user, token, payload


def get_current_user(
    auth_data: Tuple[User, str, dict] = Depends(get_current_user_and_token)
) -> User:
    """Dependency that returns the verified current authenticated User model."""
    user, _, _ = auth_data
    return user


def get_current_user_optional(
    request: Request,
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Optional dependency that returns User if valid token is provided, or None."""
    token = extract_token_from_request(request, bearer_auth)
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    jti = payload.get("jti")
    if not jti or is_token_revoked(db, jti):
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    return db.query(User).filter(User.id == user_id).first()
