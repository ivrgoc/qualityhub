"""Tests for LLM client abstraction."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.schemas.generation import LLMMessage, LLMPrompt
from app.services.llm_client import (
    AnthropicClient,
    BaseLLMClient,
    LLMAuthenticationError,
    LLMClientError,
    LLMInvalidRequestError,
    LLMProviderError,
    LLMRateLimitError,
    LLMResponse,
    OpenAIClient,
    get_default_client,
    get_llm_client,
)


class TestLLMResponse:
    """Tests for LLMResponse dataclass."""

    def test_llm_response_creation(self) -> None:
        """Test that LLMResponse can be created with all fields."""
        response = LLMResponse(
            content="Hello, world!",
            model="gpt-4",
            prompt_tokens=10,
            completion_tokens=5,
            total_tokens=15,
            finish_reason="stop",
            raw_response={"id": "test"},
        )

        assert response.content == "Hello, world!"
        assert response.model == "gpt-4"
        assert response.prompt_tokens == 10
        assert response.completion_tokens == 5
        assert response.total_tokens == 15
        assert response.finish_reason == "stop"
        assert response.raw_response == {"id": "test"}

    def test_llm_response_optional_fields(self) -> None:
        """Test that optional fields default to None."""
        response = LLMResponse(
            content="Test",
            model="gpt-4",
            prompt_tokens=5,
            completion_tokens=5,
            total_tokens=10,
        )

        assert response.finish_reason is None
        assert response.raw_response is None


class TestLLMExceptions:
    """Tests for LLM exception hierarchy."""

    def test_llm_client_error_is_base(self) -> None:
        """Test that LLMClientError is the base exception."""
        error = LLMClientError("test error")
        assert str(error) == "test error"

    def test_authentication_error_inherits(self) -> None:
        """Test that LLMAuthenticationError inherits from LLMClientError."""
        error = LLMAuthenticationError("auth failed")
        assert isinstance(error, LLMClientError)
        assert str(error) == "auth failed"

    def test_rate_limit_error_inherits(self) -> None:
        """Test that LLMRateLimitError inherits from LLMClientError."""
        error = LLMRateLimitError("rate limited")
        assert isinstance(error, LLMClientError)

    def test_invalid_request_error_inherits(self) -> None:
        """Test that LLMInvalidRequestError inherits from LLMClientError."""
        error = LLMInvalidRequestError("bad request")
        assert isinstance(error, LLMClientError)

    def test_provider_error_inherits(self) -> None:
        """Test that LLMProviderError inherits from LLMClientError."""
        error = LLMProviderError("provider error")
        assert isinstance(error, LLMClientError)


class TestOpenAIClient:
    """Tests for OpenAIClient."""

    @pytest.fixture
    def client(self) -> OpenAIClient:
        """Create an OpenAI client with test API key."""
        return OpenAIClient(api_key="test-key")

    def test_initialization_with_api_key(self) -> None:
        """Test client initialization with API key."""
        client = OpenAIClient(api_key="test-key")
        assert client.api_key == "test-key"
        assert client.model == "gpt-4o"

    def test_initialization_with_custom_model(self) -> None:
        """Test client initialization with custom model."""
        client = OpenAIClient(api_key="test-key", model="gpt-4o")
        assert client.model == "gpt-4o"

    def test_initialization_with_custom_params(self) -> None:
        """Test client initialization with custom parameters."""
        client = OpenAIClient(
            api_key="test-key",
            model="gpt-4",
            temperature=0.5,
            max_tokens=2048,
            timeout=30.0,
        )
        assert client.temperature == 0.5
        assert client.max_tokens == 2048
        assert client.timeout == 30.0

    def test_provider_name(self) -> None:
        """Test that provider name is 'openai'."""
        assert OpenAIClient.provider_name() == "openai"

    def test_validate_temperature_clamps_high(self) -> None:
        """Test that temperature is clamped to maximum."""
        client = OpenAIClient(api_key="test-key")
        result = client._validate_temperature(3.0)
        assert result == 2.0

    def test_validate_temperature_clamps_low(self) -> None:
        """Test that temperature is clamped to minimum."""
        client = OpenAIClient(api_key="test-key")
        result = client._validate_temperature(-1.0)
        assert result == 0.0

    def test_validate_temperature_valid(self) -> None:
        """Test that valid temperature passes through."""
        client = OpenAIClient(api_key="test-key")
        result = client._validate_temperature(0.7)
        assert result == 0.7

    def test_convert_messages(self, client: OpenAIClient) -> None:
        """Test message conversion to OpenAI format."""
        messages = [
            LLMMessage(role="system", content="You are helpful."),
            LLMMessage(role="user", content="Hello"),
        ]
        result = client._convert_messages(messages)

        assert len(result) == 2
        assert result[0] == {"role": "system", "content": "You are helpful."}
        assert result[1] == {"role": "user", "content": "Hello"}

    def test_get_client_without_api_key_raises(self) -> None:
        """Test that _get_client raises without API key."""
        client = OpenAIClient(api_key=None)
        # Mock settings to return None for api key
        with patch("app.services.llm_client.get_settings") as mock_settings:
            mock_settings.return_value.openai_api_key = None
            client.api_key = None
            with pytest.raises(LLMAuthenticationError, match="API key not configured"):
                client._get_client()

    @pytest.mark.asyncio
    async def test_complete_success(self, client: OpenAIClient) -> None:
        """Test successful completion."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(content="Generated response"),
                finish_reason="stop",
            )
        ]
        mock_response.model = "gpt-4-turbo-preview"
        mock_response.usage = MagicMock(
            prompt_tokens=10, completion_tokens=5, total_tokens=15
        )
        mock_response.model_dump.return_value = {"id": "test"}

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch.object(client, "_get_client", return_value=mock_client):
            prompt = LLMPrompt(
                messages=[
                    LLMMessage(role="system", content="You are helpful."),
                    LLMMessage(role="user", content="Hello"),
                ]
            )
            result = await client.complete(prompt)

            assert result.content == "Generated response"
            assert result.model == "gpt-4-turbo-preview"
            assert result.prompt_tokens == 10
            assert result.completion_tokens == 5
            assert result.total_tokens == 15
            assert result.finish_reason == "stop"

    @pytest.mark.asyncio
    async def test_complete_with_json_mode(self, client: OpenAIClient) -> None:
        """Test completion with JSON mode."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(content='{"key": "value"}'),
                finish_reason="stop",
            )
        ]
        mock_response.model = "gpt-4-turbo-preview"
        mock_response.usage = MagicMock(
            prompt_tokens=10, completion_tokens=5, total_tokens=15
        )
        mock_response.model_dump.return_value = {}

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch.object(client, "_get_client", return_value=mock_client):
            prompt = LLMPrompt(
                messages=[LLMMessage(role="user", content="Generate JSON")]
            )
            result = await client.complete(prompt, json_mode=True)

            # Verify json mode was passed
            call_kwargs = mock_client.chat.completions.create.call_args[1]
            assert call_kwargs["response_format"] == {"type": "json_object"}
            assert result.content == '{"key": "value"}'

    @pytest.mark.asyncio
    async def test_complete_simple_success(self, client: OpenAIClient) -> None:
        """Test simple completion method."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(content="Hi there!"),
                finish_reason="stop",
            )
        ]
        mock_response.model = "gpt-4-turbo-preview"
        mock_response.usage = MagicMock(
            prompt_tokens=5, completion_tokens=3, total_tokens=8
        )
        mock_response.model_dump.return_value = {}

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch.object(client, "_get_client", return_value=mock_client):
            result = await client.complete_simple(
                system_prompt="Be friendly.",
                user_prompt="Hello",
            )

            assert result.content == "Hi there!"

    @pytest.mark.asyncio
    async def test_complete_authentication_error(self, client: OpenAIClient) -> None:
        """Test handling of authentication errors."""
        from openai import AuthenticationError

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=AuthenticationError(
                message="Invalid API key",
                response=MagicMock(status_code=401),
                body=None,
            )
        )

        with patch.object(client, "_get_client", return_value=mock_client):
            prompt = LLMPrompt(
                messages=[LLMMessage(role="user", content="Hello")]
            )
            with pytest.raises(LLMAuthenticationError, match="authentication failed"):
                await client.complete(prompt)

    @pytest.mark.asyncio
    async def test_complete_rate_limit_error(self, client: OpenAIClient) -> None:
        """Test handling of rate limit errors."""
        from openai import RateLimitError

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=RateLimitError(
                message="Rate limited",
                response=MagicMock(status_code=429),
                body=None,
            )
        )

        with patch.object(client, "_get_client", return_value=mock_client):
            prompt = LLMPrompt(
                messages=[LLMMessage(role="user", content="Hello")]
            )
            with pytest.raises(LLMRateLimitError, match="rate limit"):
                await client.complete(prompt)


