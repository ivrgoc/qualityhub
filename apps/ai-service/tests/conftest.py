"""Pytest configuration and fixtures for AI service tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client for the FastAPI application.

    Returns:
        TestClient instance for making test requests.
    """
    return TestClient(app)
