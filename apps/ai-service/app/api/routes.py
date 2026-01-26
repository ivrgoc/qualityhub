"""API routes for AI service endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

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
from app.services.bdd_generator import BDDGenerator
from app.services.test_generator import TestGenerator

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Check the health of the AI service.

    Returns:
        HealthResponse with service status information
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        environment=settings.environment,
    )


@router.post("/generate-tests", response_model=TestGenerationResponse)
async def generate_tests(
    request: TestGenerationRequest,
    settings: Settings = Depends(get_settings),
) -> TestGenerationResponse:
    """Generate test cases from a requirement or feature description.

    Args:
        request: Test generation request with description and options
        settings: Application settings

    Returns:
        TestGenerationResponse with generated test cases

    Raises:
        HTTPException: If test generation fails
    """
    try:
        # Determine API key based on provider
        api_key = (
            settings.openai_api_key
            if settings.default_ai_provider == "openai"
            else settings.anthropic_api_key
        )
        # Use AI only if an API key is configured
        use_ai = bool(api_key)

        generator = TestGenerator(
            api_key=api_key,
            provider=settings.default_ai_provider,
            use_ai=use_ai,
        )

        return await generator.generate_tests(
            description=request.description,
            context=request.context,
            test_type=request.test_type,
            max_tests=request.max_tests,
            priority=request.priority,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tests: {str(e)}",
        ) from e


@router.post("/generate-bdd", response_model=BDDGenerationResponse)
async def generate_bdd(
    request: BDDGenerationRequest,
    settings: Settings = Depends(get_settings),
) -> BDDGenerationResponse:
    """Generate BDD scenarios (Gherkin format) from a feature description.

    Args:
        request: BDD generation request with feature description
        settings: Application settings

    Returns:
        BDDGenerationResponse with generated scenarios and Gherkin content

    Raises:
        HTTPException: If BDD generation fails
    """
    try:
        generator = BDDGenerator(
            api_key=settings.openai_api_key
            if settings.default_ai_provider == "openai"
            else settings.anthropic_api_key,
            provider=settings.default_ai_provider,
        )

        return await generator.generate(
            feature_description=request.feature_description,
            context=request.context,
            max_scenarios=request.max_scenarios,
            include_examples=request.include_examples,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate BDD scenarios: {str(e)}",
        ) from e


@router.post("/suggest-coverage", response_model=CoverageSuggestionResponse)
async def suggest_coverage(
    request: CoverageSuggestionRequest,
    settings: Settings = Depends(get_settings),
) -> CoverageSuggestionResponse:
    """Suggest test coverage improvements based on existing tests.

    Args:
        request: Coverage suggestion request with existing tests
        settings: Application settings

    Returns:
        CoverageSuggestionResponse with suggested improvements

    Raises:
        HTTPException: If coverage analysis fails
    """
    # Mock implementation for now
    # In production, this would analyze existing tests and use AI to suggest gaps
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze coverage: {str(e)}",
        ) from e
