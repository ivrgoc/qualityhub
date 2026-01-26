"""Tests for application configuration."""

from __future__ import annotations

import os
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.core.config import Settings, get_settings


class TestSettings:
    """Tests for the Settings class."""

    def test_default_values(self) -> None:
        """Settings should have sensible default values."""
        settings = Settings()

        assert settings.app_name == "QualityHub AI Service"
        assert settings.app_version == "0.1.0"
        assert settings.debug is False
        assert settings.environment == "development"
        assert settings.log_level == "INFO"
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000
        assert settings.api_prefix == "/api/v1"

    def test_ai_provider_defaults(self) -> None:
        """AI provider settings should have correct defaults."""
        settings = Settings()

        assert settings.default_ai_provider == "openai"
        assert settings.openai_api_key is None
        assert settings.anthropic_api_key is None
        assert settings.openai_model == "gpt-4-turbo-preview"
        assert settings.anthropic_model == "claude-3-sonnet-20240229"

    def test_openai_settings_defaults(self) -> None:
        """OpenAI-specific settings should have correct defaults."""
        settings = Settings()

        assert settings.openai_max_tokens == 4096
        assert settings.openai_temperature == 0.7

    def test_anthropic_settings_defaults(self) -> None:
        """Anthropic-specific settings should have correct defaults."""
        settings = Settings()

        assert settings.anthropic_max_tokens == 4096
        assert settings.anthropic_temperature == 0.7

    def test_rate_limiting_defaults(self) -> None:
        """Rate limiting settings should have correct defaults."""
        settings = Settings()

        assert settings.rate_limit_requests == 100
        assert settings.rate_limit_window_seconds == 60

    def test_test_generation_defaults(self) -> None:
        """Test generation settings should have correct defaults."""
        settings = Settings()

        assert settings.max_test_cases_per_request == 10
        assert settings.max_bdd_scenarios_per_request == 10

    def test_cors_origins_default(self) -> None:
        """CORS origins should have correct defaults."""
        settings = Settings()

        assert "http://localhost:3000" in settings.cors_origins
        assert "http://localhost:5173" in settings.cors_origins

    def test_environment_override(self) -> None:
        """Settings should be overridable via environment variables."""
        with patch.dict(
            os.environ,
            {
                "DEBUG": "true",
                "ENVIRONMENT": "production",
                "LOG_LEVEL": "DEBUG",
                "PORT": "9000",
            },
        ):
            settings = Settings()

            assert settings.debug is True
            assert settings.environment == "production"
            assert settings.log_level == "DEBUG"
            assert settings.port == 9000

    def test_api_keys_from_environment(self) -> None:
        """API keys should be loadable from environment variables."""
        with patch.dict(
            os.environ,
            {
                "OPENAI_API_KEY": "sk-test-key-123",
                "ANTHROPIC_API_KEY": "anthropic-test-key-456",
            },
        ):
            settings = Settings()

            assert settings.openai_api_key == "sk-test-key-123"
            assert settings.anthropic_api_key == "anthropic-test-key-456"

    def test_cors_origins_from_json_string(self) -> None:
        """CORS origins should parse JSON array from environment."""
        with patch.dict(
            os.environ,
            {"CORS_ORIGINS": '["https://app.example.com", "https://admin.example.com"]'},
        ):
            settings = Settings()

            assert "https://app.example.com" in settings.cors_origins
            assert "https://admin.example.com" in settings.cors_origins

    def test_cors_origins_handles_list(self) -> None:
        """CORS origins should accept list input directly."""
        settings = Settings(cors_origins=["https://example.com", "https://test.com"])

        assert settings.cors_origins == ["https://example.com", "https://test.com"]

    def test_is_development_property(self) -> None:
        """is_development property should return correct value."""
        settings = Settings(environment="development")
        assert settings.is_development is True
        assert settings.is_production is False

        settings = Settings(environment="production")
        assert settings.is_development is False

    def test_is_production_property(self) -> None:
        """is_production property should return correct value."""
        settings = Settings(environment="production")
        assert settings.is_production is True
        assert settings.is_development is False

        settings = Settings(environment="staging")
        assert settings.is_production is False

    def test_has_openai_key_property(self) -> None:
        """has_openai_key property should check API key presence."""
        settings = Settings(openai_api_key=None)
        assert settings.has_openai_key is False

        settings = Settings(openai_api_key="")
        assert settings.has_openai_key is False

        settings = Settings(openai_api_key="sk-test")
        assert settings.has_openai_key is True

    def test_has_anthropic_key_property(self) -> None:
        """has_anthropic_key property should check API key presence."""
        settings = Settings(anthropic_api_key=None)
        assert settings.has_anthropic_key is False

        settings = Settings(anthropic_api_key="")
        assert settings.has_anthropic_key is False

        settings = Settings(anthropic_api_key="anthropic-test")
        assert settings.has_anthropic_key is True

    def test_port_validation_min(self) -> None:
        """Port should be at least 1."""
        with pytest.raises(ValidationError):
            Settings(port=0)

    def test_port_validation_max(self) -> None:
        """Port should be at most 65535."""
        with pytest.raises(ValidationError):
            Settings(port=65536)

    def test_temperature_validation_openai(self) -> None:
        """OpenAI temperature should be between 0 and 2."""
        settings = Settings(openai_temperature=0.0)
        assert settings.openai_temperature == 0.0

        settings = Settings(openai_temperature=2.0)
        assert settings.openai_temperature == 2.0

        with pytest.raises(ValidationError):
            Settings(openai_temperature=-0.1)

        with pytest.raises(ValidationError):
            Settings(openai_temperature=2.1)

    def test_temperature_validation_anthropic(self) -> None:
        """Anthropic temperature should be between 0 and 1."""
        settings = Settings(anthropic_temperature=0.0)
        assert settings.anthropic_temperature == 0.0

        settings = Settings(anthropic_temperature=1.0)
        assert settings.anthropic_temperature == 1.0

        with pytest.raises(ValidationError):
            Settings(anthropic_temperature=-0.1)

        with pytest.raises(ValidationError):
            Settings(anthropic_temperature=1.1)

    def test_max_tokens_validation(self) -> None:
        """Max tokens should be positive."""
        with pytest.raises(ValidationError):
            Settings(openai_max_tokens=0)

        with pytest.raises(ValidationError):
            Settings(anthropic_max_tokens=0)

    def test_rate_limit_validation(self) -> None:
        """Rate limit values should be positive."""
        with pytest.raises(ValidationError):
            Settings(rate_limit_requests=0)

        with pytest.raises(ValidationError):
            Settings(rate_limit_window_seconds=0)

    def test_max_test_cases_validation(self) -> None:
        """Max test cases should be between 1 and 50."""
        settings = Settings(max_test_cases_per_request=1)
        assert settings.max_test_cases_per_request == 1

        settings = Settings(max_test_cases_per_request=50)
        assert settings.max_test_cases_per_request == 50

        with pytest.raises(ValidationError):
            Settings(max_test_cases_per_request=0)

        with pytest.raises(ValidationError):
            Settings(max_test_cases_per_request=51)

    def test_max_bdd_scenarios_validation(self) -> None:
        """Max BDD scenarios should be between 1 and 50."""
        settings = Settings(max_bdd_scenarios_per_request=1)
        assert settings.max_bdd_scenarios_per_request == 1

        settings = Settings(max_bdd_scenarios_per_request=50)
        assert settings.max_bdd_scenarios_per_request == 50

        with pytest.raises(ValidationError):
            Settings(max_bdd_scenarios_per_request=0)

        with pytest.raises(ValidationError):
            Settings(max_bdd_scenarios_per_request=51)

    def test_invalid_environment_value(self) -> None:
        """Invalid environment value should raise validation error."""
        with pytest.raises(ValidationError):
            Settings(environment="invalid")

    def test_invalid_log_level_value(self) -> None:
        """Invalid log level value should raise validation error."""
        with pytest.raises(ValidationError):
            Settings(log_level="INVALID")

    def test_invalid_ai_provider_value(self) -> None:
        """Invalid AI provider value should raise validation error."""
        with pytest.raises(ValidationError):
            Settings(default_ai_provider="invalid")


class TestGetSettings:
    """Tests for the get_settings function."""

    def test_returns_settings_instance(self) -> None:
        """get_settings should return a Settings instance."""
        # Clear the cache to ensure fresh settings
        get_settings.cache_clear()

        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_caching(self) -> None:
        """get_settings should return cached instance."""
        get_settings.cache_clear()

        settings1 = get_settings()
        settings2 = get_settings()

        assert settings1 is settings2

    def test_cache_clear(self) -> None:
        """Cache can be cleared for fresh settings."""
        get_settings.cache_clear()
        settings1 = get_settings()

        get_settings.cache_clear()
        settings2 = get_settings()

        # New instance after cache clear
        assert settings1 is not settings2
