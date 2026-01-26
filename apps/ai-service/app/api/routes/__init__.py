"""API routes module for AI service."""

from app.api.routes.base import router
from app.api.routes.generate import router as generate_router

__all__ = ["router", "generate_router"]
