"""Test case generation service using AI."""

from __future__ import annotations

from typing import List, Literal, Optional

from app.models.responses import GeneratedTestCase, TestGenerationResponse, TestStep


class TestGenerator:
    """Service for generating test cases from requirements using AI."""

    def __init__(
        self, api_key: Optional[str] = None, provider: str = "openai"
    ) -> None:
        """Initialize the test generator.

        Args:
            api_key: API key for the AI provider
            provider: AI provider to use ('openai' or 'anthropic')
        """
        self.api_key = api_key
        self.provider = provider

    async def generate(
        self,
        description: str,
        context: Optional[str] = None,
        test_type: Literal["functional", "edge_case", "negative", "all"] = "all",
        max_tests: int = 5,
        priority: Optional[Literal["critical", "high", "medium", "low"]] = None,
    ) -> TestGenerationResponse:
        """Generate test cases from a description.

        Args:
            description: The requirement or feature description
            context: Additional context about the application
            test_type: Type of test cases to generate
            max_tests: Maximum number of test cases
            priority: Priority for generated test cases

        Returns:
            TestGenerationResponse with generated test cases
        """
        # For now, return mock data. In production, this would call the AI provider.
        # This allows the service to be tested and used without API keys.
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
                "test_type": test_type,
                "description_length": len(description),
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
