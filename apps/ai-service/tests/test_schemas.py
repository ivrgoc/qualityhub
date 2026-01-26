"""Tests for generation schemas."""

from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas.generation import (
    BDDGenerationParams,
    CoverageGenerationParams,
    GenerationConfig,
    GenerationMetadata,
    GenerationRequest,
    GenerationResponse,
    GenerationStatus,
    LLMMessage,
    LLMPrompt,
    PromptTemplate,
    StructuredOutputSchema,
    TestCaseGenerationParams,
)


class TestLLMMessage:
    """Tests for LLMMessage schema."""

    def test_valid_system_message(self) -> None:
        """Test creating a valid system message."""
        msg = LLMMessage(role="system", content="You are a helpful assistant.")
        assert msg.role == "system"
        assert msg.content == "You are a helpful assistant."

    def test_valid_user_message(self) -> None:
        """Test creating a valid user message."""
        msg = LLMMessage(role="user", content="Generate test cases")
        assert msg.role == "user"

    def test_valid_assistant_message(self) -> None:
        """Test creating a valid assistant message."""
        msg = LLMMessage(role="assistant", content="Here are your test cases...")
        assert msg.role == "assistant"

    def test_invalid_role(self) -> None:
        """Test that invalid role raises validation error."""
        with pytest.raises(ValidationError):
            LLMMessage(role="invalid", content="test")  # type: ignore

    def test_empty_content_rejected(self) -> None:
        """Test that empty content is rejected."""
        with pytest.raises(ValidationError):
            LLMMessage(role="user", content="")


class TestLLMPrompt:
    """Tests for LLMPrompt schema."""

    def test_valid_prompt(self) -> None:
        """Test creating a valid prompt."""
        prompt = LLMPrompt(
            messages=[
                LLMMessage(role="system", content="You are a test generator."),
                LLMMessage(role="user", content="Generate tests for login."),
            ]
        )
        assert len(prompt.messages) == 2
        assert prompt.temperature == 0.7
        assert prompt.max_tokens == 4096

    def test_custom_temperature(self) -> None:
        """Test custom temperature setting."""
        prompt = LLMPrompt(
            messages=[LLMMessage(role="user", content="Test")],
            temperature=0.5,
        )
        assert prompt.temperature == 0.5

    def test_temperature_bounds(self) -> None:
        """Test temperature validation bounds."""
        with pytest.raises(ValidationError):
            LLMPrompt(
                messages=[LLMMessage(role="user", content="Test")],
                temperature=2.5,  # Max is 2.0
            )

    def test_max_tokens_bounds(self) -> None:
        """Test max_tokens validation bounds."""
        with pytest.raises(ValidationError):
            LLMPrompt(
                messages=[LLMMessage(role="user", content="Test")],
                max_tokens=0,  # Min is 1
            )

    def test_empty_messages_rejected(self) -> None:
        """Test that empty messages list is rejected."""
        with pytest.raises(ValidationError):
            LLMPrompt(messages=[])

    def test_system_message_after_first_rejected(self) -> None:
        """Test that system message after first position is rejected."""
        with pytest.raises(ValidationError):
            LLMPrompt(
                messages=[
                    LLMMessage(role="system", content="First system"),
                    LLMMessage(role="user", content="User message"),
                    LLMMessage(role="system", content="Second system"),
                ]
            )


class TestPromptTemplate:
    """Tests for PromptTemplate schema."""

    def test_valid_template(self) -> None:
        """Test creating a valid template."""
        template = PromptTemplate(
            name="test_generator",
            system_prompt="You are an expert QA engineer.",
            user_prompt_template="Generate tests for: {description}",
            variables=["description"],
        )
        assert template.name == "test_generator"
        assert "{description}" in template.user_prompt_template

    def test_template_with_examples(self) -> None:
        """Test template with few-shot examples."""
        template = PromptTemplate(
            name="bdd_generator",
            system_prompt="You generate BDD scenarios.",
            user_prompt_template="Feature: {feature}",
            variables=["feature"],
            examples=[
                {"input": "Login feature", "output": "Scenario: User logs in"},
            ],
        )
        assert template.examples is not None
        assert len(template.examples) == 1

    def test_name_length_limits(self) -> None:
        """Test name length validation."""
        with pytest.raises(ValidationError):
            PromptTemplate(
                name="",  # Min length 1
                system_prompt="Valid prompt.",
                user_prompt_template="Valid template.",
            )


class TestStructuredOutputSchema:
    """Tests for StructuredOutputSchema."""

    def test_valid_schema(self) -> None:
        """Test creating a valid structured output schema."""
        schema = StructuredOutputSchema(
            name="test_case",
            description="Schema for generated test cases",
            json_schema={
                "type": "object",
                "properties": {"title": {"type": "string"}},
            },
        )
        assert schema.name == "test_case"
        assert schema.strict is True

    def test_non_strict_schema(self) -> None:
        """Test creating a non-strict schema."""
        schema = StructuredOutputSchema(
            name="flexible_output",
            description="A flexible schema",
            json_schema={"type": "object"},
            strict=False,
        )
        assert schema.strict is False


