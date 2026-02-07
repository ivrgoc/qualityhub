"""Generation routes for test cases and BDD scenarios.

These routes are mounted at /generate/* and serve as the primary
integration point for the NestJS API gateway. The NestJS backend
calls these endpoints via:
  - POST http://localhost:8000/generate/tests
  - POST http://localhost:8000/generate/bdd

They are also mounted under the versioned API prefix for direct access.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_bdd_generator, get_test_generator
from app.models.requests import BDDGenerationRequest, TestGenerationRequest
from app.models.responses import BDDGenerationResponse, TestGenerationResponse
from app.services.bdd_generator import BDDGenerationError, BDDGenerator
from app.services.test_generator import TestGenerationError, TestGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post(
    "/tests",
    response_model=TestGenerationResponse,
    summary="Generate test cases from requirements",
    description=(
        "Uses AI to analyze the provided description and generate "
        "structured test cases with steps, expected results, and metadata. "
        "This endpoint is the primary integration point for the NestJS gateway."
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

    This endpoint uses AI to analyze the provided description and generate
    structured test cases with steps, expected results, and metadata.

    Args:
        request: Test generation request containing:
            - description: The requirement or feature to generate tests for
            - context: Optional additional context about the application
            - test_type: Type of tests to generate (functional, edge_case, negative, all)
            - max_tests: Maximum number of test cases to generate (1-20)
            - priority: Optional priority level for generated tests

        generator: TestGenerator instance (injected via dependency).

    Returns:
        TestGenerationResponse containing:
            - test_cases: List of generated test cases with steps
            - metadata: Generation metadata (provider, model, tokens used)

    Raises:
        HTTPException: 500 if test generation fails.
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
    "/bdd",
    response_model=BDDGenerationResponse,
    summary="Generate BDD scenarios in Gherkin format",
    description=(
        "Uses AI to create behavior-driven development scenarios "
        "with Given/When/Then steps, optional examples tables, and tags. "
        "This endpoint is the primary integration point for the NestJS gateway."
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
    """Generate BDD scenarios in Gherkin format from a feature description.

    This endpoint uses AI to create behavior-driven development scenarios
    with Given/When/Then steps, optional examples tables, and tags.

    Args:
        request: BDD generation request containing:
            - feature_description: Description of the feature to generate scenarios for
            - context: Optional additional context about the application
            - max_scenarios: Maximum number of scenarios to generate (1-10)
            - include_examples: Whether to include Scenario Outline examples

        generator: BDDGenerator instance (injected via dependency).

    Returns:
        BDDGenerationResponse containing:
            - feature_name: Extracted feature name
            - feature_description: Feature description
            - scenarios: List of BDD scenarios with Given/When/Then steps
            - gherkin: Complete Gherkin feature file content
            - metadata: Generation metadata (provider, model, tokens used)

    Raises:
        HTTPException: 500 if BDD generation fails.
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
