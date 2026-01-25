"""BDD scenario generation service using AI."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.models.responses import BDDGenerationResponse, BDDScenario


class BDDGenerator:
    """Service for generating BDD scenarios (Gherkin format) from feature descriptions."""

    def __init__(
        self, api_key: Optional[str] = None, provider: str = "openai"
    ) -> None:
        """Initialize the BDD generator.

        Args:
            api_key: API key for the AI provider
            provider: AI provider to use ('openai' or 'anthropic')
        """
        self.api_key = api_key
        self.provider = provider

    async def generate(
        self,
        feature_description: str,
        context: Optional[str] = None,
        max_scenarios: int = 3,
        include_examples: bool = True,
    ) -> BDDGenerationResponse:
        """Generate BDD scenarios from a feature description.

        Args:
            feature_description: Description of the feature
            context: Additional context about the application
            max_scenarios: Maximum number of scenarios to generate
            include_examples: Whether to include Scenario Outline examples

        Returns:
            BDDGenerationResponse with generated scenarios
        """
        # For now, return mock data. In production, this would call the AI provider.
        feature_name = self._extract_feature_name(feature_description)
        scenarios = self._generate_mock_scenarios(
            feature_description=feature_description,
            max_scenarios=max_scenarios,
            include_examples=include_examples,
        )

        gherkin = self._format_gherkin(
            feature_name=feature_name,
            feature_description=feature_description,
            scenarios=scenarios,
        )

        return BDDGenerationResponse(
            feature_name=feature_name,
            feature_description=feature_description,
            scenarios=scenarios,
            gherkin=gherkin,
        )

    def _extract_feature_name(self, description: str) -> str:
        """Extract a feature name from the description.

        Args:
            description: Feature description

        Returns:
            A concise feature name
        """
        # Take first sentence or first 50 characters
        first_sentence = description.split(".")[0].strip()
        if len(first_sentence) > 50:
            return first_sentence[:47] + "..."
        return first_sentence

    def _generate_mock_scenarios(
        self,
        feature_description: str,
        max_scenarios: int,
        include_examples: bool,
    ) -> List[BDDScenario]:
        """Generate mock BDD scenarios for development/testing.

        Args:
            feature_description: Feature description
            max_scenarios: Maximum number of scenarios
            include_examples: Whether to include examples

        Returns:
            List of mock BDD scenarios
        """
        scenarios: List[BDDScenario] = []

        # Happy path scenario
        if len(scenarios) < max_scenarios:
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
            scenarios.append(
                BDDScenario(
                    name="Validate input data",
                    given=["the user is on the input form"],
                    when=["the user enters <input>", "the user submits the form"],
                    then=["the system shows <result>"],
                    examples=examples,
                )
            )

        # Error handling scenario
        if len(scenarios) < max_scenarios:
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
                )
            )

        return scenarios

    def _format_gherkin(
        self,
        feature_name: str,
        feature_description: str,
        scenarios: List[BDDScenario],
    ) -> str:
        """Format scenarios as a Gherkin feature file.

        Args:
            feature_name: Name of the feature
            feature_description: Description of the feature
            scenarios: List of BDD scenarios

        Returns:
            Gherkin-formatted feature file content
        """
        lines = [
            f"Feature: {feature_name}",
            f"  {feature_description}",
            "",
        ]

        for scenario in scenarios:
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