class TestGenerationConfig:
    """Tests for GenerationConfig schema."""

    def test_default_config(self) -> None:
        """Test default configuration values."""
        config = GenerationConfig()
        assert config.provider == "openai"
        assert config.temperature == 0.7
        assert config.max_tokens == 4096
        assert config.timeout_seconds == 60
        assert config.retry_count == 3
        assert config.use_structured_output is True

    def test_anthropic_provider(self) -> None:
        """Test setting Anthropic as provider."""
        config = GenerationConfig(provider="anthropic")
        assert config.provider == "anthropic"

    def test_invalid_provider(self) -> None:
        """Test that invalid provider raises error."""
        with pytest.raises(ValidationError):
            GenerationConfig(provider="invalid")  # type: ignore

    def test_custom_model(self) -> None:
        """Test setting custom model."""
        config = GenerationConfig(model="gpt-4-turbo")
        assert config.model == "gpt-4-turbo"

    def test_timeout_bounds(self) -> None:
        """Test timeout validation bounds."""
        with pytest.raises(ValidationError):
            GenerationConfig(timeout_seconds=301)  # Max is 300

    def test_retry_count_bounds(self) -> None:
        """Test retry count validation bounds."""
        with pytest.raises(ValidationError):
            GenerationConfig(retry_count=6)  # Max is 5


class TestTestCaseGenerationParams:
    """Tests for TestCaseGenerationParams schema."""

    def test_valid_params(self) -> None:
        """Test creating valid test case generation params."""
        params = TestCaseGenerationParams(
            description="User authentication with OAuth2 support"
        )
        assert params.test_type == "all"
        assert params.max_tests == 5
        assert params.include_preconditions is True

    def test_all_options(self) -> None:
        """Test with all options specified."""
        params = TestCaseGenerationParams(
            description="Complex feature description",
            context="Enterprise application context",
            test_type="functional",
            max_tests=10,
            priority="high",
            include_preconditions=False,
            include_expected_results=True,
        )
        assert params.test_type == "functional"
        assert params.max_tests == 10
        assert params.priority == "high"

    def test_description_length_validation(self) -> None:
        """Test description length validation."""
        with pytest.raises(ValidationError):
            TestCaseGenerationParams(description="short")  # Min 10 chars

    def test_max_tests_bounds(self) -> None:
        """Test max_tests validation bounds."""
        with pytest.raises(ValidationError):
            TestCaseGenerationParams(
                description="Valid description here",
                max_tests=25,  # Max is 20
            )

    def test_valid_test_types(self) -> None:
        """Test all valid test types."""
        for test_type in ["functional", "edge_case", "negative", "all"]:
            params = TestCaseGenerationParams(
                description="Valid description",
                test_type=test_type,  # type: ignore
            )
            assert params.test_type == test_type


class TestBDDGenerationParams:
    """Tests for BDDGenerationParams schema."""

    def test_valid_params(self) -> None:
        """Test creating valid BDD generation params."""
        params = BDDGenerationParams(
            feature_description="User registration with email verification"
        )
        assert params.max_scenarios == 3
        assert params.include_examples is True
        assert params.include_background is False

    def test_with_tags(self) -> None:
        """Test BDD params with tags."""
        params = BDDGenerationParams(
            feature_description="Feature with tags",
            tags=["@smoke", "@regression"],
        )
        assert params.tags == ["@smoke", "@regression"]

    def test_max_scenarios_bounds(self) -> None:
        """Test max_scenarios validation bounds."""
        with pytest.raises(ValidationError):
            BDDGenerationParams(
                feature_description="Valid description",
                max_scenarios=15,  # Max is 10
            )


class TestCoverageGenerationParams:
    """Tests for CoverageGenerationParams schema."""

    def test_valid_params(self) -> None:
        """Test creating valid coverage generation params."""
        params = CoverageGenerationParams(
            existing_tests=["Test login", "Test logout"],
            feature_description="User authentication module",
        )
        assert len(params.existing_tests) == 2
        assert params.max_suggestions == 5

    def test_empty_existing_tests_rejected(self) -> None:
        """Test that empty existing tests list is rejected."""
        with pytest.raises(ValidationError):
            CoverageGenerationParams(
                existing_tests=[],  # Min length 1
                feature_description="Valid description",
            )

    def test_with_coverage_areas(self) -> None:
        """Test with specific coverage areas."""
        params = CoverageGenerationParams(
            existing_tests=["Test 1"],
            feature_description="Feature description",
            coverage_areas=["security", "performance", "edge cases"],
        )
        assert params.coverage_areas == ["security", "performance", "edge cases"]


