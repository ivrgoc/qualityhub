"""Tests for service classes."""

import json
from typing import Any, Dict
from unittest.mock import AsyncMock, patch

import pytest

from app.services.bdd_generator import BDDGenerationError, BDDGenerator
from app.services.llm_client import LLMClientError, LLMResponse
from app.services.test_generator import TestGenerationError, TestGenerator


class TestTestGenerator:
    """Tests for the TestGenerator service."""

    @pytest.fixture
    def generator(self) -> TestGenerator:
        """Create a TestGenerator instance with mock mode enabled."""
        return TestGenerator(use_ai=False)

    @pytest.fixture
    def ai_generator(self) -> TestGenerator:
        """Create a TestGenerator instance with AI enabled."""
        return TestGenerator(api_key="test-key", provider="openai", use_ai=True)

    @pytest.mark.asyncio
    async def test_generate_returns_test_cases(self, generator: TestGenerator) -> None:
        """Test that generate returns test cases."""
        result = await generator.generate(
            description="User authentication with OAuth2",
            max_tests=3,
        )

        assert result.test_cases is not None
        assert len(result.test_cases) > 0

    @pytest.mark.asyncio
    async def test_generate_respects_max_tests(self, generator: TestGenerator) -> None:
        """Test that generate respects max_tests limit."""
        result = await generator.generate(
            description="Shopping cart functionality",
            max_tests=2,
        )

        assert len(result.test_cases) <= 2

    @pytest.mark.asyncio
    async def test_generate_filters_by_test_type(self, generator: TestGenerator) -> None:
        """Test that generate filters by test type."""
        result = await generator.generate(
            description="Payment processing feature",
            test_type="functional",
            max_tests=5,
        )

        for test_case in result.test_cases:
            assert test_case.test_type == "functional"

    @pytest.mark.asyncio
    async def test_generate_applies_priority(self, generator: TestGenerator) -> None:
        """Test that generate applies specified priority."""
        result = await generator.generate(
            description="Security critical feature",
            priority="critical",
            max_tests=3,
        )

        for test_case in result.test_cases:
            assert test_case.priority == "critical"

    @pytest.mark.asyncio
    async def test_generate_includes_metadata(self, generator: TestGenerator) -> None:
        """Test that generate includes metadata."""
        result = await generator.generate(
            description="API endpoint testing",
        )

        assert "provider" in result.metadata
        assert "description_length" in result.metadata

    @pytest.mark.asyncio
    async def test_generate_test_cases_have_steps(self, generator: TestGenerator) -> None:
        """Test that generated test cases have steps."""
        result = await generator.generate(
            description="Form validation feature",
            max_tests=1,
        )

        test_case = result.test_cases[0]
        assert len(test_case.steps) > 0
        assert test_case.steps[0].step_number >= 1
        assert test_case.steps[0].action != ""


