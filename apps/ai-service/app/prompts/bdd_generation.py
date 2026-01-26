"""Prompt templates for BDD (Behavior-Driven Development) scenario generation.

This module provides system and user prompt templates for generating Gherkin-format
BDD scenarios from feature descriptions using AI models.
"""

from __future__ import annotations

from typing import Literal, Optional


class BDDGenerationPrompts:
    """Container for BDD generation prompt templates."""

    SYSTEM_PROMPT = """You are an expert BDD (Behavior-Driven Development) practitioner specializing in writing \
clear, maintainable Gherkin scenarios. Your role is to generate comprehensive BDD scenarios from feature descriptions.

## Your Expertise
- Writing clear Given/When/Then scenarios that capture business requirements
- Creating Scenario Outlines with Examples for data-driven testing
- Identifying positive, negative, and edge case scenarios
- Following Gherkin best practices and conventions
- Writing scenarios that are readable by both technical and non-technical stakeholders

## Output Format
You must return BDD scenarios as a valid JSON object with this structure:

```json
{
  "feature_name": "Concise feature name",
  "background": {
    "given": ["optional shared preconditions for all scenarios"]
  },
  "scenarios": [
    {
      "name": "Clear, descriptive scenario name",
      "type": "scenario|scenario_outline",
      "tags": ["@tag1", "@tag2"],
      "given": ["precondition step 1", "precondition step 2"],
      "when": ["action step 1", "action step 2"],
      "then": ["expected outcome 1", "expected outcome 2"],
      "examples": [
        {"column1": "value1", "column2": "value2"},
        {"column1": "value3", "column2": "value4"}
      ]
    }
  ]
}
```

## Gherkin Writing Guidelines

### General Principles
1. **Write declarative, not imperative**: Focus on WHAT, not HOW
   - Good: "Given the user is logged in"
   - Bad: "Given the user enters username and clicks login button"

2. **Use consistent language**: Establish a ubiquitous language and stick to it
   - Pick one term (e.g., "customer" vs "user") and use it consistently

3. **Keep scenarios independent**: Each scenario should be self-contained
   - Do not rely on state from other scenarios
   - Use Background for common setup when appropriate

4. **One behavior per scenario**: Test a single aspect of functionality
   - Avoid combining multiple behaviors in one scenario

### Given Steps (Preconditions)
- Describe the initial context or state
- Set up the system state before the action
- Examples:
  - "the user is logged in as an admin"
  - "there are 5 items in the shopping cart"
  - "the payment service is available"

### When Steps (Actions)
- Describe the action or event that triggers the behavior
- Should be a single, clear action
- Examples:
  - "the user submits the order"
  - "the system receives a payment confirmation"
  - "the user clicks the delete button"

### Then Steps (Outcomes)
- Describe the expected outcome or result
- Should be verifiable
- Examples:
  - "the order status should be 'confirmed'"
  - "the user should see a success message"
  - "the item should be removed from the cart"

### Scenario Outlines with Examples
- Use for data-driven testing with multiple input combinations
- Use placeholders with angle brackets: <placeholder>
- Provide clear, meaningful example values
- Include both valid and invalid inputs

### Tags
- Use meaningful tags for filtering and organization
- Common tags: @smoke, @regression, @critical, @api, @ui, @security
- Feature-specific tags: @login, @checkout, @search

## Quality Standards
- Scenarios should be understandable by non-technical stakeholders
- Each step should be atomic and testable
- Use consistent verb tense (present tense is preferred)
- Avoid technical implementation details
- Include both happy path and error scenarios"""

    USER_PROMPT_TEMPLATE = """Generate BDD scenarios in Gherkin format for the following feature:

## Feature Description
{feature_description}
{context_section}
## Instructions
- Generate up to {max_scenarios} scenarios
- Focus on {scenario_focus}
{examples_instruction}
{tags_instruction}
- Return ONLY the JSON object with the scenarios, no additional text or markdown formatting

## Response
Provide your response as a valid JSON object:"""

    SCENARIO_FOCUS_INSTRUCTIONS = {
        "happy_path": "positive scenarios that verify the main success flows",
        "error_handling": "error scenarios and edge cases that verify proper handling of failures",
        "validation": "input validation scenarios covering valid and invalid data",
        "security": "security-related scenarios including authentication, authorization, and data protection",
        "comprehensive": "a comprehensive mix of happy path, error handling, edge cases, and validation scenarios",
    }

    GHERKIN_FORMATTING_TEMPLATE = """Format the following BDD scenarios as a complete Gherkin feature file:

Feature Name: {feature_name}
Feature Description: {feature_description}

Background (if applicable):
{background}

Scenarios:
{scenarios_json}

## Instructions
- Format as a valid Gherkin feature file
- Use proper indentation (2 spaces)
- Include Background section if shared preconditions exist
- Use "Scenario Outline" for scenarios with examples
- Format Examples tables properly with pipes
- Include tags on separate lines before scenarios
- Return ONLY the Gherkin text, no additional commentary

## Response
Provide the complete Gherkin feature file:"""


