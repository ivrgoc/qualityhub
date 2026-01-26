"""Test case generation service using AI.

This module provides the TestGenerator service for generating test cases
from requirements or feature descriptions using AI models (OpenAI/Anthropic).
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Literal, Optional

from app.models.responses import GeneratedTestCase, TestGenerationResponse, TestStep
from app.prompts.test_generation import (
    build_test_generation_system_prompt,
    build_test_generation_user_prompt,
)
from app.services.llm_client import (
    BaseLLMClient,
    LLMClientError,
    get_llm_client,
)

logger = logging.getLogger(__name__)


class TestGenerationError(Exception):
    """Exception raised when test generation fails."""

    pass


class TestGenerator:
    """Service for generating test cases from requirements using AI.

    This service uses LLM providers (OpenAI or Anthropic) to generate
    comprehensive test cases from feature descriptions or requirements.

    Attributes:
        api_key: API key for the AI provider.
        provider: AI provider to use ('openai' or 'anthropic').
        use_ai: Whether to use AI for generation (False uses mock data).
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        provider: Literal["openai", "anthropic"] = "openai",
        use_ai: bool = True,
    ) -> None:
        """Initialize the test generator.

        Args:
            api_key: API key for the AI provider. If None, will attempt
                     to load from environment/settings.
            provider: AI provider to use ('openai' or 'anthropic').
            use_ai: If True, uses LLM for generation. If False, returns
                    mock data (useful for testing without API keys).
        """
        self.api_key = api_key
        self.provider = provider
        self.use_ai = use_ai
        self._client: Optional[BaseLLMClient] = None

    def _get_client(self) -> BaseLLMClient:
        """Get or create the LLM client.

        Returns:
            Configured LLM client for the specified provider.

        Raises:
            TestGenerationError: If client creation fails.
        """
        if self._client is None:
            try:
                self._client = get_llm_client(
                    provider=self.provider,
                    api_key=self.api_key,
                )
            except Exception as e:
                raise TestGenerationError(
                    f"Failed to create LLM client: {e}"
                ) from e
        return self._client

    async def generate_tests(
        self,
        description: str,
        context: Optional[str] = None,
        test_type: Literal["functional", "edge_case", "negative", "all"] = "all",
        max_tests: int = 5,
        priority: Optional[Literal["critical", "high", "medium", "low"]] = None,
    ) -> TestGenerationResponse:
        """Generate test cases from a requirement or feature description.

        This is the main entry point for test generation. It uses AI to
        analyze the description and generate comprehensive test cases
        including functional tests, edge cases, and negative scenarios.

        Args:
            description: The requirement or feature description to generate
                        tests from. Should be detailed enough for the AI
                        to understand the functionality.
            context: Additional context about the application, existing
                    functionality, or constraints that might affect testing.
            test_type: Type of test cases to generate:
                - 'functional': Standard functionality tests
                - 'edge_case': Boundary condition tests
                - 'negative': Error handling and invalid input tests
                - 'all': Mix of all test types (default)
            max_tests: Maximum number of test cases to generate (1-20).
            priority: Priority level to assign to all generated tests.
                     If None, AI will assign appropriate priorities.

        Returns:
            TestGenerationResponse containing:
                - test_cases: List of generated test cases
                - metadata: Generation metadata (provider, tokens used, etc.)

        Raises:
            TestGenerationError: If generation fails due to API errors,
                               invalid responses, or parsing failures.

        Example:
            >>> generator = TestGenerator(provider="openai")
            >>> response = await generator.generate_tests(
            ...     description="User login with email and password",
            ...     test_type="all",
            ...     max_tests=5,
            ... )
            >>> for test in response.test_cases:
            ...     print(test.title)
        """
        if not self.use_ai:
            return await self._generate_mock_response(
                description=description,
                test_type=test_type,
                max_tests=max_tests,
                priority=priority,
            )

        try:
            client = self._get_client()

            system_prompt = build_test_generation_system_prompt()
            user_prompt = build_test_generation_user_prompt(
                description=description,
                test_type=test_type,
                max_tests=max_tests,
                context=context,
                priority=priority,
            )

            logger.debug(
                "Generating tests with provider=%s, test_type=%s, max_tests=%d",
                self.provider,
                test_type,
                max_tests,
            )

            response = await client.complete_simple(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                json_mode=True,
            )

            test_cases = self._parse_response(response.content)

            # Apply test type filter if specific type requested
            if test_type != "all":
                test_cases = [tc for tc in test_cases if tc.test_type == test_type]

            # Limit to max_tests
            test_cases = test_cases[:max_tests]

            return TestGenerationResponse(
                test_cases=test_cases,
                metadata={
                    "provider": self.provider,
                    "model": response.model,
                    "test_type": test_type,
                    "description_length": len(description),
                    "prompt_tokens": response.prompt_tokens,
                    "completion_tokens": response.completion_tokens,
                    "total_tokens": response.total_tokens,
                },
            )

        except LLMClientError as e:
            logger.error("LLM client error during test generation: %s", e)
            raise TestGenerationError(f"AI provider error: {e}") from e
        except json.JSONDecodeError as e:
            logger.error("Failed to parse AI response as JSON: %s", e)
            raise TestGenerationError(
                f"Failed to parse AI response: {e}"
            ) from e
        except Exception as e:
            logger.error("Unexpected error during test generation: %s", e)
            raise TestGenerationError(
                f"Test generation failed: {e}"
            ) from e

    async def generate(
        self,
        description: str,
        context: Optional[str] = None,
        test_type: Literal["functional", "edge_case", "negative", "all"] = "all",
        max_tests: int = 5,
        priority: Optional[Literal["critical", "high", "medium", "low"]] = None,
    ) -> TestGenerationResponse:
        """Generate test cases from a description.

        This method is an alias for generate_tests() for backwards compatibility.

        Args:
            description: The requirement or feature description
            context: Additional context about the application
            test_type: Type of test cases to generate
            max_tests: Maximum number of test cases
            priority: Priority for generated test cases

        Returns:
            TestGenerationResponse with generated test cases
        """
        return await self.generate_tests(
            description=description,
            context=context,
            test_type=test_type,
            max_tests=max_tests,
            priority=priority,
        )

    def _parse_response(self, content: str) -> List[GeneratedTestCase]:
        """Parse the LLM response content into test cases.

        Args:
            content: JSON string from the LLM response.

        Returns:
            List of parsed GeneratedTestCase objects.

        Raises:
            json.JSONDecodeError: If content is not valid JSON.
            ValueError: If the JSON structure is invalid.
        """
        # Handle potential markdown code blocks
        content = content.strip()
        if content.startswith("```"):
            # Extract content between code blocks
            lines = content.split("\n")
            # Remove first line (```json) and last line (```)
            content = "\n".join(lines[1:-1])

        data = json.loads(content)

        # Handle both array and object with test_cases key
        if isinstance(data, dict):
            if "test_cases" in data:
                data = data["test_cases"]
            else:
                raise ValueError("Expected array or object with 'test_cases' key")

        if not isinstance(data, list):
            raise ValueError("Expected JSON array of test cases")

        test_cases: List[GeneratedTestCase] = []
        for item in data:
            test_case = self._parse_test_case(item)
            test_cases.append(test_case)

        return test_cases

    def _parse_test_case(self, data: Dict[str, Any]) -> GeneratedTestCase:
        """Parse a single test case from JSON data.

        Args:
            data: Dictionary containing test case data.

        Returns:
            GeneratedTestCase object.

        Raises:
            ValueError: If required fields are missing.
        """
        if "title" not in data:
            raise ValueError("Test case missing required field: title")

        steps: List[TestStep] = []
        for i, step_data in enumerate(data.get("steps", []), start=1):
            step = TestStep(
                step_number=step_data.get("step_number", i),
                action=step_data.get("action", ""),
                expected_result=step_data.get("expected_result", ""),
            )
            steps.append(step)

        # Validate and normalize priority
        priority = data.get("priority", "medium")
        if priority not in ("critical", "high", "medium", "low"):
            priority = "medium"

        # Validate and normalize test_type
        test_type = data.get("test_type", "functional")
        if test_type not in ("functional", "edge_case", "negative"):
            test_type = "functional"

        return GeneratedTestCase(
            title=data["title"],
            preconditions=data.get("preconditions"),
            steps=steps,
            expected_result=data.get("expected_result", ""),
            priority=priority,
            test_type=test_type,
        )

    async def _generate_mock_response(
        self,
        description: str,
        test_type: Literal["functional", "edge_case", "negative", "all"],
        max_tests: int,
        priority: Optional[Literal["critical", "high", "medium", "low"]],
    ) -> TestGenerationResponse:
        """Generate mock test cases for development/testing.

        This method generates mock test cases without calling the AI provider.
        Useful for testing, development, and when API keys are not configured.

        Args:
            description: Feature description
            test_type: Type of tests to generate
            max_tests: Maximum number of tests
            priority: Priority level

        Returns:
            TestGenerationResponse with mock test cases
        """
        test_cases = self._generate_mock_tests(
            description=description,
            test_type=test_type,
            max_tests=max_tests,
            priority=priority,
        )

        return TestGenerationResponse(
            test_cases=test_cases,
            metadata={
                "provider": self.provider,
                "model": "mock",
                "test_type": test_type,
                "description_length": len(description),
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
            },
        )

    def _generate_mock_tests(
        self,
        description: str,
        test_type: Literal["functional", "edge_case", "negative", "all"],
        max_tests: int,
        priority: Optional[Literal["critical", "high", "medium", "low"]],
    ) -> List[GeneratedTestCase]:
        """Generate mock test cases for development/testing.

        Args:
            description: Feature description
            test_type: Type of tests to generate
            max_tests: Maximum number of tests
            priority: Priority level

        Returns:
            List of mock generated test cases
        """
        tests: List[GeneratedTestCase] = []
        default_priority = priority or "medium"

        # Generate functional test
        if test_type in ("functional", "all") and len(tests) < max_tests:
            tests.append(
                GeneratedTestCase(
                    title=f"Verify basic functionality - {description[:50]}",
                    preconditions="User is logged in and has appropriate permissions",
                    steps=[
                        TestStep(
                            step_number=1,
                            action="Navigate to the feature",
                            expected_result="Feature page is displayed",
                        ),
                        TestStep(
                            step_number=2,
                            action="Perform the main action",
                            expected_result="Action is completed successfully",
                        ),
                        TestStep(
                            step_number=3,
                            action="Verify the result",
                            expected_result="Expected outcome is achieved",
                        ),
                    ],
                    expected_result="Feature works as described",
                    priority=default_priority,
                    test_type="functional",
                )
            )

        # Generate edge case test
        if test_type in ("edge_case", "all") and len(tests) < max_tests:
            tests.append(
                GeneratedTestCase(
                    title=f"Verify edge case handling - {description[:50]}",
                    preconditions="System is in a boundary condition state",
                    steps=[
                        TestStep(
                            step_number=1,
                            action="Set up boundary condition",
                            expected_result="System accepts boundary values",
                        ),
                        TestStep(
                            step_number=2,
                            action="Execute feature at boundary",
                            expected_result="Feature handles edge case correctly",
                        ),
                    ],
                    expected_result="Edge cases are handled gracefully",
                    priority=default_priority,
                    test_type="edge_case",
                )
            )

        # Generate negative test
        if test_type in ("negative", "all") and len(tests) < max_tests:
            tests.append(
                GeneratedTestCase(
                    title=f"Verify error handling - {description[:50]}",
                    preconditions="System is ready to receive invalid input",
                    steps=[
                        TestStep(
                            step_number=1,
                            action="Provide invalid input",
                            expected_result="System validates input",
                        ),
                        TestStep(
                            step_number=2,
                            action="Verify error message",
                            expected_result="Appropriate error message is displayed",
                        ),
                    ],
                    expected_result="Errors are handled gracefully with clear messages",
                    priority=default_priority,
                    test_type="negative",
                )
            )

        return tests
