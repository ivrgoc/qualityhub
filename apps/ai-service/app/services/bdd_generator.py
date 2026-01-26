"""BDD scenario generation service using AI.

This module provides the BDDGenerator service for generating BDD scenarios
in Gherkin format from feature descriptions using AI models (OpenAI/Anthropic).
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Literal, Optional

from app.models.responses import BDDGenerationResponse, BDDScenario
from app.prompts.bdd_generation import (
    build_bdd_generation_system_prompt,
    build_bdd_generation_user_prompt,
)
from app.services.llm_client import (
    BaseLLMClient,
    LLMClientError,
    get_llm_client,
)

logger = logging.getLogger(__name__)


class BDDGenerationError(Exception):
    """Exception raised when BDD generation fails."""

    pass


class BDDGenerator:
    """Service for generating BDD scenarios (Gherkin format) from feature descriptions.

    This service uses LLM providers (OpenAI or Anthropic) to generate
    comprehensive BDD scenarios from feature descriptions.

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
        """Initialize the BDD generator.

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
            BDDGenerationError: If client creation fails.
        """
        if self._client is None:
            try:
                self._client = get_llm_client(
                    provider=self.provider,
                    api_key=self.api_key,
                )
            except Exception as e:
                raise BDDGenerationError(
                    f"Failed to create LLM client: {e}"
                ) from e
        return self._client

    async def generate_scenarios(
        self,
        feature_description: str,
        context: Optional[str] = None,
        scenario_focus: Literal[
            "happy_path", "error_handling", "validation", "security", "comprehensive"
        ] = "comprehensive",
        max_scenarios: int = 3,
        include_examples: bool = True,
        include_tags: bool = True,
    ) -> BDDGenerationResponse:
        """Generate BDD scenarios from a feature description.

        This is the main entry point for BDD scenario generation. It uses AI to
        analyze the feature description and generate comprehensive BDD scenarios
        in Gherkin format.

        Args:
            feature_description: The feature description to generate scenarios from.
                                Should be detailed enough for the AI to understand
                                the functionality being tested.
            context: Additional context about the application, existing
                    functionality, or constraints that might affect testing.
            scenario_focus: Type of scenarios to focus on:
                - 'happy_path': Positive scenarios for main success flows
                - 'error_handling': Error and edge case scenarios
                - 'validation': Input validation scenarios
                - 'security': Security-related scenarios
                - 'comprehensive': Mix of all scenario types (default)
            max_scenarios: Maximum number of scenarios to generate (1-10).
            include_examples: Whether to include Scenario Outline examples.
            include_tags: Whether to include scenario tags (@smoke, @regression, etc.).

        Returns:
            BDDGenerationResponse containing:
                - feature_name: Extracted or generated feature name
                - feature_description: The original description
                - scenarios: List of BDD scenarios
                - gherkin: Formatted Gherkin feature file content

        Raises:
            BDDGenerationError: If generation fails due to API errors,
                               invalid responses, or parsing failures.

        Example:
            >>> generator = BDDGenerator(provider="openai")
            >>> response = await generator.generate_scenarios(
            ...     feature_description="User login with email and password",
            ...     scenario_focus="comprehensive",
            ...     max_scenarios=5,
            ... )
            >>> print(response.gherkin)
        """
        if not self.use_ai:
            return await self._generate_mock_response(
                feature_description=feature_description,
                max_scenarios=max_scenarios,
                include_examples=include_examples,
                include_tags=include_tags,
            )

        try:
            client = self._get_client()

            system_prompt = build_bdd_generation_system_prompt()
            user_prompt = build_bdd_generation_user_prompt(
                feature_description=feature_description,
                max_scenarios=max_scenarios,
                context=context,
                scenario_focus=scenario_focus,
                include_examples=include_examples,
                include_tags=include_tags,
            )

            logger.debug(
                "Generating BDD scenarios with provider=%s, focus=%s, max_scenarios=%d",
                self.provider,
                scenario_focus,
                max_scenarios,
            )

            response = await client.complete_simple(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                json_mode=True,
            )

            parsed_data = self._parse_response(response.content)
            scenarios = parsed_data["scenarios"]
            feature_name = parsed_data.get("feature_name") or self._extract_feature_name(
                feature_description
            )

            # Limit to max_scenarios
            scenarios = scenarios[:max_scenarios]

            gherkin = self._format_gherkin(
                feature_name=feature_name,
                feature_description=feature_description,
                scenarios=scenarios,
                include_tags=include_tags,
            )

            return BDDGenerationResponse(
                feature_name=feature_name,
                feature_description=feature_description,
                scenarios=scenarios,
                gherkin=gherkin,
                metadata={
                    "provider": self.provider,
                    "model": response.model,
                    "scenario_focus": scenario_focus,
                    "description_length": len(feature_description),
                    "prompt_tokens": response.prompt_tokens,
                    "completion_tokens": response.completion_tokens,
                    "total_tokens": response.total_tokens,
                },
            )

        except LLMClientError as e:
            logger.error("LLM client error during BDD generation: %s", e)
            raise BDDGenerationError(f"AI provider error: {e}") from e
        except json.JSONDecodeError as e:
            logger.error("Failed to parse AI response as JSON: %s", e)
            raise BDDGenerationError(
                f"Failed to parse AI response: {e}"
            ) from e
        except ValueError as e:
            logger.error("Response validation error during BDD generation: %s", e)
            raise BDDGenerationError(f"Invalid response format: {e}") from e
        except Exception as e:
            logger.error("Unexpected error during BDD generation: %s", e)
            raise BDDGenerationError(
                f"BDD generation failed: {e}"
            ) from e

    async def generate(
        self,
        feature_description: str,
        context: Optional[str] = None,
        max_scenarios: int = 3,
        include_examples: bool = True,
    ) -> BDDGenerationResponse:
        """Generate BDD scenarios from a feature description.

        This method is an alias for generate_scenarios() for backwards compatibility.

        Args:
            feature_description: Description of the feature
            context: Additional context about the application
            max_scenarios: Maximum number of scenarios to generate
            include_examples: Whether to include Scenario Outline examples

        Returns:
            BDDGenerationResponse with generated scenarios
        """
        return await self.generate_scenarios(
            feature_description=feature_description,
            context=context,
            scenario_focus="comprehensive",
            max_scenarios=max_scenarios,
            include_examples=include_examples,
            include_tags=True,
        )

    def _parse_response(self, content: str) -> Dict[str, Any]:
        """Parse the LLM response content into BDD scenarios.

        Args:
            content: JSON string from the LLM response.

        Returns:
            Dictionary containing feature_name, background, and scenarios.

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

        # Handle both direct scenarios array and object with scenarios key
        if isinstance(data, list):
            scenarios_data = data
            feature_name = None
        elif isinstance(data, dict):
            if "scenarios" in data:
                scenarios_data = data["scenarios"]
                feature_name = data.get("feature_name")
            else:
                raise ValueError("Expected array or object with 'scenarios' key")
        else:
            raise ValueError("Expected JSON array or object")

        scenarios: List[BDDScenario] = []
        for item in scenarios_data:
            scenario = self._parse_scenario(item)
            scenarios.append(scenario)

        return {
            "scenarios": scenarios,
            "feature_name": feature_name,
            "background": data.get("background") if isinstance(data, dict) else None,
        }

    def _parse_scenario(self, data: Dict[str, Any]) -> BDDScenario:
        """Parse a single BDD scenario from JSON data.

        Args:
            data: Dictionary containing scenario data.

        Returns:
            BDDScenario object.

        Raises:
            ValueError: If required fields are missing.
        """
        if "name" not in data:
            raise ValueError("Scenario missing required field: name")

        # Extract given, when, then steps
        given = data.get("given", [])
        when = data.get("when", [])
        then = data.get("then", [])

        # Ensure they are lists
        if isinstance(given, str):
            given = [given]
        if isinstance(when, str):
            when = [when]
        if isinstance(then, str):
            then = [then]

        # Parse examples if present
        examples = data.get("examples")
        if examples is not None and not isinstance(examples, list):
            examples = None

        return BDDScenario(
            name=data["name"],
            given=given,
            when=when,
            then=then,
            examples=examples,
            tags=data.get("tags"),
        )

    def _extract_feature_name(self, description: str) -> str:
        """Extract a feature name from the description.

        Args:
            description: Feature description.

        Returns:
            A concise feature name.
        """
        # Take first sentence or first 50 characters
        first_sentence = description.split(".")[0].strip()
        if len(first_sentence) > 50:
            return first_sentence[:47] + "..."
        return first_sentence

    def _format_gherkin(
        self,
        feature_name: str,
        feature_description: str,
        scenarios: List[BDDScenario],
        include_tags: bool = True,
    ) -> str:
        """Format scenarios as a Gherkin feature file.

        Args:
            feature_name: Name of the feature.
            feature_description: Description of the feature.
            scenarios: List of BDD scenarios.
            include_tags: Whether to include scenario tags.

        Returns:
            Gherkin-formatted feature file content.
        """
        lines = [
            f"Feature: {feature_name}",
            f"  {feature_description}",
            "",
        ]

        for scenario in scenarios:
            # Add tags if present and enabled
            if include_tags and hasattr(scenario, "tags") and scenario.tags:
                tags_line = "  " + " ".join(scenario.tags)
                lines.append(tags_line)

            # Use Scenario Outline if there are examples
            if scenario.examples:
                lines.append(f"  Scenario Outline: {scenario.name}")
            else:
                lines.append(f"  Scenario: {scenario.name}")

            # Given steps
            for i, step in enumerate(scenario.given):
                prefix = "Given" if i == 0 else "And"
                lines.append(f"    {prefix} {step}")

            # When steps
            for i, step in enumerate(scenario.when):
                prefix = "When" if i == 0 else "And"
                lines.append(f"    {prefix} {step}")

            # Then steps
            for i, step in enumerate(scenario.then):
                prefix = "Then" if i == 0 else "And"
                lines.append(f"    {prefix} {step}")

            # Examples table
            if scenario.examples:
                lines.append("")
                lines.append("    Examples:")
                # Header
                keys = list(scenario.examples[0].keys())
                lines.append("      | " + " | ".join(keys) + " |")
                # Rows
                for example in scenario.examples:
                    values = [str(example[k]) for k in keys]
                    lines.append("      | " + " | ".join(values) + " |")

            lines.append("")

        return "\n".join(lines)

    async def _generate_mock_response(
        self,
        feature_description: str,
        max_scenarios: int,
        include_examples: bool,
        include_tags: bool,
    ) -> BDDGenerationResponse:
        """Generate mock BDD scenarios for development/testing.

        This method generates mock scenarios without calling the AI provider.
        Useful for testing, development, and when API keys are not configured.

        Args:
            feature_description: Feature description.
            max_scenarios: Maximum number of scenarios.
            include_examples: Whether to include examples.
            include_tags: Whether to include tags.

        Returns:
            BDDGenerationResponse with mock scenarios.
        """
        feature_name = self._extract_feature_name(feature_description)
        scenarios = self._generate_mock_scenarios(
            feature_description=feature_description,
            max_scenarios=max_scenarios,
            include_examples=include_examples,
            include_tags=include_tags,
        )

        gherkin = self._format_gherkin(
            feature_name=feature_name,
            feature_description=feature_description,
            scenarios=scenarios,
            include_tags=include_tags,
        )

        return BDDGenerationResponse(
            feature_name=feature_name,
            feature_description=feature_description,
            scenarios=scenarios,
            gherkin=gherkin,
            metadata={
                "provider": self.provider,
                "model": "mock",
                "scenario_focus": "comprehensive",
                "description_length": len(feature_description),
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
            },
        )

    def _generate_mock_scenarios(
        self,
        feature_description: str,
        max_scenarios: int,
        include_examples: bool,
        include_tags: bool,
    ) -> List[BDDScenario]:
        """Generate mock BDD scenarios for development/testing.

        Args:
            feature_description: Feature description.
            max_scenarios: Maximum number of scenarios.
            include_examples: Whether to include examples.
            include_tags: Whether to include tags.

        Returns:
            List of mock BDD scenarios.
        """
        scenarios: List[BDDScenario] = []

        # Happy path scenario
        if len(scenarios) < max_scenarios:
            tags = ["@smoke", "@happy-path"] if include_tags else None
            scenarios.append(
                BDDScenario(
                    name="Successfully complete the main flow",
                    given=["the user is logged in", "the user has required permissions"],
                    when=["the user performs the main action"],
                    then=[
                        "the action is completed successfully",
                        "the user sees a success message",
                    ],
                    examples=None,
                    tags=tags,
                )
            )

        # Validation scenario with examples
        if len(scenarios) < max_scenarios:
            examples: Optional[List[Dict[str, Any]]] = None
            if include_examples:
                examples = [
                    {"input": "valid_value", "result": "success"},
                    {"input": "invalid_value", "result": "error"},
                    {"input": "empty", "result": "error"},
                ]
            tags = ["@validation", "@regression"] if include_tags else None
            scenarios.append(
                BDDScenario(
                    name="Validate input data",
                    given=["the user is on the input form"],
                    when=["the user enters <input>", "the user submits the form"],
                    then=["the system shows <result>"],
                    examples=examples,
                    tags=tags,
                )
            )

        # Error handling scenario
        if len(scenarios) < max_scenarios:
            tags = ["@error-handling", "@regression"] if include_tags else None
            scenarios.append(
                BDDScenario(
                    name="Handle error conditions gracefully",
                    given=["the system is in an error state"],
                    when=["the user attempts to perform an action"],
                    then=[
                        "the user sees an appropriate error message",
                        "the user can recover from the error",
                    ],
                    examples=None,
                    tags=tags,
                )
            )

        return scenarios
