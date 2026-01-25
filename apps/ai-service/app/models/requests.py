"""Request models for AI service endpoints."""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class TestGenerationRequest(BaseModel):
    """Request model for generating test cases from requirements or descriptions."""

    description: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="The requirement or feature description to generate tests from",
    )
    context: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Additional context about the application or feature",
    )
    test_type: Literal["functional", "edge_case", "negative", "all"] = Field(
        default="all",
        description="Type of test cases to generate",
    )
    max_tests: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of test cases to generate",
    )
    priority: Optional[Literal["critical", "high", "medium", "low"]] = Field(
        default=None,
        description="Priority level for generated test cases",
    )


class BDDGenerationRequest(BaseModel):
    """Request model for generating BDD scenarios (Gherkin format)."""

    feature_description: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Description of the feature to generate BDD scenarios for",
    )
    context: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Additional context about the application or feature",
    )
    max_scenarios: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Maximum number of scenarios to generate",
    )
    include_examples: bool = Field(
        default=True,
        description="Whether to include Scenario Outline examples",
    )


class CoverageSuggestionRequest(BaseModel):
    """Request model for suggesting test coverage improvements."""

    existing_tests: List[str] = Field(
        ...,
        min_length=1,
        description="List of existing test case titles or descriptions",
    )
    feature_description: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Description of the feature being tested",
    )
    context: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Additional context about the application",
    )
