"""Application configuration using Pydantic settings.

Configuration is loaded from environment variables and an optional
.env file. All settings have sensible defaults for development.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List, Literal, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Settings are loaded in order of priority:
    1. Environment variables (highest priority)
    2. .env file
    3. Default values (lowest priority)
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "QualityHub AI Service"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # Server
    host: str = "0.0.0.0"
    port: int = Field(default=8000, ge=1, le=65535)

    # API
    api_prefix: str = "/api/v1"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # AI Provider Configuration
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    default_ai_provider: Literal["openai", "anthropic"] = "anthropic"

    # OpenAI Settings
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = Field(default=4096, ge=1, le=128000)
    openai_temperature: float = Field(default=0.7, ge=0.0, le=2.0)

    # Anthropic Settings
    anthropic_model: str = "claude-sonnet-4-20250514"
    anthropic_max_tokens: int = Field(default=4096, ge=1, le=200000)
    anthropic_temperature: float = Field(default=0.7, ge=0.0, le=1.0)

    # API Security
    api_keys: List[str] = Field(default_factory=list, description="List of valid API keys")

    # Rate Limiting
    rate_limit_requests: int = Field(default=100, ge=1)
    rate_limit_window_seconds: int = Field(default=60, ge=1)

    # Test Generation Settings
    max_test_cases_per_request: int = Field(default=10, ge=1, le=50)
    max_bdd_scenarios_per_request: int = Field(default=10, ge=1, le=50)

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"

    @property
    def has_openai_key(self) -> bool:
        """Check if OpenAI API key is configured."""
        return bool(self.openai_api_key)

    @property
    def has_anthropic_key(self) -> bool:
        """Check if Anthropic API key is configured."""
        return bool(self.anthropic_api_key)


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings.

    Uses lru_cache to ensure settings are loaded only once.
    Call get_settings.cache_clear() to reload settings.

    Returns:
        Cached Settings instance.
    """
    return Settings()