def build_bdd_generation_system_prompt() -> str:
    """Build the system prompt for BDD scenario generation.

    Returns:
        The system prompt string for configuring the AI model.
    """
    return BDDGenerationPrompts.SYSTEM_PROMPT


def build_bdd_generation_user_prompt(
    feature_description: str,
    max_scenarios: int = 3,
    context: Optional[str] = None,
    scenario_focus: Literal[
        "happy_path", "error_handling", "validation", "security", "comprehensive"
    ] = "comprehensive",
    include_examples: bool = True,
    include_tags: bool = True,
) -> str:
    """Build the user prompt for BDD scenario generation.

    Args:
        feature_description: The feature description to generate scenarios from.
        max_scenarios: Maximum number of scenarios to generate.
        context: Additional context about the application or feature.
        scenario_focus: Type of scenarios to focus on.
        include_examples: Whether to include Scenario Outline examples.
        include_tags: Whether to include scenario tags.

    Returns:
        The formatted user prompt string.
    """
    context_section = ""
    if context:
        context_section = f"\n## Additional Context\n{context}\n"

    focus_instruction = BDDGenerationPrompts.SCENARIO_FOCUS_INSTRUCTIONS.get(
        scenario_focus, BDDGenerationPrompts.SCENARIO_FOCUS_INSTRUCTIONS["comprehensive"]
    )

    examples_instruction = ""
    if include_examples:
        examples_instruction = (
            "- Include Scenario Outlines with Examples tables for data-driven scenarios\n"
        )
    else:
        examples_instruction = "- Use simple Scenarios without Examples tables\n"

    tags_instruction = ""
    if include_tags:
        tags_instruction = "- Include appropriate tags for each scenario (e.g., @smoke, @regression, @critical)\n"
    else:
        tags_instruction = "- Do not include tags on scenarios\n"

    return BDDGenerationPrompts.USER_PROMPT_TEMPLATE.format(
        feature_description=feature_description,
        context_section=context_section,
        max_scenarios=max_scenarios,
        scenario_focus=focus_instruction,
        examples_instruction=examples_instruction,
        tags_instruction=tags_instruction,
    )


def build_gherkin_formatting_prompt(
    feature_name: str,
    feature_description: str,
    scenarios_json: str,
    background: Optional[str] = None,
) -> str:
    """Build a prompt to format scenarios as a Gherkin feature file.

    Args:
        feature_name: Name of the feature.
        feature_description: Description of the feature.
        scenarios_json: JSON string of scenarios to format.
        background: Optional background steps in JSON format.

    Returns:
        The formatted prompt string.
    """
    background_text = background if background else "None"

    return BDDGenerationPrompts.GHERKIN_FORMATTING_TEMPLATE.format(
        feature_name=feature_name,
        feature_description=feature_description,
        background=background_text,
        scenarios_json=scenarios_json,
    )