class TestGenerationRequest:
    """Tests for GenerationRequest schema."""

    def test_test_case_request(self) -> None:
        """Test creating a test case generation request."""
        request = GenerationRequest(
            generation_type="test_case",
            test_case_params=TestCaseGenerationParams(
                description="Feature description for test generation"
            ),
        )
        assert request.generation_type == "test_case"
        assert request.test_case_params is not None
        assert isinstance(request.request_id, UUID)

    def test_bdd_request(self) -> None:
        """Test creating a BDD generation request."""
        request = GenerationRequest(
            generation_type="bdd",
            bdd_params=BDDGenerationParams(
                feature_description="Feature for BDD scenarios"
            ),
        )
        assert request.generation_type == "bdd"
        assert request.bdd_params is not None

    def test_coverage_request(self) -> None:
        """Test creating a coverage generation request."""
        request = GenerationRequest(
            generation_type="coverage",
            coverage_params=CoverageGenerationParams(
                existing_tests=["Test 1", "Test 2"],
                feature_description="Feature for coverage analysis",
            ),
        )
        assert request.generation_type == "coverage"
        assert request.coverage_params is not None

    def test_missing_params_for_type_rejected(self) -> None:
        """Test that missing params for generation type is rejected."""
        with pytest.raises(ValidationError):
            GenerationRequest(
                generation_type="test_case",
                # Missing test_case_params
            )

    def test_custom_config(self) -> None:
        """Test request with custom config."""
        request = GenerationRequest(
            generation_type="test_case",
            config=GenerationConfig(provider="anthropic", temperature=0.5),
            test_case_params=TestCaseGenerationParams(
                description="Description for testing"
            ),
        )
        assert request.config.provider == "anthropic"
        assert request.config.temperature == 0.5


class TestGenerationMetadata:
    """Tests for GenerationMetadata schema."""

    def test_minimal_metadata(self) -> None:
        """Test creating minimal metadata."""
        from uuid import uuid4

        request_id = uuid4()
        metadata = GenerationMetadata(
            request_id=request_id,
            provider="openai",
            model="gpt-4-turbo",
        )
        assert metadata.request_id == request_id
        assert metadata.provider == "openai"
        assert metadata.tokens_used is None

    def test_full_metadata(self) -> None:
        """Test creating full metadata with token counts."""
        from uuid import uuid4

        metadata = GenerationMetadata(
            request_id=uuid4(),
            provider="anthropic",
            model="claude-3-sonnet",
            tokens_used=1500,
            prompt_tokens=500,
            completion_tokens=1000,
            generation_time_ms=2500,
        )
        assert metadata.tokens_used == 1500
        assert metadata.prompt_tokens == 500
        assert metadata.completion_tokens == 1000
        assert metadata.generation_time_ms == 2500

    def test_created_at_default(self) -> None:
        """Test that created_at has a default value."""
        from uuid import uuid4

        metadata = GenerationMetadata(
            request_id=uuid4(),
            provider="openai",
            model="gpt-4",
        )
        assert metadata.created_at is not None


class TestGenerationResponse:
    """Tests for GenerationResponse schema."""

    def test_successful_response(self) -> None:
        """Test creating a successful response."""
        from uuid import uuid4

        request_id = uuid4()
        response = GenerationResponse(
            request_id=request_id,
            status=GenerationStatus.COMPLETED,
            metadata=GenerationMetadata(
                request_id=request_id,
                provider="openai",
                model="gpt-4",
            ),
            result={"test_cases": [{"title": "Test 1"}]},
        )
        assert response.is_successful is True
        assert response.error is None

    def test_failed_response(self) -> None:
        """Test creating a failed response."""
        from uuid import uuid4

        request_id = uuid4()
        response = GenerationResponse(
            request_id=request_id,
            status=GenerationStatus.FAILED,
            metadata=GenerationMetadata(
                request_id=request_id,
                provider="openai",
                model="gpt-4",
            ),
            error="API rate limit exceeded",
        )
        assert response.is_successful is False
        assert response.error == "API rate limit exceeded"

    def test_all_statuses(self) -> None:
        """Test all possible generation statuses."""
        from uuid import uuid4

        request_id = uuid4()
        for status in GenerationStatus:
            response = GenerationResponse(
                request_id=request_id,
                status=status,
                metadata=GenerationMetadata(
                    request_id=request_id,
                    provider="openai",
                    model="gpt-4",
                ),
            )
            assert response.status == status


class TestGenerationStatus:
    """Tests for GenerationStatus enum."""

    def test_all_status_values(self) -> None:
        """Test all status enum values."""
        assert GenerationStatus.PENDING.value == "pending"
        assert GenerationStatus.IN_PROGRESS.value == "in_progress"
        assert GenerationStatus.COMPLETED.value == "completed"
        assert GenerationStatus.FAILED.value == "failed"
        assert GenerationStatus.CANCELLED.value == "cancelled"

    def test_status_is_string_enum(self) -> None:
        """Test that status values are strings."""
        for status in GenerationStatus:
            assert isinstance(status.value, str)
