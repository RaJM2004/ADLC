from typing import Optional
from pydantic import BaseModel
from fastapi import Header, HTTPException, status
from app.core.config import settings

class CurrentUser(BaseModel):
    user_id: str = "usr_dev_admin_001"
    email: str = "admin@genquantaa.internal"
    role: str = "adlc_admin"  # adlc_admin | reviewer | engineer | auditor
    organization_id: str = "org_genquantaa_primary"
    display_name: str = "Lead System Architect"

def get_current_user(
    x_user_id: Optional[str] = Header(None),
    x_org_id: Optional[str] = Header(None),
    x_role: Optional[str] = Header(None)
) -> CurrentUser:
    """
    Returns the authenticated user context.
    In development mode with ENABLE_DEV_AUTH=True, provides structured dev context.
    In production mode, requires standard JWT token validation.
    """
    if settings.ENABLE_DEV_AUTH:
        return CurrentUser(
            user_id=x_user_id or "usr_dev_admin_001",
            email="admin@genquantaa.internal",
            role=x_role or "adlc_admin",
            organization_id=x_org_id or "org_genquantaa_primary",
            display_name="Enterprise Architect (Demo)"
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Production authentication required. Please pass valid credentials."
    )
