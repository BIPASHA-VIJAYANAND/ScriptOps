"""
Supabase client initialization.
Provides anon client (for user-scoped ops) and admin/service-role client
(for backend ops that bypass Row-Level Security).

Set these in backend/.env:
  SUPABASE_URL=https://<project>.supabase.co
  SUPABASE_ANON_KEY=<anon/public key>
  SUPABASE_SERVICE_KEY=<service_role key>

If keys are not set the helpers return None — the rest of the app
continues fine using in-memory storage.
"""

import os
import logging

logger = logging.getLogger(__name__)

try:
    from supabase import create_client, Client
    _SUPABASE_AVAILABLE = True
except ImportError:
    _SUPABASE_AVAILABLE = False
    logger.warning("supabase-py not installed — Supabase features disabled.")


def get_client():
    """
    Return an anon Supabase client (respects Row-Level Security).
    Returns None if Supabase is not configured.
    """
    if not _SUPABASE_AVAILABLE:
        return None
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        logger.debug("SUPABASE_URL / SUPABASE_ANON_KEY not set — skipping client init.")
        return None
    return create_client(url, key)


def get_admin_client():
    """
    Return a service-role Supabase client (bypasses RLS — backend use only).
    Returns None if Supabase is not configured.
    """
    if not _SUPABASE_AVAILABLE:
        return None
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        logger.debug("SUPABASE_URL / SUPABASE_SERVICE_KEY not set — skipping admin client init.")
        return None
    return create_client(url, key)


def is_configured() -> bool:
    """Return True if Supabase env vars are present."""
    return bool(
        os.getenv("SUPABASE_URL")
        and os.getenv("SUPABASE_ANON_KEY")
        and _SUPABASE_AVAILABLE
    )
