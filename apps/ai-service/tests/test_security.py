"""Tests for API key validation security module."""

from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.core.security import verify_api_key


class TestVerifyApiKey:
    """Tests for the verify_api_key dependency."""

    def test_missing_api_key_returns_401(self) -> None:
        """Test that missing API key returns 401 Unauthorized."""
        settings = MagicMock()
        settings.api_keys = ["valid-key-123"]
        settings.is_production = False

        with pytest.raises(HTTPException) as exc_info:
            verify_api_key(api_key=None, settings=settings)

        assert exc_info.value.status_code == 401
        assert "API key is required" in exc_info.value.detail

    def test_invalid_api_key_returns_403(self) -> None:
        """Test that invalid API key returns 403 Forbidden."""
        settings = MagicMock()
        settings.api_keys = ["valid-key-123"]
        settings.is_production = False

        with pytest.raises(HTTPException) as exc_info:
            verify_api_key(api_key="wrong-key", settings=settings)

        assert exc_info.value.status_code == 403
        assert "Invalid API key" in exc_info.value.detail

    def test_valid_api_key_returns_key(self) -> None:
        """Test that valid API key returns the key."""
        settings = MagicMock()
        valid_key = "valid-key-123"
        settings.api_keys = [valid_key]
        settings.is_production = False

        result = verify_api_key(api_key=valid_key, settings=settings)

        assert result == valid_key

    def test_valid_api_key_from_multiple_keys(self) -> None:
        """Test validation with multiple configured keys."""
        settings = MagicMock()
        settings.api_keys = ["key-one", "key-two", "key-three"]
        settings.is_production = False

        # Each key should be valid
        assert verify_api_key(api_key="key-one", settings=settings) == "key-one"
        assert verify_api_key(api_key="key-two", settings=settings) == "key-two"
        assert verify_api_key(api_key="key-three", settings=settings) == "key-three"

    def test_no_keys_configured_development_allows_request(self) -> None:
        """Test that development mode allows requests when no keys configured."""
        settings = MagicMock()
        settings.api_keys = []
        settings.is_production = False

        # In development, any key should be allowed when none configured
        result = verify_api_key(api_key="any-key", settings=settings)
        assert result == "any-key"

    def test_no_keys_configured_production_returns_500(self) -> None:
        """Test that production mode returns 500 when no keys configured."""
        settings = MagicMock()
        settings.api_keys = []
        settings.is_production = True

        with pytest.raises(HTTPException) as exc_info:
            verify_api_key(api_key="any-key", settings=settings)

        assert exc_info.value.status_code == 500
        assert "not configured" in exc_info.value.detail

    def test_api_key_comparison_is_case_sensitive(self) -> None:
        """Test that API key comparison is case-sensitive."""
        settings = MagicMock()
        settings.api_keys = ["MySecretKey"]
        settings.is_production = False

        # Lowercase variant should fail
        with pytest.raises(HTTPException) as exc_info:
            verify_api_key(api_key="mysecretkey", settings=settings)

        assert exc_info.value.status_code == 403

    def test_api_key_with_special_characters(self) -> None:
        """Test that API keys with special characters work correctly."""
        settings = MagicMock()
        special_key = "key-with.special_chars!@#$%"
        settings.api_keys = [special_key]
        settings.is_production = False

        result = verify_api_key(api_key=special_key, settings=settings)
        assert result == special_key

    def test_empty_string_api_key_is_invalid(self) -> None:
        """Test that empty string API key is invalid."""
        settings = MagicMock()
        settings.api_keys = ["valid-key"]
        settings.is_production = False

        with pytest.raises(HTTPException) as exc_info:
            verify_api_key(api_key="", settings=settings)

        assert exc_info.value.status_code == 403

    def test_whitespace_only_api_key_is_invalid(self) -> None:
        """Test that whitespace-only API key is invalid."""
        settings = MagicMock()
        settings.api_keys = ["valid-key"]
        settings.is_production = False

        with pytest.raises(HTTPException) as exc_info:
            verify_api_key(api_key="   ", settings=settings)

        assert exc_info.value.status_code == 403
