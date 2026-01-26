"""Security utilities for API authentication."""

from __future__ import annotations

import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import Settings, get_settings

# API key header configuration
API_KEY_HEADER_NAME = "X-API-Key"

api_key_header = APIKeyHeader(
    name=API_KEY_HEADER_NAME,
    auto_error=False,
    description="API key for authentication",
)


def verify_api_key(
    api_key: Annotated[str | None, Security(api_key_header)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> str:
    """Verify the provided API key against configured keys.

    This dependency validates incoming API keys against the configured
    service API keys. It uses constant-time comparison to prevent
    timing attacks.

    Args:
        api_key: The API key from the request header
        settings: Application settings containing valid API keys

    Returns:
        The validated API key

    Raises:
        HTTPException: 401 if API key is missing
        HTTPException: 403 if API key is invalid
    """
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    # Get the list of valid API keys from settings
    valid_keys = settings.api_keys

    if not valid_keys:
        # If no API keys are configured, reject all requests in production
        if settings.is_production:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="API key authentication not configured",
            )
        # In development, allow requests without configured keys
        return api_key

    # Use constant-time comparison to prevent timing attacks
    is_valid = any(
        secrets.compare_digest(api_key.encode("utf-8"), valid_key.encode("utf-8"))
        for valid_key in valid_keys
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )

    return api_key


# Type alias for use in route dependencies
APIKeyDep = Annotated[str, Depends(verify_api_key)]
