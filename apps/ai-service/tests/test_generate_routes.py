"""Tests for generation routes (/generate/tests and /generate/bdd)."""

from fastapi.testclient import TestClient


class TestGenerateTestsRoute:
    """Tests for POST /generate/tests endpoint."""

    def test_generate_tests_with_valid_input(self, client: TestClient) -> None:
        """Test test generation returns test cases with valid input."""
        response = client.post(
            "/api/v1/ai/generate/tests",
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

    def test_generate_tests_with_minimal_input(self, client: TestClient) -> None:
        """Test test generation with only required fields."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "User registration flow with email verification",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "test_cases" in data
        assert len(data["test_cases"]) > 0

    def test_generate_tests_with_specific_test_type(self, client: TestClient) -> None:
        """Test test generation with specific test type filter."""
        response = client.post(
            "/api/v1/ai/generate/tests",
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
        assert all(tc["test_type"] == "functional" for tc in test_cases)

    def test_generate_tests_with_edge_case_type(self, client: TestClient) -> None:
        """Test test generation with edge case type filter."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "File upload with size and type validation",
                "test_type": "edge_case",
                "max_tests": 2,
            },
        )
        assert response.status_code == 200

        data = response.json()
        test_cases = data["test_cases"]
        assert len(test_cases) >= 1
        assert all(tc["test_type"] == "edge_case" for tc in test_cases)

    def test_generate_tests_with_negative_type(self, client: TestClient) -> None:
        """Test test generation with negative type filter."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "API authentication with token validation",
                "test_type": "negative",
                "max_tests": 2,
            },
        )
        assert response.status_code == 200

        data = response.json()
        test_cases = data["test_cases"]
        assert len(test_cases) >= 1
        assert all(tc["test_type"] == "negative" for tc in test_cases)

    def test_generate_tests_with_priority(self, client: TestClient) -> None:
        """Test test generation with specified priority."""
        response = client.post(
            "/api/v1/ai/generate/tests",
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

    def test_generate_tests_with_context(self, client: TestClient) -> None:
        """Test test generation with additional context."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "User notification preferences",
                "context": "E-commerce platform with email and SMS notifications",
                "max_tests": 2,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "test_cases" in data
        assert len(data["test_cases"]) > 0

    def test_generate_tests_test_case_structure(self, client: TestClient) -> None:
        """Test that generated test cases have all required fields."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "User profile update functionality with image upload",
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
        assert len(test_case["steps"]) > 0
        step = test_case["steps"][0]
        assert "step_number" in step
        assert "action" in step
        assert "expected_result" in step

    def test_generate_tests_metadata_present(self, client: TestClient) -> None:
        """Test that response includes metadata."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "Dashboard analytics with charts and filters",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "metadata" in data
        # Metadata should contain provider info when available
        assert isinstance(data["metadata"], dict)

    def test_generate_tests_validates_short_description(self, client: TestClient) -> None:
        """Test that descriptions shorter than 10 characters are rejected."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "short",
            },
        )
        assert response.status_code == 422

    def test_generate_tests_validates_max_tests_upper_limit(self, client: TestClient) -> None:
        """Test that max_tests exceeding 20 is rejected."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "Valid description for test generation endpoint",
                "max_tests": 25,
            },
        )
        assert response.status_code == 422

    def test_generate_tests_validates_max_tests_lower_limit(self, client: TestClient) -> None:
        """Test that max_tests below 1 is rejected."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "Valid description for test generation endpoint",
                "max_tests": 0,
            },
        )
        assert response.status_code == 422

    def test_generate_tests_validates_invalid_test_type(self, client: TestClient) -> None:
        """Test that invalid test_type is rejected."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "Valid description for test generation endpoint",
                "test_type": "invalid_type",
            },
        )
        assert response.status_code == 422

    def test_generate_tests_validates_invalid_priority(self, client: TestClient) -> None:
        """Test that invalid priority is rejected."""
        response = client.post(
            "/api/v1/ai/generate/tests",
            json={
                "description": "Valid description for test generation endpoint",
                "priority": "urgent",
            },
        )
        assert response.status_code == 422


class TestGenerateBDDRoute:
    """Tests for POST /generate/bdd endpoint."""

    def test_generate_bdd_with_valid_input(self, client: TestClient) -> None:
        """Test BDD generation returns scenarios with valid input."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
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

    def test_generate_bdd_with_minimal_input(self, client: TestClient) -> None:
        """Test BDD generation with only required fields."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "User registration with email confirmation flow",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "feature_name" in data
        assert "scenarios" in data
        assert len(data["scenarios"]) > 0

    def test_generate_bdd_scenario_structure(self, client: TestClient) -> None:
        """Test that generated BDD scenarios have all required fields."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
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
        assert len(scenario["given"]) > 0
        assert len(scenario["when"]) > 0
        assert len(scenario["then"]) > 0

    def test_generate_bdd_gherkin_format(self, client: TestClient) -> None:
        """Test that Gherkin output is properly formatted."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "User registration with email verification process",
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

    def test_generate_bdd_with_context(self, client: TestClient) -> None:
        """Test BDD generation with additional context."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "Shopping cart management functionality",
                "context": "E-commerce platform for digital products with guest checkout",
                "max_scenarios": 2,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "scenarios" in data
        assert len(data["scenarios"]) > 0

    def test_generate_bdd_with_examples_enabled(self, client: TestClient) -> None:
        """Test BDD generation with examples enabled."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "User role-based access control for resources",
                "include_examples": True,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "scenarios" in data

    def test_generate_bdd_with_examples_disabled(self, client: TestClient) -> None:
        """Test BDD generation with examples disabled."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "Order processing workflow with status updates",
                "include_examples": False,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "scenarios" in data

    def test_generate_bdd_metadata_present(self, client: TestClient) -> None:
        """Test that response includes metadata."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "Real-time notification delivery system",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert "metadata" in data
        assert isinstance(data["metadata"], dict)

    def test_generate_bdd_validates_short_description(self, client: TestClient) -> None:
        """Test that descriptions shorter than 10 characters are rejected."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "short",
            },
        )
        assert response.status_code == 422

    def test_generate_bdd_validates_max_scenarios_upper_limit(self, client: TestClient) -> None:
        """Test that max_scenarios exceeding 10 is rejected."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "Valid feature description for BDD generation",
                "max_scenarios": 15,
            },
        )
        assert response.status_code == 422

    def test_generate_bdd_validates_max_scenarios_lower_limit(self, client: TestClient) -> None:
        """Test that max_scenarios below 1 is rejected."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "feature_description": "Valid feature description for BDD generation",
                "max_scenarios": 0,
            },
        )
        assert response.status_code == 422

    def test_generate_bdd_missing_required_field(self, client: TestClient) -> None:
        """Test that missing feature_description is rejected."""
        response = client.post(
            "/api/v1/ai/generate/bdd",
            json={
                "max_scenarios": 3,
            },
        )
        assert response.status_code == 422
