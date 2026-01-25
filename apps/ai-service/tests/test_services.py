"""Tests for service classes."""

import pytest

from app.services.bdd_generator import BDDGenerator
from app.services.test_generator import TestGenerator


class TestTestGenerator:
    """Tests for the TestGenerator service."""

    @pytest.fixture
    def generator(self) -> TestGenerator:
        """Create a TestGenerator instance."""
        return TestGenerator()

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


class TestBDDGenerator:
    """Tests for the BDDGenerator service."""

    @pytest.fixture
    def generator(self) -> BDDGenerator:
        """Create a BDDGenerator instance."""
        return BDDGenerator()

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
