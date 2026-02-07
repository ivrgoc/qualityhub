"""FastAPI dependency injection providers.

This module provides reusable dependency functions for route handlers,
including LLM client resolution, API key validation, and service
factory functions. These are used with FastAPI's Depends() system.
"""

from __future__ import annotations

from typing import Literal, Optional, Tuple

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.services.bdd_generator import BDDGenerator
from app.services.test_generator import TestGenerator


def resolve_ai_provider(
    settings: Settings,
) -> Tuple[Optional[str], Literal["openai", "anthropic"], bool]:
    """Resolve the AI provider configuration from settings.

    Determines which AI provider to use and whether AI is available
    based on the configured API keys. Falls back to alternative
    providers if the preferred one has no API key.

    Args:
        settings: Application settings.

    Returns:
        Tuple of (api_key, provider_name, use_ai) where use_ai is True
        only if the corresponding API key is configured.
    """
    provider = settings.default_ai_provider

    if provider == "anthropic" and settings.has_anthropic_key:
        return settings.anthropic_api_key, "anthropic", True
    elif provider == "openai" and settings.has_openai_key:
        return settings.openai_api_key, "openai", True
    elif settings.has_openai_key:
        return settings.openai_api_key, "openai", True
    elif settings.has_anthropic_key:
        return settings.anthropic_api_key, "anthropic", True
    else:
        # No API key configured; fall back to mock mode
        return None, provider, False


def get_test_generator(
    settings: Settings = Depends(get_settings),
) -> TestGenerator:
    """Create a TestGenerator instance with proper provider configuration.

    This dependency resolves the AI provider and API key from settings,
    creating a TestGenerator that either uses the real LLM or falls back
    to mock generation when no API keys are configured.

    Args:
        settings: Application settings (injected by FastAPI).

    Returns:
        Configured TestGenerator instance.
    """
    api_key, provider, use_ai = resolve_ai_provider(settings)
    return TestGenerator(
        api_key=api_key,
        provider=provider,
        use_ai=use_ai,
    )


def get_bdd_generator(
    settings: Settings = Depends(get_settings),
) -> BDDGenerator:
    """Create a BDDGenerator instance with proper provider configuration.

    This dependency resolves the AI provider and API key from settings,
    creating a BDDGenerator that either uses the real LLM or falls back
    to mock generation when no API keys are configured.

    Args:
        settings: Application settings (injected by FastAPI).

    Returns:
        Configured BDDGenerator instance.
    """
    api_key, provider, use_ai = resolve_ai_provider(settings)
    return BDDGenerator(
        api_key=api_key,
        provider=provider,
        use_ai=use_ai,
    )