class TestAnthropicClient:
    """Tests for AnthropicClient."""

    @pytest.fixture
    def client(self) -> AnthropicClient:
        """Create an Anthropic client with test API key."""
        return AnthropicClient(api_key="test-key")

    def test_initialization_with_api_key(self) -> None:
        """Test client initialization with API key."""
        client = AnthropicClient(api_key="test-key")
        assert client.api_key == "test-key"
        assert client.model == "claude-sonnet-4-20250514"

    def test_initialization_with_custom_model(self) -> None:
        """Test client initialization with custom model."""
        client = AnthropicClient(api_key="test-key", model="claude-3-opus-20240229")
        assert client.model == "claude-3-opus-20240229"

    def test_provider_name(self) -> None:
        """Test that provider name is 'anthropic'."""
        assert AnthropicClient.provider_name() == "anthropic"

    def test_validate_temperature_clamps_to_one(self) -> None:
        """Test that temperature is clamped to Anthropic's max of 1.0."""
        client = AnthropicClient(api_key="test-key")
        result = client._validate_temperature(1.5)
        assert result == 1.0

    def test_validate_temperature_clamps_low(self) -> None:
        """Test that temperature is clamped to minimum."""
        client = AnthropicClient(api_key="test-key")
        result = client._validate_temperature(-0.5)
        assert result == 0.0

    def test_extract_system_message(self, client: AnthropicClient) -> None:
        """Test extraction of system message."""
        messages = [
            LLMMessage(role="system", content="You are helpful."),
            LLMMessage(role="user", content="Hello"),
            LLMMessage(role="assistant", content="Hi"),
        ]
        system, remaining = client._extract_system_message(messages)

        assert system == "You are helpful."
        assert len(remaining) == 2
        assert remaining[0].role == "user"
        assert remaining[1].role == "assistant"

    def test_extract_system_message_no_system(self, client: AnthropicClient) -> None:
        """Test extraction when no system message present."""
        messages = [
            LLMMessage(role="user", content="Hello"),
        ]
        system, remaining = client._extract_system_message(messages)

        assert system is None
        assert len(remaining) == 1

    def test_convert_messages(self, client: AnthropicClient) -> None:
        """Test message conversion to Anthropic format."""
        messages = [
            LLMMessage(role="user", content="Hello"),
            LLMMessage(role="assistant", content="Hi"),
        ]
        result = client._convert_messages(messages)

        assert len(result) == 2
        assert result[0] == {"role": "user", "content": "Hello"}
        assert result[1] == {"role": "assistant", "content": "Hi"}

    def test_get_client_without_api_key_raises(self) -> None:
        """Test that _get_client raises without API key."""
        client = AnthropicClient(api_key=None)
        with patch("app.services.llm_client.get_settings") as mock_settings:
            mock_settings.return_value.anthropic_api_key = None
            client.api_key = None
            with pytest.raises(LLMAuthenticationError, match="API key not configured"):
                client._get_client()

    @pytest.mark.asyncio
    async def test_complete_success(self, client: AnthropicClient) -> None:
        """Test successful completion."""
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Generated response")]
        mock_response.model = "claude-3-sonnet-20240229"
        mock_response.usage = MagicMock(input_tokens=10, output_tokens=5)
        mock_response.stop_reason = "end_turn"
        mock_response.model_dump.return_value = {"id": "test"}

        mock_client = AsyncMock()
        mock_client.messages.create = AsyncMock(return_value=mock_response)

        with patch.object(client, "_get_client", return_value=mock_client):
            prompt = LLMPrompt(
                messages=[
                    LLMMessage(role="system", content="You are helpful."),
                    LLMMessage(role="user", content="Hello"),
                ]
            )
            result = await client.complete(prompt)

            assert result.content == "Generated response"
            assert result.model == "claude-3-sonnet-20240229"
            assert result.prompt_tokens == 10
            assert result.completion_tokens == 5
            assert result.total_tokens == 15
            assert result.finish_reason == "end_turn"

    @pytest.mark.asyncio
    async def test_complete_with_json_mode(self, client: AnthropicClient) -> None:
        """Test completion with JSON mode adds instruction."""
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text='{"result": "ok"}')]
        mock_response.model = "claude-3-sonnet-20240229"
        mock_response.usage = MagicMock(input_tokens=15, output_tokens=5)
        mock_response.stop_reason = "end_turn"
        mock_response.model_dump.return_value = {}

        mock_client = AsyncMock()
        mock_client.messages.create = AsyncMock(return_value=mock_response)

        with patch.object(client, "_get_client", return_value=mock_client):
            prompt = LLMPrompt(
                messages=[
                    LLMMessage(role="system", content="You are helpful."),
                    LLMMessage(role="user", content="Generate JSON"),
                ]
            )
            result = await client.complete(prompt, json_mode=True)

            # Verify system prompt includes JSON instruction
            call_kwargs = mock_client.messages.create.call_args[1]
            assert "JSON" in call_kwargs["system"]
            assert result.content == '{"result": "ok"}'

    @pytest.mark.asyncio
    async def test_complete_simple_success(self, client: AnthropicClient) -> None:
        """Test simple completion method."""
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Hi there!")]
        mock_response.model = "claude-3-sonnet-20240229"
        mock_response.usage = MagicMock(input_tokens=5, output_tokens=3)
        mock_response.stop_reason = "end_turn"
        mock_response.model_dump.return_value = {}

        mock_client = AsyncMock()
        mock_client.messages.create = AsyncMock(return_value=mock_response)

        with patch.object(client, "_get_client", return_value=mock_client):
            result = await client.complete_simple(
                system_prompt="Be friendly.",
                user_prompt="Hello",
            )

            assert result.content == "Hi there!"


