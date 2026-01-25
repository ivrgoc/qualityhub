"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings

settings = get_settings()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "AI-powered test generation service for QualityHub. "
            "Generates test cases, BDD scenarios, and coverage suggestions."
        ),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routes
    app.include_router(router, prefix=settings.api_prefix + "/ai")

    return app


app = create_app()


@app.get("/")
async def root() -> dict:
    """Root endpoint providing basic service information.

    Returns:
        Service information dict
    """
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/api/docs",
    }
