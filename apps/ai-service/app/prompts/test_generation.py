"""Prompt templates for test case generation.

This module provides system and user prompt templates for generating test cases
from requirements or feature descriptions using AI models.
"""

from __future__ import annotations

from typing import Literal, Optional


class TestGenerationPrompts:
    """Container for test generation prompt templates."""

    SYSTEM_PROMPT = """You are an expert QA engineer specializing in test case design and creation. \
Your role is to generate comprehensive, well-structured test cases from requirements or feature descriptions.

## Your Expertise
- Writing clear, actionable test cases with precise steps
- Identifying edge cases and boundary conditions
- Creating negative test scenarios to verify error handling
- Ensuring test coverage across functional, security, and usability aspects
- Following industry best practices for test design

## Output Format
You must return test cases as a valid JSON array. Each test case should follow this structure:

```json
[
  {
    "title": "Clear, descriptive test case title",
    "preconditions": "Conditions that must be met before executing the test",
    "steps": [
      {
        "step_number": 1,
        "action": "Specific action to perform",
        "expected_result": "Expected outcome of this action"
      }
    ],
    "expected_result": "Overall expected outcome of the test",
    "priority": "critical|high|medium|low",
    "test_type": "functional|edge_case|negative"
  }
]
```

## Guidelines
1. **Titles**: Use clear, descriptive titles that indicate what is being tested
2. **Preconditions**: List all necessary setup steps and system state requirements
3. **Steps**: Each step should be atomic and verifiable with clear expected results
4. **Priority**: Assign based on business impact and risk
   - critical: Core functionality, security, data integrity
   - high: Important features affecting user experience
   - medium: Standard functionality
   - low: Nice-to-have features, cosmetic issues
5. **Test Types**:
   - functional: Verify feature works as specified
   - edge_case: Test boundary conditions and limits
   - negative: Verify proper error handling for invalid inputs

## Quality Standards
- Each test case must be independently executable
- Steps should be specific enough for any tester to follow
- Avoid vague actions like "verify it works" - be explicit
- Include data examples where appropriate
- Consider different user roles and permissions when relevant"""

    USER_PROMPT_TEMPLATE = """Generate {test_type} test cases for the following requirement:

## Requirement/Feature Description
{description}
{context_section}
## Instructions
- Generate up to {max_tests} test cases
- Focus on {test_type_instruction}
{priority_instruction}
- Return ONLY the JSON array of test cases, no additional text or markdown formatting

## Response
Provide your response as a valid JSON array:"""

    TEST_TYPE_INSTRUCTIONS = {
        "functional": "functional testing to verify the feature works as specified",
        "edge_case": "edge cases and boundary conditions that could cause issues",
        "negative": "negative testing scenarios with invalid inputs and error conditions",
        "all": "a mix of functional tests, edge cases, and negative scenarios",
    }


def build_test_generation_system_prompt() -> str:
    """Build the system prompt for test generation.

    Returns:
        The system prompt string for configuring the AI model.
    """
    return TestGenerationPrompts.SYSTEM_PROMPT


def build_test_generation_user_prompt(
    description: str,
    test_type: Literal["functional", "edge_case", "negative", "all"] = "all",
    max_tests: int = 5,
    context: Optional[str] = None,
    priority: Optional[Literal["critical", "high", "medium", "low"]] = None,
) -> str:
    """Build the user prompt for test generation.

    Args:
        description: The requirement or feature description to generate tests from.
        test_type: Type of test cases to generate.
        max_tests: Maximum number of test cases to generate.
        context: Additional context about the application or feature.
        priority: Priority level to assign to generated test cases.

    Returns:
        The formatted user prompt string.
    """
    context_section = ""
    if context:
        context_section = f"\n## Additional Context\n{context}\n"

    priority_instruction = ""
    if priority:
        priority_instruction = f"- Assign priority level '{priority}' to all test cases\n"
    else:
        priority_instruction = "- Assign appropriate priority levels based on the criticality of each scenario\n"

    test_type_instruction = TestGenerationPrompts.TEST_TYPE_INSTRUCTIONS.get(
        test_type, TestGenerationPrompts.TEST_TYPE_INSTRUCTIONS["all"]
    )

    return TestGenerationPrompts.USER_PROMPT_TEMPLATE.format(
        description=description,
        context_section=context_section,
        test_type=test_type,
        max_tests=max_tests,
        test_type_instruction=test_type_instruction,
        priority_instruction=priority_instruction,
    )