class TestTestGeneratorGenerateTests:
    """Tests for TestGenerator.generate_tests method with AI integration."""

    @pytest.fixture
    def mock_llm_response(self) -> Dict[str, Any]:
        """Create mock LLM response data."""
        return [
            {
                "title": "Verify successful login with valid credentials",
                "preconditions": "User account exists in the system",
                "steps": [
                    {
                        "step_number": 1,
                        "action": "Navigate to login page",
                        "expected_result": "Login page is displayed",
                    },
                    {
                        "step_number": 2,
                        "action": "Enter valid email and password",
                        "expected_result": "Credentials are accepted",
                    },
                    {
                        "step_number": 3,
                        "action": "Click login button",
                        "expected_result": "User is redirected to dashboard",
                    },
                ],
                "expected_result": "User is successfully authenticated and logged in",
                "priority": "critical",
                "test_type": "functional",
            },
            {
                "title": "Verify login fails with invalid password",
                "preconditions": "User account exists in the system",
                "steps": [
                    {
                        "step_number": 1,
                        "action": "Navigate to login page",
                        "expected_result": "Login page is displayed",
                    },
                    {
                        "step_number": 2,
                        "action": "Enter valid email with incorrect password",
                        "expected_result": "Credentials are entered",
                    },
                    {
                        "step_number": 3,
                        "action": "Click login button",
                        "expected_result": "Error message is displayed",
                    },
                ],
                "expected_result": "Authentication fails with appropriate error message",
                "priority": "high",
                "test_type": "negative",
            },
        ]

    @pytest.fixture
    def generator(self) -> TestGenerator:
        """Create a TestGenerator with AI enabled."""
        return TestGenerator(api_key="test-key", provider="openai", use_ai=True)

    @pytest.mark.asyncio
    async def test_generate_tests_calls_llm(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests calls the LLM client."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_tests(
                description="User login with email and password",
                max_tests=5,
            )

            mock_client.complete_simple.assert_called_once()
            assert len(result.test_cases) == 2
            assert result.test_cases[0].title == "Verify successful login with valid credentials"

    @pytest.mark.asyncio
    async def test_generate_tests_includes_metadata(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests includes comprehensive metadata."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_tests(
                description="User login feature",
                max_tests=5,
            )

            assert result.metadata["provider"] == "openai"
            assert result.metadata["model"] == "gpt-4-turbo-preview"
            assert result.metadata["prompt_tokens"] == 100
            assert result.metadata["completion_tokens"] == 200
            assert result.metadata["total_tokens"] == 300

    @pytest.mark.asyncio
    async def test_generate_tests_filters_by_type(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests filters results by test type."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_tests(
                description="User login feature",
                test_type="functional",
                max_tests=5,
            )

            assert len(result.test_cases) == 1
            assert result.test_cases[0].test_type == "functional"

    @pytest.mark.asyncio
    async def test_generate_tests_respects_max_tests(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests limits results to max_tests."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_tests(
                description="User login feature",
                max_tests=1,
            )

            assert len(result.test_cases) == 1

    @pytest.mark.asyncio
    async def test_generate_tests_handles_llm_error(
        self, generator: TestGenerator
    ) -> None:
        """Test that generate_tests handles LLM errors gracefully."""
        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(
            side_effect=LLMClientError("API error")
        )

        with (
            patch.object(generator, "_get_client", return_value=mock_client),
            pytest.raises(TestGenerationError, match="AI provider error"),
        ):
            await generator.generate_tests(
                description="User login feature",
            )

    @pytest.mark.asyncio
    async def test_generate_tests_handles_invalid_json(
        self, generator: TestGenerator
    ) -> None:
        """Test that generate_tests handles invalid JSON responses."""
        mock_response = LLMResponse(
            content="not valid json",
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with (
            patch.object(generator, "_get_client", return_value=mock_client),
            pytest.raises(TestGenerationError, match="Failed to parse"),
        ):
            await generator.generate_tests(
                description="User login feature",
            )

    @pytest.mark.asyncio
    async def test_generate_tests_handles_markdown_code_blocks(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests handles JSON wrapped in markdown code blocks."""
        wrapped_content = f"```json\n{json.dumps(mock_llm_response)}\n```"

        mock_response = LLMResponse(
            content=wrapped_content,
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_tests(
                description="User login feature",
                max_tests=5,
            )

            assert len(result.test_cases) == 2

    @pytest.mark.asyncio
    async def test_generate_tests_handles_object_response(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests handles object with test_cases key."""
        object_response = {"test_cases": mock_llm_response}

        mock_response = LLMResponse(
            content=json.dumps(object_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_tests(
                description="User login feature",
                max_tests=5,
            )

            assert len(result.test_cases) == 2

    @pytest.mark.asyncio
    async def test_generate_tests_with_context(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests passes context to the prompt."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=150,
            completion_tokens=200,
            total_tokens=350,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            await generator.generate_tests(
                description="User login feature",
                context="This is a banking application with strict security requirements",
                max_tests=5,
            )

            # Verify context was passed to prompt
            call_args = mock_client.complete_simple.call_args
            user_prompt = call_args[1]["user_prompt"]
            assert "banking application" in user_prompt

    @pytest.mark.asyncio
    async def test_generate_tests_uses_json_mode(
        self, generator: TestGenerator, mock_llm_response: Dict[str, Any]
    ) -> None:
        """Test that generate_tests uses JSON mode for LLM calls."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            await generator.generate_tests(
                description="User login feature",
            )

            call_args = mock_client.complete_simple.call_args
            assert call_args[1]["json_mode"] is True


class TestTestGeneratorParsing:
    """Tests for TestGenerator response parsing."""

    def test_parse_response_array(self) -> None:
        """Test parsing a JSON array response."""
        generator = TestGenerator(use_ai=False)
        content = json.dumps([
            {
                "title": "Test case 1",
                "steps": [
                    {"step_number": 1, "action": "Do something", "expected_result": "Result"}
                ],
                "expected_result": "Overall result",
                "priority": "high",
                "test_type": "functional",
            }
        ])

        test_cases = generator._parse_response(content)

        assert len(test_cases) == 1
        assert test_cases[0].title == "Test case 1"
        assert test_cases[0].priority == "high"

    def test_parse_response_with_test_cases_key(self) -> None:
        """Test parsing a response with test_cases key."""
        generator = TestGenerator(use_ai=False)
        content = json.dumps({
            "test_cases": [
                {
                    "title": "Test case 1",
                    "steps": [],
                    "expected_result": "Result",
                    "priority": "medium",
                    "test_type": "functional",
                }
            ]
        })

        test_cases = generator._parse_response(content)

        assert len(test_cases) == 1

    def test_parse_response_strips_code_blocks(self) -> None:
        """Test that code blocks are stripped from response."""
        generator = TestGenerator(use_ai=False)
        content = "```json\n[{\"title\": \"Test\", \"steps\": [], \"expected_result\": \"R\", \"priority\": \"low\", \"test_type\": \"functional\"}]\n```"

        test_cases = generator._parse_response(content)

        assert len(test_cases) == 1
        assert test_cases[0].title == "Test"

    def test_parse_response_normalizes_invalid_priority(self) -> None:
        """Test that invalid priority is normalized to medium."""
        generator = TestGenerator(use_ai=False)
        content = json.dumps([
            {
                "title": "Test",
                "steps": [],
                "expected_result": "Result",
                "priority": "invalid",
                "test_type": "functional",
            }
        ])

        test_cases = generator._parse_response(content)

        assert test_cases[0].priority == "medium"

    def test_parse_response_normalizes_invalid_test_type(self) -> None:
        """Test that invalid test_type is normalized to functional."""
        generator = TestGenerator(use_ai=False)
        content = json.dumps([
            {
                "title": "Test",
                "steps": [],
                "expected_result": "Result",
                "priority": "high",
                "test_type": "unknown",
            }
        ])

        test_cases = generator._parse_response(content)

        assert test_cases[0].test_type == "functional"

    def test_parse_response_missing_title_raises(self) -> None:
        """Test that missing title raises ValueError."""
        generator = TestGenerator(use_ai=False)
        content = json.dumps([
            {
                "steps": [],
                "expected_result": "Result",
                "priority": "high",
                "test_type": "functional",
            }
        ])

        with pytest.raises(ValueError, match="missing required field: title"):
            generator._parse_response(content)

    def test_parse_response_default_step_numbers(self) -> None:
        """Test that step numbers default to sequential if missing."""
        generator = TestGenerator(use_ai=False)
        content = json.dumps([
            {
                "title": "Test",
                "steps": [
                    {"action": "Step 1", "expected_result": "Result 1"},
                    {"action": "Step 2", "expected_result": "Result 2"},
                ],
                "expected_result": "Result",
                "priority": "high",
                "test_type": "functional",
            }
        ])

        test_cases = generator._parse_response(content)

        assert test_cases[0].steps[0].step_number == 1
        assert test_cases[0].steps[1].step_number == 2


class TestBDDGenerator:
    """Tests for the BDDGenerator service."""

    @pytest.fixture
    def generator(self) -> BDDGenerator:
        """Create a BDDGenerator instance with mock mode enabled."""
        return BDDGenerator(use_ai=False)

    @pytest.mark.asyncio
    async def test_generate_returns_scenarios(self, generator: BDDGenerator) -> None:
        """Test that generate returns BDD scenarios."""
        result = await generator.generate(
            feature_description="User registration with email verification",
            max_scenarios=3,
        )

        assert result.scenarios is not None
        assert len(result.scenarios) > 0

    @pytest.mark.asyncio
    async def test_generate_respects_max_scenarios(self, generator: BDDGenerator) -> None:
        """Test that generate respects max_scenarios limit."""
        result = await generator.generate(
            feature_description="Product catalog browsing",
            max_scenarios=2,
        )

        assert len(result.scenarios) <= 2

    @pytest.mark.asyncio
    async def test_generate_returns_gherkin(self, generator: BDDGenerator) -> None:
        """Test that generate returns Gherkin format."""
        result = await generator.generate(
            feature_description="Order checkout process",
        )

        assert result.gherkin is not None
        assert "Feature:" in result.gherkin
        assert "Scenario" in result.gherkin

    @pytest.mark.asyncio
    async def test_generate_scenarios_have_given_when_then(
        self, generator: BDDGenerator
    ) -> None:
        """Test that scenarios have Given/When/Then steps."""
        result = await generator.generate(
            feature_description="Search functionality",
        )

        scenario = result.scenarios[0]
        assert len(scenario.given) > 0
        assert len(scenario.when) > 0
        assert len(scenario.then) > 0

    @pytest.mark.asyncio
    async def test_generate_extracts_feature_name(self, generator: BDDGenerator) -> None:
        """Test that feature name is extracted from description."""
        result = await generator.generate(
            feature_description="User login with two-factor authentication support",
        )

        assert result.feature_name is not None
        assert len(result.feature_name) > 0

    @pytest.mark.asyncio
    async def test_generate_gherkin_contains_all_scenarios(
        self, generator: BDDGenerator
    ) -> None:
        """Test that Gherkin output contains all generated scenarios."""
        result = await generator.generate(
            feature_description="File upload feature",
            max_scenarios=3,
        )

        for scenario in result.scenarios:
            assert scenario.name in result.gherkin


class TestGeneratorInitialization:
    """Tests for generator initialization."""

    def test_test_generator_accepts_api_key(self) -> None:
        """Test that TestGenerator accepts API key."""
        generator = TestGenerator(api_key="test-key", provider="openai")
        assert generator.api_key == "test-key"
        assert generator.provider == "openai"

    def test_bdd_generator_accepts_api_key(self) -> None:
        """Test that BDDGenerator accepts API key."""
        generator = BDDGenerator(api_key="test-key", provider="anthropic")
        assert generator.api_key == "test-key"
        assert generator.provider == "anthropic"

    def test_test_generator_defaults(self) -> None:
        """Test that TestGenerator has sensible defaults."""
        generator = TestGenerator()
        assert generator.api_key is None
        assert generator.provider == "openai"

    def test_bdd_generator_defaults(self) -> None:
        """Test that BDDGenerator has sensible defaults."""
        generator = BDDGenerator()
        assert generator.api_key is None
        assert generator.provider == "openai"

    def test_bdd_generator_use_ai_flag(self) -> None:
        """Test that BDDGenerator accepts use_ai flag."""
        generator = BDDGenerator(use_ai=False)
        assert generator.use_ai is False


class TestBDDGeneratorGenerateScenarios:
    """Tests for BDDGenerator.generate_scenarios method with AI integration."""

    @pytest.fixture
    def mock_llm_response_data(self) -> Dict[str, Any]:
        """Create mock LLM response data."""
        return {
            "feature_name": "User Authentication",
            "scenarios": [
                {
                    "name": "Successful login with valid credentials",
                    "tags": ["@smoke", "@login"],
                    "given": [
                        "the user is on the login page",
                        "the user has a valid account",
                    ],
                    "when": [
                        "the user enters valid email and password",
                        "the user clicks the login button",
                    ],
                    "then": [
                        "the user should be redirected to the dashboard",
                        "the user should see a welcome message",
                    ],
                    "examples": None,
                },
                {
                    "name": "Login with various credentials",
                    "tags": ["@validation", "@regression"],
                    "given": ["the user is on the login page"],
                    "when": [
                        "the user enters <email> and <password>",
                        "the user clicks the login button",
                    ],
                    "then": ["the system should show <result>"],
                    "examples": [
                        {"email": "valid@test.com", "password": "pass123", "result": "success"},
                        {"email": "invalid", "password": "pass123", "result": "error"},
                        {"email": "valid@test.com", "password": "", "result": "error"},
                    ],
                },
            ],
        }

    @pytest.fixture
    def generator(self) -> BDDGenerator:
        """Create a BDDGenerator with AI enabled."""
        return BDDGenerator(api_key="test-key", provider="openai", use_ai=True)

    @pytest.fixture
    def mock_generator(self) -> BDDGenerator:
        """Create a BDDGenerator with mock mode enabled."""
        return BDDGenerator(use_ai=False)

    @pytest.mark.asyncio
    async def test_generate_scenarios_calls_llm(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios calls the LLM client."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_scenarios(
                feature_description="User login with email and password",
                max_scenarios=5,
            )

            mock_client.complete_simple.assert_called_once()
            assert len(result.scenarios) == 2
            assert result.scenarios[0].name == "Successful login with valid credentials"

    @pytest.mark.asyncio
    async def test_generate_scenarios_includes_metadata(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios includes comprehensive metadata."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_scenarios(
                feature_description="User login feature",
                scenario_focus="comprehensive",
            )

            assert result.metadata["provider"] == "openai"
            assert result.metadata["model"] == "gpt-4-turbo-preview"
            assert result.metadata["scenario_focus"] == "comprehensive"
            assert result.metadata["prompt_tokens"] == 100
            assert result.metadata["completion_tokens"] == 200
            assert result.metadata["total_tokens"] == 300

    @pytest.mark.asyncio
    async def test_generate_scenarios_respects_max_scenarios(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios limits results to max_scenarios."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_scenarios(
                feature_description="User login feature",
                max_scenarios=1,
            )

            assert len(result.scenarios) == 1

    @pytest.mark.asyncio
    async def test_generate_scenarios_handles_llm_error(
        self, generator: BDDGenerator
    ) -> None:
        """Test that generate_scenarios handles LLM errors gracefully."""
        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(
            side_effect=LLMClientError("API error")
        )

        with (
            patch.object(generator, "_get_client", return_value=mock_client),
            pytest.raises(BDDGenerationError, match="AI provider error"),
        ):
            await generator.generate_scenarios(
                feature_description="User login feature",
            )

    @pytest.mark.asyncio
    async def test_generate_scenarios_handles_invalid_json(
        self, generator: BDDGenerator
    ) -> None:
        """Test that generate_scenarios handles invalid JSON responses."""
        mock_response = LLMResponse(
            content="not valid json",
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with (
            patch.object(generator, "_get_client", return_value=mock_client),
            pytest.raises(BDDGenerationError, match="Failed to parse"),
        ):
            await generator.generate_scenarios(
                feature_description="User login feature",
            )

    @pytest.mark.asyncio
    async def test_generate_scenarios_handles_markdown_code_blocks(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios handles JSON wrapped in markdown code blocks."""
        wrapped_content = f"```json\n{json.dumps(mock_llm_response_data)}\n```"

        mock_response = LLMResponse(
            content=wrapped_content,
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_scenarios(
                feature_description="User login feature",
            )

            assert len(result.scenarios) == 2

    @pytest.mark.asyncio
    async def test_generate_scenarios_handles_array_response(
        self, generator: BDDGenerator
    ) -> None:
        """Test that generate_scenarios handles a direct array of scenarios."""
        array_response = [
            {
                "name": "Test scenario",
                "given": ["precondition"],
                "when": ["action"],
                "then": ["outcome"],
            }
        ]

        mock_response = LLMResponse(
            content=json.dumps(array_response),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_scenarios(
                feature_description="User login feature",
            )

            assert len(result.scenarios) == 1
            assert result.scenarios[0].name == "Test scenario"

    @pytest.mark.asyncio
    async def test_generate_scenarios_with_context(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios passes context to the prompt."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=150,
            completion_tokens=200,
            total_tokens=350,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            await generator.generate_scenarios(
                feature_description="User login feature",
                context="This is a healthcare application with HIPAA requirements",
            )

            call_args = mock_client.complete_simple.call_args
            user_prompt = call_args[1]["user_prompt"]
            assert "healthcare application" in user_prompt

    @pytest.mark.asyncio
    async def test_generate_scenarios_uses_json_mode(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios uses JSON mode for LLM calls."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            await generator.generate_scenarios(
                feature_description="User login feature",
            )

            call_args = mock_client.complete_simple.call_args
            assert call_args[1]["json_mode"] is True

    @pytest.mark.asyncio
    async def test_generate_scenarios_passes_scenario_focus(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios passes scenario_focus to prompt."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            await generator.generate_scenarios(
                feature_description="Security feature",
                scenario_focus="security",
            )

            call_args = mock_client.complete_simple.call_args
            user_prompt = call_args[1]["user_prompt"]
            assert "security" in user_prompt.lower()

    @pytest.mark.asyncio
    async def test_generate_scenarios_returns_gherkin(
        self, generator: BDDGenerator, mock_llm_response_data: Dict[str, Any]
    ) -> None:
        """Test that generate_scenarios returns properly formatted Gherkin."""
        mock_response = LLMResponse(
            content=json.dumps(mock_llm_response_data),
            model="gpt-4-turbo-preview",
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
            finish_reason="stop",
        )

        mock_client = AsyncMock()
        mock_client.complete_simple = AsyncMock(return_value=mock_response)

        with patch.object(generator, "_get_client", return_value=mock_client):
            result = await generator.generate_scenarios(
                feature_description="User login feature",
            )

            assert "Feature:" in result.gherkin
            assert "Scenario" in result.gherkin
            assert "Given" in result.gherkin
            assert "When" in result.gherkin
            assert "Then" in result.gherkin

    @pytest.mark.asyncio
    async def test_generate_scenarios_mock_mode(
        self, mock_generator: BDDGenerator
    ) -> None:
        """Test that generate_scenarios works in mock mode."""
        result = await mock_generator.generate_scenarios(
            feature_description="Test feature description",
            max_scenarios=3,
            include_examples=True,
            include_tags=True,
        )

        assert len(result.scenarios) <= 3
        assert result.feature_name is not None
        assert "Feature:" in result.gherkin
        assert result.metadata["model"] == "mock"

    @pytest.mark.asyncio
    async def test_generate_scenarios_mock_includes_tags(
        self, mock_generator: BDDGenerator
    ) -> None:
        """Test that mock scenarios include tags when requested."""
        result = await mock_generator.generate_scenarios(
            feature_description="Test feature",
            include_tags=True,
        )

        # At least one scenario should have tags
        has_tags = any(s.tags is not None and len(s.tags) > 0 for s in result.scenarios)
        assert has_tags

    @pytest.mark.asyncio
    async def test_generate_scenarios_mock_excludes_tags(
        self, mock_generator: BDDGenerator
    ) -> None:
        """Test that mock scenarios exclude tags when requested."""
        result = await mock_generator.generate_scenarios(
            feature_description="Test feature",
            include_tags=False,
        )

        # All scenarios should have no tags
        for scenario in result.scenarios:
            assert scenario.tags is None

    @pytest.mark.asyncio
    async def test_generate_scenarios_mock_includes_examples(
        self, mock_generator: BDDGenerator
    ) -> None:
        """Test that mock scenarios include examples when requested."""
        result = await mock_generator.generate_scenarios(
            feature_description="Test feature",
            max_scenarios=3,
            include_examples=True,
        )

        # At least one scenario should have examples
        has_examples = any(s.examples is not None for s in result.scenarios)
        assert has_examples

    @pytest.mark.asyncio
    async def test_generate_scenarios_mock_excludes_examples(
        self, mock_generator: BDDGenerator
    ) -> None:
        """Test that mock scenarios exclude examples when requested."""
        result = await mock_generator.generate_scenarios(
            feature_description="Test feature",
            max_scenarios=3,
            include_examples=False,
        )

        # All scenarios should have no examples
        for scenario in result.scenarios:
            assert scenario.examples is None


class TestBDDGeneratorParsing:
    """Tests for BDDGenerator response parsing."""

    def test_parse_response_with_scenarios_key(self) -> None:
        """Test parsing a response with scenarios key."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps({
            "feature_name": "Test Feature",
            "scenarios": [
                {
                    "name": "Test scenario",
                    "given": ["precondition"],
                    "when": ["action"],
                    "then": ["outcome"],
                }
            ]
        })

        result = generator._parse_response(content)

        assert result["feature_name"] == "Test Feature"
        assert len(result["scenarios"]) == 1
        assert result["scenarios"][0].name == "Test scenario"

    def test_parse_response_array(self) -> None:
        """Test parsing a JSON array response."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps([
            {
                "name": "Test scenario",
                "given": ["precondition"],
                "when": ["action"],
                "then": ["outcome"],
            }
        ])

        result = generator._parse_response(content)

        assert result["feature_name"] is None
        assert len(result["scenarios"]) == 1

    def test_parse_response_strips_code_blocks(self) -> None:
        """Test that code blocks are stripped from response."""
        generator = BDDGenerator(use_ai=False)
        content = '```json\n{"scenarios": [{"name": "Test", "given": [], "when": [], "then": []}]}\n```'

        result = generator._parse_response(content)

        assert len(result["scenarios"]) == 1
        assert result["scenarios"][0].name == "Test"

    def test_parse_response_missing_scenarios_key_raises(self) -> None:
        """Test that missing scenarios key raises ValueError."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps({"feature_name": "Test"})

        with pytest.raises(ValueError, match="Expected array or object with 'scenarios' key"):
            generator._parse_response(content)

    def test_parse_scenario_missing_name_raises(self) -> None:
        """Test that missing name raises ValueError."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps({
            "scenarios": [
                {
                    "given": ["precondition"],
                    "when": ["action"],
                    "then": ["outcome"],
                }
            ]
        })

        with pytest.raises(ValueError, match="Scenario missing required field: name"):
            generator._parse_response(content)

    def test_parse_scenario_string_steps_to_list(self) -> None:
        """Test that string steps are converted to lists."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps({
            "scenarios": [
                {
                    "name": "Test",
                    "given": "single precondition",
                    "when": "single action",
                    "then": "single outcome",
                }
            ]
        })

        result = generator._parse_response(content)

        assert result["scenarios"][0].given == ["single precondition"]
        assert result["scenarios"][0].when == ["single action"]
        assert result["scenarios"][0].then == ["single outcome"]

    def test_parse_scenario_with_tags(self) -> None:
        """Test parsing scenario with tags."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps({
            "scenarios": [
                {
                    "name": "Test",
                    "tags": ["@smoke", "@critical"],
                    "given": [],
                    "when": [],
                    "then": [],
                }
            ]
        })

        result = generator._parse_response(content)

        assert result["scenarios"][0].tags == ["@smoke", "@critical"]

    def test_parse_scenario_with_examples(self) -> None:
        """Test parsing scenario with examples."""
        generator = BDDGenerator(use_ai=False)
        content = json.dumps({
            "scenarios": [
                {
                    "name": "Test",
                    "given": [],
                    "when": ["enter <value>"],
                    "then": ["see <result>"],
                    "examples": [
                        {"value": "a", "result": "1"},
                        {"value": "b", "result": "2"},
                    ],
                }
            ]
        })

        result = generator._parse_response(content)

        assert len(result["scenarios"][0].examples) == 2
        assert result["scenarios"][0].examples[0]["value"] == "a"


class TestBDDGeneratorGherkinFormatting:
    """Tests for BDDGenerator Gherkin formatting."""

    @pytest.fixture
    def generator(self) -> BDDGenerator:
        """Create a BDDGenerator instance."""
        return BDDGenerator(use_ai=False)

    def test_format_gherkin_basic(self, generator: BDDGenerator) -> None:
        """Test basic Gherkin formatting."""
        from app.models.responses import BDDScenario

        scenarios = [
            BDDScenario(
                name="Test scenario",
                given=["precondition 1", "precondition 2"],
                when=["action"],
                then=["outcome 1", "outcome 2"],
            )
        ]

        gherkin = generator._format_gherkin(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios=scenarios,
        )

        assert "Feature: Test Feature" in gherkin
        assert "Test description" in gherkin
        assert "Scenario: Test scenario" in gherkin
        assert "Given precondition 1" in gherkin
        assert "And precondition 2" in gherkin
        assert "When action" in gherkin
        assert "Then outcome 1" in gherkin
        assert "And outcome 2" in gherkin

    def test_format_gherkin_with_tags(self, generator: BDDGenerator) -> None:
        """Test Gherkin formatting with tags."""
        from app.models.responses import BDDScenario

        scenarios = [
            BDDScenario(
                name="Test scenario",
                given=["precondition"],
                when=["action"],
                then=["outcome"],
                tags=["@smoke", "@critical"],
            )
        ]

        gherkin = generator._format_gherkin(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios=scenarios,
            include_tags=True,
        )

        assert "@smoke @critical" in gherkin

    def test_format_gherkin_without_tags(self, generator: BDDGenerator) -> None:
        """Test Gherkin formatting without tags."""
        from app.models.responses import BDDScenario

        scenarios = [
            BDDScenario(
                name="Test scenario",
                given=["precondition"],
                when=["action"],
                then=["outcome"],
                tags=["@smoke", "@critical"],
            )
        ]

        gherkin = generator._format_gherkin(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios=scenarios,
            include_tags=False,
        )

        assert "@smoke" not in gherkin
        assert "@critical" not in gherkin

    def test_format_gherkin_scenario_outline(self, generator: BDDGenerator) -> None:
        """Test Gherkin formatting with Scenario Outline."""
        from app.models.responses import BDDScenario

        scenarios = [
            BDDScenario(
                name="Test scenario outline",
                given=["precondition"],
                when=["enter <value>"],
                then=["see <result>"],
                examples=[
                    {"value": "a", "result": "1"},
                    {"value": "b", "result": "2"},
                ],
            )
        ]

        gherkin = generator._format_gherkin(
            feature_name="Test Feature",
            feature_description="Test description",
            scenarios=scenarios,
        )

        assert "Scenario Outline: Test scenario outline" in gherkin
        assert "Examples:" in gherkin
        assert "| value | result |" in gherkin
        assert "| a | 1 |" in gherkin
        assert "| b | 2 |" in gherkin

    def test_extract_feature_name_short(self, generator: BDDGenerator) -> None:
        """Test feature name extraction for short descriptions."""
        name = generator._extract_feature_name("User login. With password.")

        assert name == "User login"

    def test_extract_feature_name_long(self, generator: BDDGenerator) -> None:
        """Test feature name extraction for long descriptions."""
        long_description = "A very long feature description that exceeds fifty characters easily"
        name = generator._extract_feature_name(long_description)

        assert len(name) == 50
        assert name.endswith("...")
