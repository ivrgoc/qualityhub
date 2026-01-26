"""Pydantic schemas for AI generation operations.

This module defines the request/response models used for AI-powered
test case and BDD scenario generation, including LLM configuration,
prompt templates, and structured output schemas.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, field_validator


class GenerationStatus(str, Enum):
    """Status of a generation request."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class LLMMessage(BaseModel):
    """A message in an LLM conversation."""

    role: Literal["system", "user", "assistant"] = Field(
        ...,
        description="Role of the message sender",
    )
    content: str = Field(
        ...,
        min_length=1,
        description="Content of the message",
    )


class LLMPrompt(BaseModel):
    """Complete prompt structure for LLM requests."""

    messages: List[LLMMessage] = Field(
        ...,
        min_length=1,
        description="List of messages forming the conversation",
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperature for response generation",
    )
    max_tokens: int = Field(
        default=4096,
        ge=1,
        le=128000,
        description="Maximum tokens in the response",
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use (overrides default)",
    )

    @field_validator("messages")
    @classmethod
    def validate_messages_order(cls, v: List[LLMMessage]) -> List[LLMMessage]:
        """Validate that messages start with a system message if present."""
        if v and v[0].role == "system" and len(v) > 1:
            # System message should be first if present
            for msg in v[1:]:
                if msg.role == "system":
                    raise ValueError("System message must be the first message")
        return v


class PromptTemplate(BaseModel):
    """Template for generating prompts."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Template identifier name",
    )
    system_prompt: str = Field(
        ...,
        min_length=10,
        description="System prompt defining AI behavior",
    )
    user_prompt_template: str = Field(
        ...,
        min_length=10,
        description="User prompt template with {placeholders}",
    )
    variables: List[str] = Field(
        default_factory=list,
        description="List of variable names expected in the template",
    )
    examples: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Few-shot examples for the prompt",
    )


class StructuredOutputSchema(BaseModel):
    """Schema definition for structured LLM outputs."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Schema name",
    )
    description: str = Field(
        ...,
        min_length=1,
        description="Description of what this schema represents",
    )
    json_schema: Dict[str, Any] = Field(
        ...,
        description="JSON Schema definition for the output",
    )
    strict: bool = Field(
        default=True,
        description="Whether to enforce strict schema adherence",
    )


class GenerationConfig(BaseModel):
    """Configuration for generation operations."""

    provider: Literal["openai", "anthropic"] = Field(
        default="openai",
        description="AI provider to use for generation",
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use (uses provider default if not set)",
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperature for generation creativity",
    )
    max_tokens: int = Field(
        default=4096,
        ge=1,
        le=128000,
        description="Maximum tokens in the response",
    )
    timeout_seconds: int = Field(
        default=60,
        ge=1,
        le=300,
        description="Request timeout in seconds",
    )
    retry_count: int = Field(
        default=3,
        ge=0,
        le=5,
        description="Number of retry attempts on failure",
    )
    use_structured_output: bool = Field(
        default=True,
        description="Whether to use structured JSON output mode",
    )


class TestCaseGenerationParams(BaseModel):
    """Parameters specific to test case generation."""

    description: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Feature or requirement description",
    )
    context: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Additional context about the application",
    )
    test_type: Literal["functional", "edge_case", "negative", "all"] = Field(
        default="all",
        description="Type of test cases to generate",
    )
    max_tests: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of test cases",
    )
    priority: Optional[Literal["critical", "high", "medium", "low"]] = Field(
        default=None,
        description="Priority level for generated tests",
    )
    include_preconditions: bool = Field(
        default=True,
        description="Whether to include preconditions in tests",
    )
    include_expected_results: bool = Field(
        default=True,
        description="Whether to include expected results",
    )


class BDDGenerationParams(BaseModel):
    """Parameters specific to BDD scenario generation."""

    feature_description: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Description of the feature",
    )
    context: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Additional context about the application",
    )
    max_scenarios: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Maximum number of scenarios",
    )
    include_examples: bool = Field(
        default=True,
        description="Whether to include Scenario Outline examples",
    )
    include_background: bool = Field(
        default=False,
        description="Whether to include Background section",
    )
    tags: Optional[List[str]] = Field(
        default=None,
        description="Tags to apply to scenarios (e.g., @smoke, @regression)",
    )


class CoverageGenerationParams(BaseModel):
    """Parameters specific to coverage suggestion generation."""

    existing_tests: List[str] = Field(
        ...,
        min_length=1,
        description="List of existing test case titles",
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
    coverage_areas: Optional[List[str]] = Field(
        default=None,
        description="Specific coverage areas to focus on",
    )
    max_suggestions: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of suggestions",
    )


class GenerationRequest(BaseModel):
    """Base request model for all generation operations."""

    request_id: UUID = Field(
        default_factory=uuid4,
        description="Unique identifier for this request",
    )
    generation_type: Literal["test_case", "bdd", "coverage"] = Field(
        ...,
        description="Type of generation to perform",
    )
    config: GenerationConfig = Field(
        default_factory=GenerationConfig,
        description="Generation configuration",
    )
    test_case_params: Optional[TestCaseGenerationParams] = Field(
        default=None,
        description="Parameters for test case generation",
    )
    bdd_params: Optional[BDDGenerationParams] = Field(
        default=None,
        description="Parameters for BDD generation",
    )
    coverage_params: Optional[CoverageGenerationParams] = Field(
        default=None,
        description="Parameters for coverage generation",
    )

    def model_post_init(self, __context: Any) -> None:
        """Validate that appropriate params are set for generation type."""
        if self.generation_type == "test_case" and self.test_case_params is None:
            raise ValueError("test_case_params required for test_case generation")
        if self.generation_type == "bdd" and self.bdd_params is None:
            raise ValueError("bdd_params required for bdd generation")
        if self.generation_type == "coverage" and self.coverage_params is None:
            raise ValueError("coverage_params required for coverage generation")


class GenerationMetadata(BaseModel):
    """Metadata about a generation operation."""

    request_id: UUID = Field(
        ...,
        description="The request identifier",
    )
    provider: str = Field(
        ...,
        description="AI provider used",
    )
    model: str = Field(
        ...,
        description="Model used for generation",
    )
    tokens_used: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total tokens consumed",
    )
    prompt_tokens: Optional[int] = Field(
        default=None,
        ge=0,
        description="Tokens used in the prompt",
    )
    completion_tokens: Optional[int] = Field(
        default=None,
        ge=0,
        description="Tokens used in the completion",
    )
    generation_time_ms: Optional[int] = Field(
        default=None,
        ge=0,
        description="Time taken to generate response in milliseconds",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the generation was created",
    )


class GenerationResponse(BaseModel):
    """Base response model for all generation operations."""

    request_id: UUID = Field(
        ...,
        description="The original request identifier",
    )
    status: GenerationStatus = Field(
        ...,
        description="Status of the generation",
    )
    metadata: GenerationMetadata = Field(
        ...,
        description="Generation metadata",
    )
    result: Optional[Dict[str, Any]] = Field(
        default=None,
        description="The generated result (structure depends on generation type)",
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message if generation failed",
    )

    @property
    def is_successful(self) -> bool:
        """Check if the generation was successful."""
        return self.status == GenerationStatus.COMPLETED and self.result is not None
