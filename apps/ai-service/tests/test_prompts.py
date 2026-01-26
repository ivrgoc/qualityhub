"""Tests for prompt templates."""

import pytest

from app.prompts.bdd_generation import (
    BDDGenerationPrompts,
    build_bdd_generation_system_prompt,
    build_bdd_generation_user_prompt,
    build_gherkin_formatting_prompt,
)
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


class TestBuildBDDGenerationSystemPrompt:
    """Tests for the BDD system prompt builder."""

    def test_returns_non_empty_string(self) -> None:
        """Test that system prompt returns a non-empty string."""
        result = build_bdd_generation_system_prompt()
        assert isinstance(result, str)
        assert len(result) > 0

    def test_contains_json_format_instructions(self) -> None:
        """Test that system prompt includes JSON format instructions."""
        result = build_bdd_generation_system_prompt()
        assert "JSON" in result
        assert "feature_name" in result
        assert "scenarios" in result

    def test_contains_given_when_then(self) -> None:
        """Test that system prompt explains Given/When/Then structure."""
        result = build_bdd_generation_system_prompt()
        assert "Given" in result
        assert "When" in result
        assert "Then" in result

    def test_contains_gherkin_guidelines(self) -> None:
        """Test that system prompt contains Gherkin writing guidelines."""
        result = build_bdd_generation_system_prompt()
        assert "Gherkin" in result
        assert "Scenario" in result

    def test_contains_scenario_outline_instructions(self) -> None:
        """Test that system prompt explains Scenario Outline with Examples."""
        result = build_bdd_generation_system_prompt()
        assert "Scenario Outline" in result or "Examples" in result

    def test_contains_bdd_expertise_context(self) -> None:
        """Test that system prompt establishes BDD expertise context."""
        result = build_bdd_generation_system_prompt()
        assert "BDD" in result

    def test_contains_tag_instructions(self) -> None:
        """Test that system prompt includes information about tags."""
        result = build_bdd_generation_system_prompt()
        assert "tag" in result.lower() or "@" in result


class TestBuildBDDGenerationUserPrompt:
    """Tests for the BDD user prompt builder."""

    def test_includes_feature_description(self) -> None:
        """Test that user prompt includes the feature description."""
        description = "User registration with email verification"
        result = build_bdd_generation_user_prompt(feature_description=description)
        assert description in result

    def test_includes_max_scenarios(self) -> None:
        """Test that user prompt includes max scenarios count."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            max_scenarios=5,
        )
        assert "5" in result

    def test_includes_context_when_provided(self) -> None:
        """Test that user prompt includes context when provided."""
        context = "E-commerce platform with React frontend"
        result = build_bdd_generation_user_prompt(
            feature_description="Shopping cart feature",
            context=context,
        )
        assert context in result
        assert "Additional Context" in result

    def test_excludes_context_section_when_not_provided(self) -> None:
        """Test that context section is omitted when not provided."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            context=None,
        )
        assert "Additional Context" not in result

    def test_includes_examples_instruction_when_true(self) -> None:
        """Test that user prompt includes examples instruction when enabled."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            include_examples=True,
        )
        assert "Scenario Outline" in result or "Examples" in result

    def test_includes_no_examples_instruction_when_false(self) -> None:
        """Test that user prompt includes no examples instruction when disabled."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            include_examples=False,
        )
        assert "without Examples" in result or "simple Scenario" in result

    def test_includes_tags_instruction_when_true(self) -> None:
        """Test that user prompt includes tags instruction when enabled."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            include_tags=True,
        )
        assert "tag" in result.lower()

    def test_includes_no_tags_instruction_when_false(self) -> None:
        """Test that user prompt includes no tags instruction when disabled."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            include_tags=False,
        )
        assert "not include tags" in result.lower() or "do not" in result.lower()

    def test_requests_json_output(self) -> None:
        """Test that user prompt requests JSON output."""
        result = build_bdd_generation_user_prompt(feature_description="Test feature")
        assert "JSON" in result

    def test_returns_non_empty_string(self) -> None:
        """Test that user prompt returns a non-empty string."""
        result = build_bdd_generation_user_prompt(feature_description="Test feature")
        assert isinstance(result, str)
        assert len(result) > 0


