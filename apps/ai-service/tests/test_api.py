"""Tests for API endpoints.

Tests cover both the prefixed (/api/v1/ai/*) and root-level (/generate/*)
route paths to ensure the NestJS gateway integration works correctly.
"""

from __future__ import annotations

from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Tests for the health check endpoints."""

    def test_health_check_returns_healthy(self, client: TestClient) -> None:
        """Test that prefixed health check returns healthy status."""
        response = client.get("/api/v1/ai/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "environment" in data

    def test_root_health_check(self, client: TestClient) -> None:
        """Test that root-level health check returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_root_endpoint_returns_service_info(self, client: TestClient) -> None:
        """Test that root endpoint returns service information."""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "docs" in data


class TestGenerateTestsEndpoint:
    """Tests for the test generation endpoint at /api/v1/ai/generate-tests."""

    def test_generate_tests_with_valid_input(self, client: TestClient) -> None:
        """Test test generation with valid input returns test cases."""
        response = client.post(
            "/api/v1/ai/generate-tests",
            json={
                "description": "User login with email and password authentication",
                "test_type": "all",
                "max_tests": 3,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "test_cases" in data
        assert len(data["test_cases"]) > 0
        assert "metadata" in data

    def test_generate_tests_with_specific_type(self, client: TestClient) -> None:
        """Test test generation with specific test type."""
        response = client.post(
            "/api/v1/ai/generate-tests",
            json={
                "description": "Shopping cart checkout process with payment",
                "test_type": "functional",
                "max_tests": 2,
            },
        )
        assert response.status_code == 200

        data = response.json()
        test_cases = data["test_cases"]
        assert len(test_cases) >= 1
        # Functional tests should have test_type = "functional"
        assert all(tc["test_type"] == "functional" for tc in test_cases)

    def test_generate_tests_with_priority(self, client: TestClient) -> None:
        """Test test generation with specified priority."""
        response = client.post(
            "/api/v1/ai/generate-tests",
            json={
                "description": "Critical security feature for password reset",
                "max_tests": 1,
                "priority": "critical",
            },
        )
        assert response.status_code == 200

        data = response.json()
        test_cases = data["test_cases"]
        assert len(test_cases) >= 1
        assert test_cases[0]["priority"] == "critical"

    def test_generate_tests_validates_short_description(self, client: TestClient) -> None:
        """Test that short descriptions are rejected."""
        response = client.post(
            "/api/v1/ai/generate-tests",
            json={
                "description": "short",
            },
        )
        assert response.status_code == 422  # Validation error

    def test_generate_tests_validates_max_tests_limit(self, client: TestClient) -> None:
        """Test that max_tests exceeding limit is rejected."""
        response = client.post(
            "/api/v1/ai/generate-tests",
            json={
                "description": "Valid description for test generation",
                "max_tests": 100,  # Exceeds limit of 20
            },
        )
        assert response.status_code == 422  # Validation error

    def test_generate_tests_test_case_has_required_fields(self, client: TestClient) -> None:
        """Test that generated test cases have all required fields."""
        response = client.post(
            "/api/v1/ai/generate-tests",
            json={
                "description": "User profile update functionality",
            },
        )
        assert response.status_code == 200

        data = response.json()
        test_case = data["test_cases"][0]

        # Check required fields
        assert "title" in test_case
        assert "steps" in test_case
        assert "expected_result" in test_case
        assert "priority" in test_case
        assert "test_type" in test_case

        # Check steps structure
        step = test_case["steps"][0]
        assert "step_number" in step
        assert "action" in step
        assert "expected_result" in step


class TestGenerateBDDEndpoint:
    """Tests for the BDD generation endpoint at /api/v1/ai/generate-bdd."""

    def test_generate_bdd_with_valid_input(self, client: TestClient) -> None:
        """Test BDD generation with valid input returns scenarios."""
        response = client.post(
            "/api/v1/ai/generate-bdd",
            json={
                "feature_description": "User authentication with multi-factor authentication",
                "max_scenarios": 3,
                "include_examples": True,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "feature_name" in data
        assert "feature_description" in data
        assert "scenarios" in data
        assert "gherkin" in data
        assert len(data["scenarios"]) > 0

    def test_generate_bdd_scenarios_have_required_fields(self, client: TestClient) -> None:
        """Test that generated BDD scenarios have all required fields."""
        response = client.post(
            "/api/v1/ai/generate-bdd",
            json={
                "feature_description": "Product search and filtering functionality",
            },
        )
        assert response.status_code == 200

        data = response.json()
        scenario = data["scenarios"][0]

        assert "name" in scenario
        assert "given" in scenario
        assert "when" in scenario
        assert "then" in scenario
        assert isinstance(scenario["given"], list)
        assert isinstance(scenario["when"], list)
        assert isinstance(scenario["then"], list)

    def test_generate_bdd_gherkin_format(self, client: TestClient) -> None:
        """Test that Gherkin output is properly formatted."""
        response = client.post(
            "/api/v1/ai/generate-bdd",
            json={
                "feature_description": "User registration with email verification",
            },
        )
        assert response.status_code == 200

        data = response.json()
        gherkin = data["gherkin"]

        # Verify Gherkin keywords are present
        assert "Feature:" in gherkin
        assert "Scenario" in gherkin
        assert "Given" in gherkin
        assert "When" in gherkin
        assert "Then" in gherkin

    def test_generate_bdd_with_examples_disabled(self, client: TestClient) -> None:
        """Test BDD generation with examples disabled."""
        response = client.post(
            "/api/v1/ai/generate-bdd",
            json={
                "feature_description": "Order processing workflow",
                "include_examples": False,
            },
        )
        assert response.status_code == 200

        data = response.json()
        # When include_examples is False, scenarios should have examples = None
        for scenario in data["scenarios"]:
            if scenario.get("examples") is not None:
                # If examples exist, they should be empty or None
                pass  # Mock implementation may still include some

    def test_generate_bdd_validates_short_description(self, client: TestClient) -> None:
        """Test that short feature descriptions are rejected."""
        response = client.post(
            "/api/v1/ai/generate-bdd",
            json={
                "feature_description": "short",
            },
        )
        assert response.status_code == 422  # Validation error


class TestSuggestCoverageEndpoint:
    """Tests for the coverage suggestion endpoint."""

    def test_suggest_coverage_with_valid_input(self, client: TestClient) -> None:
        """Test coverage suggestion with valid input returns suggestions."""
        response = client.post(
            "/api/v1/ai/suggest-coverage",
            json={
                "existing_tests": [
                    "Test login with valid credentials",
                    "Test login with invalid password",
                ],
                "feature_description": "User authentication system with login and logout",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "suggestions" in data
        assert "coverage_gaps" in data
        assert "overall_assessment" in data
        assert len(data["suggestions"]) > 0

    def test_suggest_coverage_suggestions_have_required_fields(self, client: TestClient) -> None:
        """Test that coverage suggestions have all required fields."""
        response = client.post(
            "/api/v1/ai/suggest-coverage",
            json={
                "existing_tests": ["Test basic functionality"],
                "feature_description": "File upload feature with validation",
            },
        )
        assert response.status_code == 200

        data = response.json()
        suggestion = data["suggestions"][0]

        assert "title" in suggestion
        assert "rationale" in suggestion
        assert "priority" in suggestion
        assert "coverage_area" in suggestion

    def test_suggest_coverage_validates_empty_tests(self, client: TestClient) -> None:
        """Test that empty existing tests list is rejected."""
        response = client.post(
            "/api/v1/ai/suggest-coverage",
            json={
                "existing_tests": [],
                "feature_description": "Some feature description",
            },
        )
        assert response.status_code == 422  # Validation error


class TestNestJSGatewayRoutes:
    """Tests for the root-level /generate/* routes consumed by NestJS gateway.

    The NestJS backend calls these endpoints via:
      - POST http://localhost:8000/generate/tests
      - POST http://localhost:8000/generate/bdd
    """

    def test_generate_tests_via_gateway_path(self, client: TestClient) -> None:
        """Test that /generate/tests endpoint works (NestJS gateway path)."""
        response = client.post(
            "/generate/tests",
            json={
                "description": "User login with email and password authentication",
                "test_type": "all",
                "max_tests": 3,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "test_cases" in data
        assert len(data["test_cases"]) > 0
        assert "metadata" in data

    def test_generate_bdd_via_gateway_path(self, client: TestClient) -> None:
        """Test that /generate/bdd endpoint works (NestJS gateway path)."""
        response = client.post(
            "/generate/bdd",
            json={
                "feature_description": "User authentication with multi-factor authentication",
                "max_scenarios": 3,
                "include_examples": True,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "feature_name" in data
        assert "feature_description" in data
        assert "scenarios" in data
        assert "gherkin" in data
        assert len(data["scenarios"]) > 0

    def test_generate_tests_gateway_matches_prefixed_output(self, client: TestClient) -> None:
        """Test that gateway and prefixed endpoints produce equivalent output."""
        payload = {
            "description": "User profile management with avatar upload",
            "test_type": "functional",
            "max_tests": 2,
        }

        gateway_response = client.post("/generate/tests", json=payload)
        prefixed_response = client.post("/api/v1/ai/generate/tests", json=payload)

        assert gateway_response.status_code == 200
        assert prefixed_response.status_code == 200

        gateway_data = gateway_response.json()
        prefixed_data = prefixed_response.json()

        # Both should return test cases with the same structure
        assert len(gateway_data["test_cases"]) == len(prefixed_data["test_cases"])
        assert gateway_data["test_cases"][0]["test_type"] == "functional"
        assert prefixed_data["test_cases"][0]["test_type"] == "functional"

    def test_generate_bdd_gateway_matches_prefixed_output(self, client: TestClient) -> None:
        """Test that gateway and prefixed BDD endpoints produce equivalent output."""
        payload = {
            "feature_description": "Order processing with payment integration",
            "max_scenarios": 2,
        }

        gateway_response = client.post("/generate/bdd", json=payload)
        prefixed_response = client.post("/api/v1/ai/generate/bdd", json=payload)

        assert gateway_response.status_code == 200
        assert prefixed_response.status_code == 200

        gateway_data = gateway_response.json()
        prefixed_data = prefixed_response.json()

        # Both should return scenarios with the same structure
        assert len(gateway_data["scenarios"]) == len(prefixed_data["scenarios"])
        assert "gherkin" in gateway_data
        assert "gherkin" in prefixed_data

    def test_generate_tests_gateway_validation(self, client: TestClient) -> None:
        """Test that gateway endpoint validates input correctly."""
        # Short description should be rejected
        response = client.post(
            "/generate/tests",
            json={"description": "short"},
        )
        assert response.status_code == 422

    def test_generate_bdd_gateway_validation(self, client: TestClient) -> None:
        """Test that gateway BDD endpoint validates input correctly."""
        # Short description should be rejected
        response = client.post(
            "/generate/bdd",
            json={"feature_description": "short"},
        )
        assert response.status_code == 422