class TestGetLLMClient:
    """Tests for the get_llm_client factory function."""

    def test_get_openai_client(self) -> None:
        """Test getting OpenAI client."""
        client = get_llm_client(provider="openai", api_key="test-key")
        assert isinstance(client, OpenAIClient)

    def test_get_anthropic_client(self) -> None:
        """Test getting Anthropic client."""
        client = get_llm_client(provider="anthropic", api_key="test-key")
        assert isinstance(client, AnthropicClient)

    def test_unknown_provider_raises(self) -> None:
        """Test that unknown provider raises ValueError."""
        with pytest.raises(ValueError, match="Unknown provider"):
            get_llm_client(provider="unknown", api_key="test-key")  # type: ignore

    def test_passes_parameters(self) -> None:
        """Test that parameters are passed to client."""
        client = get_llm_client(
            provider="openai",
            api_key="test-key",
            model="gpt-4o",
            temperature=0.5,
            max_tokens=2048,
            timeout=45.0,
        )
        assert client.api_key == "test-key"
        assert client.model == "gpt-4o"
        assert client.temperature == 0.5
        assert client.max_tokens == 2048
        assert client.timeout == 45.0


class TestGetDefaultClient:
    """Tests for the get_default_client function."""

    def test_returns_anthropic_when_preferred(self) -> None:
        """Test that Anthropic is returned when preferred and configured."""
        with patch("app.services.llm_client.get_settings") as mock_settings:
            mock_settings.return_value.default_ai_provider = "anthropic"
            mock_settings.return_value.has_anthropic_key = True
            mock_settings.return_value.has_openai_key = True
            mock_settings.return_value.anthropic_api_key = "test-key"
            mock_settings.return_value.anthropic_model = "claude-3-sonnet"
            mock_settings.return_value.anthropic_temperature = 0.7
            mock_settings.return_value.anthropic_max_tokens = 4096

            client = get_default_client()
            assert isinstance(client, AnthropicClient)

    def test_falls_back_to_openai(self) -> None:
        """Test fallback to OpenAI when Anthropic not configured."""
        with patch("app.services.llm_client.get_settings") as mock_settings:
            mock_settings.return_value.default_ai_provider = "anthropic"
            mock_settings.return_value.has_anthropic_key = False
            mock_settings.return_value.has_openai_key = True
            mock_settings.return_value.openai_api_key = "test-key"
            mock_settings.return_value.openai_model = "gpt-4"
            mock_settings.return_value.openai_temperature = 0.7
            mock_settings.return_value.openai_max_tokens = 4096

            client = get_default_client()
            assert isinstance(client, OpenAIClient)

    def test_raises_when_no_keys(self) -> None:
        """Test that error is raised when no keys configured."""
        with patch("app.services.llm_client.get_settings") as mock_settings:
            mock_settings.return_value.default_ai_provider = "openai"
            mock_settings.return_value.has_anthropic_key = False
            mock_settings.return_value.has_openai_key = False

            with pytest.raises(LLMAuthenticationError, match="No LLM API keys"):
                get_default_client()


class TestBaseLLMClient:
    """Tests for BaseLLMClient abstract class."""

    def test_is_abstract(self) -> None:
        """Test that BaseLLMClient cannot be instantiated directly."""
        with pytest.raises(TypeError):
            BaseLLMClient(api_key="test")  # type: ignore

    def test_validate_temperature_inherited(self) -> None:
        """Test that subclasses inherit _validate_temperature."""
        client = OpenAIClient(api_key="test-key")
        assert hasattr(client, "_validate_temperature")