class TestBDDGenerationPrompts:
    """Tests for the BDDGenerationPrompts class."""

    def test_system_prompt_is_defined(self) -> None:
        """Test that SYSTEM_PROMPT class attribute is defined."""
        assert hasattr(BDDGenerationPrompts, "SYSTEM_PROMPT")
        assert isinstance(BDDGenerationPrompts.SYSTEM_PROMPT, str)
        assert len(BDDGenerationPrompts.SYSTEM_PROMPT) > 0

    def test_user_prompt_template_is_defined(self) -> None:
        """Test that USER_PROMPT_TEMPLATE class attribute is defined."""
        assert hasattr(BDDGenerationPrompts, "USER_PROMPT_TEMPLATE")
        assert isinstance(BDDGenerationPrompts.USER_PROMPT_TEMPLATE, str)
        assert len(BDDGenerationPrompts.USER_PROMPT_TEMPLATE) > 0

    def test_gherkin_formatting_template_is_defined(self) -> None:
        """Test that GHERKIN_FORMATTING_TEMPLATE class attribute is defined."""
        assert hasattr(BDDGenerationPrompts, "GHERKIN_FORMATTING_TEMPLATE")
        assert isinstance(BDDGenerationPrompts.GHERKIN_FORMATTING_TEMPLATE, str)
        assert len(BDDGenerationPrompts.GHERKIN_FORMATTING_TEMPLATE) > 0

    def test_scenario_focus_instructions_contains_all_types(self) -> None:
        """Test that SCENARIO_FOCUS_INSTRUCTIONS contains all scenario types."""
        instructions = BDDGenerationPrompts.SCENARIO_FOCUS_INSTRUCTIONS
        assert "happy_path" in instructions
        assert "error_handling" in instructions
        assert "validation" in instructions
        assert "security" in instructions
        assert "comprehensive" in instructions

    def test_user_prompt_template_has_placeholders(self) -> None:
        """Test that USER_PROMPT_TEMPLATE has required placeholders."""
        template = BDDGenerationPrompts.USER_PROMPT_TEMPLATE
        assert "{feature_description}" in template
        assert "{max_scenarios}" in template
        assert "{scenario_focus}" in template


class TestBuildGherkinFormattingPrompt:
    """Tests for the Gherkin formatting prompt builder."""

    def test_includes_feature_name(self) -> None:
        """Test that prompt includes the feature name."""
        result = build_gherkin_formatting_prompt(
            feature_name="User Login",
            feature_description="Users can log in to the system",
            scenarios_json="[]",
        )
        assert "User Login" in result

    def test_includes_feature_description(self) -> None:
        """Test that prompt includes the feature description."""
        description = "Users can log in to the system"
        result = build_gherkin_formatting_prompt(
            feature_name="User Login",
            feature_description=description,
            scenarios_json="[]",
        )
        assert description in result

    def test_includes_scenarios_json(self) -> None:
        """Test that prompt includes the scenarios JSON."""
        scenarios = '[{"name": "Test Scenario"}]'
        result = build_gherkin_formatting_prompt(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios_json=scenarios,
        )
        assert scenarios in result

    def test_includes_background_when_provided(self) -> None:
        """Test that prompt includes background when provided."""
        background = '{"given": ["the user is logged in"]}'
        result = build_gherkin_formatting_prompt(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios_json="[]",
            background=background,
        )
        assert background in result

    def test_shows_none_when_background_not_provided(self) -> None:
        """Test that prompt shows 'None' when background not provided."""
        result = build_gherkin_formatting_prompt(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios_json="[]",
            background=None,
        )
        assert "None" in result

    def test_returns_non_empty_string(self) -> None:
        """Test that prompt returns a non-empty string."""
        result = build_gherkin_formatting_prompt(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios_json="[]",
        )
        assert isinstance(result, str)
        assert len(result) > 0


class TestBDDPromptIntegration:
    """Integration tests for BDD prompt building."""

    @pytest.mark.parametrize(
        "scenario_focus",
        ["happy_path", "error_handling", "validation", "security", "comprehensive"],
    )
    def test_user_prompt_handles_all_scenario_focuses(self, scenario_focus: str) -> None:
        """Test that user prompt handles all valid scenario focus types."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            scenario_focus=scenario_focus,  # type: ignore[arg-type]
        )
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.parametrize(
        "include_examples,include_tags",
        [
            (True, True),
            (True, False),
            (False, True),
            (False, False),
        ],
    )
    def test_user_prompt_handles_boolean_flags(
        self, include_examples: bool, include_tags: bool
    ) -> None:
        """Test that user prompt handles all boolean flag combinations."""
        result = build_bdd_generation_user_prompt(
            feature_description="Test feature",
            include_examples=include_examples,
            include_tags=include_tags,
        )
        assert isinstance(result, str)
        assert len(result) > 0

    def test_full_bdd_prompt_combination(self) -> None:
        """Test building BDD prompts with all parameters specified."""
        system_prompt = build_bdd_generation_system_prompt()
        user_prompt = build_bdd_generation_user_prompt(
            feature_description="User registration with email verification",
            max_scenarios=5,
            context="Web application with React frontend and NestJS backend",
            scenario_focus="comprehensive",
            include_examples=True,
            include_tags=True,
        )

        assert isinstance(system_prompt, str)
        assert isinstance(user_prompt, str)
        assert "User registration with email verification" in user_prompt
        assert "React frontend" in user_prompt
        assert "5" in user_prompt

    def test_gherkin_formatting_with_all_params(self) -> None:
        """Test building Gherkin formatting prompt with all parameters."""
        result = build_gherkin_formatting_prompt(
            feature_name="User Authentication",
            feature_description="Users can authenticate with various methods",
            scenarios_json='[{"name": "Login with password", "given": ["user exists"]}]',
            background='{"given": ["the application is running"]}',
        )

        assert "User Authentication" in result
        assert "authenticate" in result
        assert "Login with password" in result
        assert "application is running" in result
