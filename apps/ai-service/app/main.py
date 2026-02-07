"""Main FastAPI application entry point.

This module creates and configures the FastAPI application for the
QualityHub AI Service. It sets up CORS, logging, and routes for
test generation, BDD scenario generation, and coverage suggestions.

The service exposes endpoints at two path hierarchies:
  - /generate/tests and /generate/bdd (consumed by the NestJS API gateway)
  - /api/v1/ai/... (full prefixed routes for direct access and documentation)
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_router
from app.api.routes.generate import router as generate_router
from app.core.config import get_settings

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Sets up the application with middleware, route handlers, exception
    handlers, and health/root endpoints. Routes are mounted at both
    the root level (for NestJS gateway consumption) and under the
    full API prefix (for direct access).

    Returns:
        Configured FastAPI application instance.
    """
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "AI-powered test generation service for QualityHub. "
            "Generates test cases, BDD scenarios, and coverage suggestions "
            "using LLM providers (OpenAI, Anthropic)."
        ),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -- Route mounting --
    # Mount the /generate/* router at root level so the NestJS backend
    # (which calls http://localhost:8000/generate/tests and /generate/bdd)
    # can reach these endpoints directly.
    application.include_router(generate_router)

    # Mount the full API routes under the versioned prefix for direct
    # access and API documentation purposes.
    application.include_router(api_router, prefix=settings.api_prefix + "/ai")
    application.include_router(generate_router, prefix=settings.api_prefix + "/ai")

    # -- Request logging middleware --
    @application.middleware("http")
    async def log_requests(request: Request, call_next: Any) -> Response:
        """Log incoming requests and their processing time."""
        start_time = time.time()
        response: Response = await call_next(request)
        process_time = (time.time() - start_time) * 1000

        logger.info(
            "%s %s - %d (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            process_time,
        )
        response.headers["X-Process-Time"] = f"{process_time:.1f}ms"
        return response

    # -- Exception handlers --
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle unhandled exceptions with a consistent error response."""
        logger.error(
            "Unhandled exception on %s %s: %s",
            request.method,
            request.url.path,
            str(exc),
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "type": type(exc).__name__,
            },
        )

    return application


app = create_app()


@app.get("/", tags=["root"])
async def root() -> Dict[str, str]:
    """Root endpoint providing basic service information.

    Returns:
        Service name, version, and documentation URL.
    """
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/api/docs",
    }


@app.get("/health", tags=["health"])
async def health_check() -> Dict[str, str]:
    """Root-level health check endpoint.

    This endpoint is available at the root for simple container
    health probes and load balancer checks.

    Returns:
        Service health status, version, and environment.
    """
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment,
    }
