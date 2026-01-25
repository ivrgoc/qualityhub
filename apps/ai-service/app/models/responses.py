"""Response models for AI service endpoints."""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response model."""

    status: Literal["healthy", "unhealthy"] = "healthy"
    version: str
    environment: str


class TestStep(BaseModel):
    """A single test step."""

    step_number: int = Field(..., ge=1)
    action: str = Field(..., description="The action to perform")
    expected_result: str = Field(..., description="The expected result of the action")


class GeneratedTestCase(BaseModel):
    """A generated test case."""

    title: str = Field(..., description="Test case title")
    preconditions: Optional[str] = Field(
        default=None,
        description="Preconditions that must be met before executing the test",
    )
    steps: List[TestStep] = Field(..., description="Test steps to execute")
    expected_result: str = Field(..., description="Overall expected result")
    priority: Literal["critical", "high", "medium", "low"] = Field(
        default="medium",
        description="Test case priority",
    )
    test_type: Literal["functional", "edge_case", "negative"] = Field(
        ...,
        description="Type of test case",
    )


class TestGenerationResponse(BaseModel):
    """Response model for test generation endpoint."""

    test_cases: List[GeneratedTestCase] = Field(..., description="Generated test cases")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata about the generation",
    )


class BDDScenario(BaseModel):
    """A BDD scenario in Gherkin format."""

    name: str = Field(..., description="Scenario name")
    given: List[str] = Field(..., description="Given steps (preconditions)")
    when: List[str] = Field(..., description="When steps (actions)")
    then: List[str] = Field(..., description="Then steps (expected outcomes)")
    examples: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Examples for Scenario Outline",
    )


class BDDGenerationResponse(BaseModel):
    """Response model for BDD generation endpoint."""

    feature_name: str = Field(..., description="Name of the feature")
    feature_description: str = Field(..., description="Description of the feature")
    scenarios: List[BDDScenario] = Field(..., description="Generated BDD scenarios")
    gherkin: str = Field(..., description="Complete Gherkin feature file content")


class CoverageSuggestion(BaseModel):
    """A suggested test case for improving coverage."""

    title: str = Field(..., description="Suggested test case title")
    rationale: str = Field(..., description="Why this test is needed")
    priority: Literal["critical", "high", "medium", "low"] = Field(
        ...,
        description="Suggested priority",
    )
    coverage_area: str = Field(
        ...,
        description="Area of coverage this test addresses",
    )


class CoverageSuggestionResponse(BaseModel):
    """Response model for coverage suggestion endpoint."""

    suggestions: List[CoverageSuggestion] = Field(
        ...,
        description="Suggested test cases for improving coverage",
    )
    coverage_gaps: List[str] = Field(
        ...,
        description="Identified gaps in test coverage",
    )
    overall_assessment: str = Field(
        ...,
        description="Overall assessment of current test coverage",
    )
