"""Application configuration using Pydantic settings."""

from __future__ import annotations

from functools import lru_cache
from typing import List, Literal, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "QualityHub AI Service"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # API
    api_prefix: str = "/api/v1"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # AI Provider Configuration
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    default_ai_provider: Literal["openai", "anthropic"] = "openai"

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
