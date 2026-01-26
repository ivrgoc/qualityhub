"""Prompt templates for AI services."""

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

__all__ = [
    "BDDGenerationPrompts",
    "build_bdd_generation_system_prompt",
    "build_bdd_generation_user_prompt",
    "build_gherkin_formatting_prompt",
    "TestGenerationPrompts",
    "build_test_generation_system_prompt",
    "build_test_generation_user_prompt",
]
