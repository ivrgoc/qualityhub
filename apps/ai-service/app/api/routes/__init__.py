"""API routes module for AI service.

Exports the base router (health, generate-tests, generate-bdd, suggest-coverage)
and the generate router (/generate/tests, /generate/bdd) which is consumed
by the NestJS API gateway.
"""

from app.api.routes.base import router
from app.api.routes.generate import router as generate_router

__all__ = ["router", "generate_router"]
