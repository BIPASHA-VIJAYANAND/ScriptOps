"""
Auth routes + JWT middleware dependency.

Provides:
  POST /api/v1/auth/signup   — create a new user via Supabase Auth
  POST /api/v1/auth/signin   — sign in, returns access_token
  GET  /api/v1/auth/me       — return current user (requires Bearer token)

When Supabase is not configured all endpoints return 503 with a clear message
so the rest of the API continues to work without auth.
"""

import os
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from ..core.supabase_client import get_client, is_configured

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# ── Security scheme ────────────────────────────────────────────────────────────
bearer_scheme = HTTPBearer(auto_error=False)


# ── Request / Response models ──────────────────────────────────────────────────
class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


# ── Helper ─────────────────────────────────────────────────────────────────────
def _require_supabase():
    if not is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Supabase is not configured. "
                "Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY "
                "in backend/.env to enable authentication."
            ),
        )


# ── Auth dependency (reusable in other routes) ─────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    FastAPI dependency — validate Bearer JWT and return the Supabase user.
    Use as:  user = Depends(get_current_user)
    Returns None when Supabase is disabled (allows unauthenticated access).
    """
    if not is_configured():
        return None  # Auth disabled — allow through
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    try:
        client = get_client()
        result = client.auth.get_user(credentials.credentials)
        if result is None or result.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return result.user
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Token validation error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
        )


# ── Endpoints ──────────────────────────────────────────────────────────────────
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: AuthRequest):
    """Register a new user via Supabase Auth."""
    _require_supabase()
    try:
        client = get_client()
        res = client.auth.sign_up({"email": body.email, "password": body.password})
        if res.user is None:
            raise HTTPException(400, "Sign-up failed — check the email/password.")
        # Session may be None if email confirmation is required
        token = res.session.access_token if res.session else ""
        return AuthResponse(
            access_token=token,
            user_id=str(res.user.id),
            email=res.user.email or body.email,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Signup error: %s", exc)
        raise HTTPException(400, str(exc))


@router.post("/signin", response_model=AuthResponse)
async def signin(body: AuthRequest):
    """Sign in and return a JWT access token."""
    _require_supabase()
    try:
        client = get_client()
        res = client.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        if res.session is None:
            raise HTTPException(401, "Invalid credentials.")
        return AuthResponse(
            access_token=res.session.access_token,
            user_id=str(res.user.id),
            email=res.user.email or body.email,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Signin error: %s", exc)
        raise HTTPException(401, "Authentication failed.")


@router.get("/me")
async def me(user=Depends(get_current_user)):
    """Return the currently authenticated user's info."""
    _require_supabase()
    if user is None:
        raise HTTPException(401, "Not authenticated")
    return {
        "user_id": str(user.id),
        "email": user.email,
        "created_at": str(user.created_at),
    }
