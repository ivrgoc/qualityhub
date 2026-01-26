"""Tests for prompt templates."""

import pytest

from app.prompts.test_generation import (
    TestGenerationPrompts,
    build_test_generation_system_prompt,
    build_test_generation_user_prompt,
)


class TestBuildTestGenerationSystemPrompt:
    """Tests for the system prompt builder."""

    def test_returns_non_empty_string(self) -> None:
        """Test that system prompt returns a non-empty string."""
        result = build_test_generation_system_prompt()
        assert isinstance(result, str)
        assert len(result) > 0

    def test_contains_json_format_instructions(self) -> None:
        """Test that system prompt includes JSON format instructions."""
        result = build_test_generation_system_prompt()
        assert "JSON" in result
        assert "title" in result
        assert "steps" in result
        assert "expected_result" in result

    def test_contains_test_type_definitions(self) -> None:
        """Test that system prompt defines test types."""
        result = build_test_generation_system_prompt()
        assert "functional" in result
        assert "edge_case" in result
        assert "negative" in result

    def test_contains_priority_definitions(self) -> None:
        """Test that system prompt defines priority levels."""
        result = build_test_generation_system_prompt()
        assert "critical" in result
        assert "high" in result
        assert "medium" in result
        assert "low" in result

    def test_contains_qa_expertise_context(self) -> None:
        """Test that system prompt establishes QA expertise context."""
        result = build_test_generation_system_prompt()
        assert "QA" in result or "test" in result.lower()


class TestBuildTestGenerationUserPrompt:
    """Tests for the user prompt builder."""

    def test_includes_description(self) -> None:
        """Test that user prompt includes the description."""
        description = "User authentication with OAuth2"
        result = build_test_generation_user_prompt(description=description)
        assert description in result

    def test_includes_max_tests(self) -> None:
        """Test that user prompt includes max tests count."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            max_tests=10,
        )
        assert "10" in result

    def test_includes_test_type_all(self) -> None:
        """Test that user prompt includes test type instruction for 'all'."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            test_type="all",
        )
        assert "functional" in result.lower()
        assert "edge" in result.lower()
        assert "negative" in result.lower()

    def test_includes_test_type_functional(self) -> None:
        """Test that user prompt includes correct instruction for functional tests."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            test_type="functional",
        )
        assert "functional" in result.lower()

    def test_includes_test_type_edge_case(self) -> None:
        """Test that user prompt includes correct instruction for edge case tests."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            test_type="edge_case",
        )
        assert "edge" in result.lower()
        assert "boundary" in result.lower()

    def test_includes_test_type_negative(self) -> None:
        """Test that user prompt includes correct instruction for negative tests."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            test_type="negative",
        )
        assert "negative" in result.lower()
        assert "invalid" in result.lower() or "error" in result.lower()

    def test_includes_context_when_provided(self) -> None:
        """Test that user prompt includes context when provided."""
        context = "This is an e-commerce application"
        result = build_test_generation_user_prompt(
            description="Checkout feature",
            context=context,
        )
        assert context in result
        assert "Additional Context" in result

    def test_excludes_context_section_when_not_provided(self) -> None:
        """Test that context section is omitted when not provided."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            context=None,
        )
        assert "Additional Context" not in result

    def test_includes_specified_priority(self) -> None:
        """Test that user prompt includes specified priority."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            priority="critical",
        )
        assert "critical" in result

    def test_assigns_appropriate_priority_when_not_specified(self) -> None:
        """Test that prompt asks for appropriate priority when not specified."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            priority=None,
        )
        assert "appropriate priority" in result.lower() or "based on" in result.lower()

    def test_requests_json_output(self) -> None:
        """Test that user prompt requests JSON output."""
        result = build_test_generation_user_prompt(description="Test feature")
        assert "JSON" in result

    def test_returns_non_empty_string(self) -> None:
        """Test that user prompt returns a non-empty string."""
        result = build_test_generation_user_prompt(description="Test feature")
        assert isinstance(result, str)
        assert len(result) > 0


class TestTestGenerationPrompts:
    """Tests for the TestGenerationPrompts class."""

    def test_system_prompt_is_defined(self) -> None:
        """Test that SYSTEM_PROMPT class attribute is defined."""
        assert hasattr(TestGenerationPrompts, "SYSTEM_PROMPT")
        assert isinstance(TestGenerationPrompts.SYSTEM_PROMPT, str)
        assert len(TestGenerationPrompts.SYSTEM_PROMPT) > 0

    def test_user_prompt_template_is_defined(self) -> None:
        """Test that USER_PROMPT_TEMPLATE class attribute is defined."""
        assert hasattr(TestGenerationPrompts, "USER_PROMPT_TEMPLATE")
        assert isinstance(TestGenerationPrompts.USER_PROMPT_TEMPLATE, str)
        assert len(TestGenerationPrompts.USER_PROMPT_TEMPLATE) > 0

    def test_test_type_instructions_contains_all_types(self) -> None:
        """Test that TEST_TYPE_INSTRUCTIONS contains all test types."""
        instructions = TestGenerationPrompts.TEST_TYPE_INSTRUCTIONS
        assert "functional" in instructions
        assert "edge_case" in instructions
        assert "negative" in instructions
        assert "all" in instructions

    def test_user_prompt_template_has_placeholders(self) -> None:
        """Test that USER_PROMPT_TEMPLATE has required placeholders."""
        template = TestGenerationPrompts.USER_PROMPT_TEMPLATE
        assert "{description}" in template
        assert "{max_tests}" in template
        assert "{test_type}" in template


class TestPromptIntegration:
    """Integration tests for prompt building."""

    @pytest.mark.parametrize(
        "test_type",
        ["functional", "edge_case", "negative", "all"],
    )
    def test_user_prompt_handles_all_test_types(self, test_type: str) -> None:
        """Test that user prompt handles all valid test types."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            test_type=test_type,  # type: ignore[arg-type]
        )
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.parametrize(
        "priority",
        ["critical", "high", "medium", "low"],
    )
    def test_user_prompt_handles_all_priorities(self, priority: str) -> None:
        """Test that user prompt handles all valid priorities."""
        result = build_test_generation_user_prompt(
            description="Test feature",
            priority=priority,  # type: ignore[arg-type]
        )
        assert priority in result

    def test_full_prompt_combination(self) -> None:
        """Test building prompts with all parameters specified."""
        system_prompt = build_test_generation_system_prompt()
        user_prompt = build_test_generation_user_prompt(
            description="User login with email and password",
            test_type="all",
            max_tests=5,
            context="Web application with React frontend and NestJS backend",
            priority="high",
        )

        assert isinstance(system_prompt, str)
        assert isinstance(user_prompt, str)
        assert "User login with email and password" in user_prompt
        assert "React frontend" in user_prompt
        assert "high" in user_prompt
        assert "5" in user_prompt
