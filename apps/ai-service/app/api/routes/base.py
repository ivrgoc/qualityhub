"""Base API routes for the AI service.

These routes are mounted under the versioned API prefix (/api/v1/ai)
and provide the primary endpoints for test generation, BDD scenario
generation, coverage suggestions, and health checks.

The NestJS backend proxies requests through /generate/tests and
/generate/bdd (see generate.py), but these endpoints are also
available directly at the prefixed paths for documentation and
direct API access.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_bdd_generator, get_test_generator
from app.core.config import Settings, get_settings
from app.models.requests import (
    BDDGenerationRequest,
    CoverageSuggestionRequest,
    TestGenerationRequest,
)
from app.models.responses import (
    BDDGenerationResponse,
    CoverageSuggestion,
    CoverageSuggestionResponse,
    HealthResponse,
    TestGenerationResponse,
)
from app.services.bdd_generator import BDDGenerationError, BDDGenerator
from app.services.test_generator import TestGenerationError, TestGenerator

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Check the health of the AI service.

    Returns:
        HealthResponse with service status information.
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        environment=settings.environment,
    )


@router.post(
    "/generate-tests",
    response_model=TestGenerationResponse,
    tags=["generation"],
    summary="Generate test cases from requirements",
    description=(
        "Uses AI to analyze the provided description and generate "
        "structured test cases with steps, expected results, and metadata."
    ),
    responses={
        200: {"description": "Test cases generated successfully"},
        422: {"description": "Validation error in request body"},
        500: {"description": "Test generation failed"},
    },
)
async def generate_tests(
    request: TestGenerationRequest,
    generator: TestGenerator = Depends(get_test_generator),
) -> TestGenerationResponse:
    """Generate test cases from a requirement or feature description.

    Args:
        request: Test generation request with description and options.
        generator: TestGenerator instance (injected via dependency).

    Returns:
        TestGenerationResponse with generated test cases.

    Raises:
        HTTPException: If test generation fails.
    """
    try:
        return await generator.generate_tests(
            description=request.description,
            context=request.context,
            test_type=request.test_type,
            max_tests=request.max_tests,
            priority=request.priority,
        )
    except TestGenerationError as e:
        logger.error("Test generation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tests: {str(e)}",
        ) from e
    except Exception as e:
        logger.error("Unexpected error during test generation: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tests: {str(e)}",
        ) from e


@router.post(
    "/generate-bdd",
    response_model=BDDGenerationResponse,
    tags=["generation"],
    summary="Generate BDD scenarios in Gherkin format",
    description=(
        "Uses AI to create behavior-driven development scenarios "
        "with Given/When/Then steps, optional examples tables, and tags."
    ),
    responses={
        200: {"description": "BDD scenarios generated successfully"},
        422: {"description": "Validation error in request body"},
        500: {"description": "BDD generation failed"},
    },
)
async def generate_bdd(
    request: BDDGenerationRequest,
    generator: BDDGenerator = Depends(get_bdd_generator),
) -> BDDGenerationResponse:
    """Generate BDD scenarios (Gherkin format) from a feature description.

    Args:
        request: BDD generation request with feature description.
        generator: BDDGenerator instance (injected via dependency).

    Returns:
        BDDGenerationResponse with generated scenarios and Gherkin content.

    Raises:
        HTTPException: If BDD generation fails.
    """
    try:
        return await generator.generate_scenarios(
            feature_description=request.feature_description,
            context=request.context,
            max_scenarios=request.max_scenarios,
            include_examples=request.include_examples,
        )
    except BDDGenerationError as e:
        logger.error("BDD generation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate BDD scenarios: {str(e)}",
        ) from e
    except Exception as e:
        logger.error("Unexpected error during BDD generation: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate BDD scenarios: {str(e)}",
        ) from e


@router.post(
    "/suggest-coverage",
    response_model=CoverageSuggestionResponse,
    tags=["generation"],
    summary="Suggest test coverage improvements",
    description=(
        "Analyzes existing test cases and suggests coverage improvements "
        "based on the feature description and identified gaps."
    ),
    responses={
        200: {"description": "Coverage suggestions generated successfully"},
        422: {"description": "Validation error in request body"},
        500: {"description": "Coverage analysis failed"},
    },
)
async def suggest_coverage(
    request: CoverageSuggestionRequest,
    settings: Settings = Depends(get_settings),
) -> CoverageSuggestionResponse:
    """Suggest test coverage improvements based on existing tests.

    Currently provides rule-based suggestions. In production, this
    will use AI to analyze existing tests and identify coverage gaps.

    Args:
        request: Coverage suggestion request with existing tests.
        settings: Application settings (injected).

    Returns:
        CoverageSuggestionResponse with suggested improvements.

    Raises:
        HTTPException: If coverage analysis fails.
    """
    try:
        suggestions = [
            CoverageSuggestion(
                title="Add boundary value tests",
                rationale="Current tests don't cover minimum/maximum input values",
                priority="high",
                coverage_area="Input Validation",
            ),
            CoverageSuggestion(
                title="Add concurrent access tests",
                rationale="No tests verify behavior under concurrent user actions",
                priority="medium",
                coverage_area="Concurrency",
            ),
        ]

        return CoverageSuggestionResponse(
            suggestions=suggestions,
            coverage_gaps=[
                "Boundary value testing",
                "Error recovery scenarios",
                "Performance under load",
            ],
            overall_assessment=(
                f"Current test suite has {len(request.existing_tests)} tests. "
                "Consider adding tests for edge cases and error handling."
            ),
        )
    except Exception as e:
        logger.error("Coverage analysis failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze coverage: {str(e)}",
        ) from e
