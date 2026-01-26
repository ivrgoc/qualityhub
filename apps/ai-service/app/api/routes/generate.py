"""Generation routes for test cases and BDD scenarios."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import Settings, get_settings
from app.models.requests import BDDGenerationRequest, TestGenerationRequest
from app.models.responses import BDDGenerationResponse, TestGenerationResponse
from app.services.bdd_generator import BDDGenerator
from app.services.test_generator import TestGenerator

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("/tests", response_model=TestGenerationResponse)
async def generate_tests(
    request: TestGenerationRequest,
    settings: Settings = Depends(get_settings),
) -> TestGenerationResponse:
    """Generate test cases from a requirement or feature description.

    This endpoint uses AI to analyze the provided description and generate
    structured test cases with steps, expected results, and metadata.

    Args:
        request: Test generation request containing:
            - description: The requirement or feature to generate tests for
            - context: Optional additional context about the application
            - test_type: Type of tests to generate (functional, edge_case, negative, all)
            - max_tests: Maximum number of test cases to generate (1-20)
            - priority: Optional priority level for generated tests

        settings: Application settings (injected)

    Returns:
        TestGenerationResponse containing:
            - test_cases: List of generated test cases with steps
            - metadata: Generation metadata (provider, model, tokens used)

    Raises:
        HTTPException: 500 if test generation fails
    """
    try:
        api_key = _get_api_key(settings)
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


@router.post("/bdd", response_model=BDDGenerationResponse)
async def generate_bdd(
    request: BDDGenerationRequest,
    settings: Settings = Depends(get_settings),
) -> BDDGenerationResponse:
    """Generate BDD scenarios in Gherkin format from a feature description.

    This endpoint uses AI to create behavior-driven development scenarios
    with Given/When/Then steps, optional examples tables, and tags.

    Args:
        request: BDD generation request containing:
            - feature_description: Description of the feature to generate scenarios for
            - context: Optional additional context about the application
            - max_scenarios: Maximum number of scenarios to generate (1-10)
            - include_examples: Whether to include Scenario Outline examples

        settings: Application settings (injected)

    Returns:
        BDDGenerationResponse containing:
            - feature_name: Extracted feature name
            - feature_description: Feature description
            - scenarios: List of BDD scenarios with Given/When/Then steps
            - gherkin: Complete Gherkin feature file content
            - metadata: Generation metadata (provider, model, tokens used)

    Raises:
        HTTPException: 500 if BDD generation fails
    """
    try:
        api_key = _get_api_key(settings)
        use_ai = bool(api_key)

        generator = BDDGenerator(
            api_key=api_key,
            provider=settings.default_ai_provider,
            use_ai=use_ai,
        )

        return await generator.generate_scenarios(
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


def _get_api_key(settings: Settings) -> Optional[str]:
    """Get the API key based on the configured provider.

    Args:
        settings: Application settings

    Returns:
        The API key for the configured provider, or None if not set
    """
    if settings.default_ai_provider == "openai":
        return settings.openai_api_key
    return settings.anthropic_api_key
