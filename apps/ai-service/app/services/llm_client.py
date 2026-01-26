"""LLM client abstraction for OpenAI and Anthropic APIs.

This module provides a unified interface for interacting with different
LLM providers (OpenAI, Anthropic), abstracting away provider-specific
implementation details while maintaining consistent behavior.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional, Type, TypeVar

from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from app.core.config import get_settings
from app.schemas.generation import LLMMessage, LLMPrompt


@dataclass
class LLMResponse:
    """Response from an LLM API call.

    Attributes:
        content: The generated text content
        model: The model that was used
        prompt_tokens: Number of tokens in the prompt
        completion_tokens: Number of tokens in the completion
        total_tokens: Total tokens used
        finish_reason: Why the model stopped generating
        raw_response: The raw response from the provider (for debugging)
    """

    content: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    finish_reason: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None


class LLMClientError(Exception):
    """Base exception for LLM client errors."""

    pass


class LLMAuthenticationError(LLMClientError):
    """Raised when authentication with the LLM provider fails."""

    pass


class LLMRateLimitError(LLMClientError):
    """Raised when rate limits are exceeded."""

    pass


class LLMInvalidRequestError(LLMClientError):
    """Raised when the request is invalid."""

    pass


class LLMProviderError(LLMClientError):
    """Raised when the LLM provider returns an error."""

    pass


T = TypeVar("T", bound="BaseLLMClient")


class BaseLLMClient(ABC):
    """Abstract base class for LLM clients.

    This class defines the interface that all LLM clients must implement,
    ensuring consistent behavior across different providers.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> None:
        """Initialize the LLM client.

        Args:
            api_key: API key for the provider. If not provided, will attempt
                     to load from environment/settings.
            model: The model to use. If not provided, uses provider default.
            temperature: Sampling temperature (0.0 to 2.0).
            max_tokens: Maximum tokens in the response.
            timeout: Request timeout in seconds.
        """
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout

    @abstractmethod
    async def complete(
        self,
        prompt: LLMPrompt,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate a completion from the LLM.

        Args:
            prompt: The prompt containing messages and configuration.
            json_mode: Whether to request JSON output format.

        Returns:
            LLMResponse with the generated content and metadata.

        Raises:
            LLMAuthenticationError: If authentication fails.
            LLMRateLimitError: If rate limits are exceeded.
            LLMInvalidRequestError: If the request is invalid.
            LLMProviderError: If the provider returns an error.
        """
        pass

    @abstractmethod
    async def complete_simple(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate a completion with simple string prompts.

        Convenience method for common use cases where you just have
        a system prompt and user prompt.

        Args:
            system_prompt: The system prompt defining AI behavior.
            user_prompt: The user's message/request.
            json_mode: Whether to request JSON output format.

        Returns:
            LLMResponse with the generated content and metadata.
        """
        pass

    @classmethod
    @abstractmethod
    def provider_name(cls) -> str:
        """Return the name of this provider.

        Returns:
            Provider name (e.g., 'openai', 'anthropic').
        """
        pass

    def _validate_temperature(self, temperature: float) -> float:
        """Validate and clamp temperature to valid range.

        Args:
            temperature: The temperature value to validate.

        Returns:
            Validated temperature value clamped to valid range.
        """
        return max(0.0, min(2.0, temperature))


class OpenAIClient(BaseLLMClient):
    """OpenAI API client implementation."""

    DEFAULT_MODEL = "gpt-4-turbo-preview"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> None:
        """Initialize the OpenAI client.

        Args:
            api_key: OpenAI API key. If not provided, loads from settings.
            model: Model to use (default: gpt-4-turbo-preview).
            temperature: Sampling temperature (0.0 to 2.0).
            max_tokens: Maximum tokens in the response.
            timeout: Request timeout in seconds.
        """
        settings = get_settings()
        resolved_key = api_key or settings.openai_api_key

        super().__init__(
            api_key=resolved_key,
            model=model or settings.openai_model or self.DEFAULT_MODEL,
            temperature=temperature or settings.openai_temperature,
            max_tokens=max_tokens or settings.openai_max_tokens,
            timeout=timeout,
        )

        self._client: Optional[AsyncOpenAI] = None

    def _get_client(self) -> AsyncOpenAI:
        """Get or create the AsyncOpenAI client.

        Returns:
            Configured AsyncOpenAI client.

        Raises:
            LLMAuthenticationError: If no API key is configured.
        """
        if self._client is None:
            if not self.api_key:
                raise LLMAuthenticationError(
                    "OpenAI API key not configured. Set OPENAI_API_KEY environment variable "
                    "or pass api_key to the client."
                )
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                timeout=self.timeout,
            )
        return self._client

    @classmethod
    def provider_name(cls) -> str:
        """Return the provider name.

        Returns:
            'openai'
        """
        return "openai"

    def _convert_messages(
        self, messages: List[LLMMessage]
    ) -> List[Dict[str, str]]:
        """Convert LLMMessage objects to OpenAI format.

        Args:
            messages: List of LLMMessage objects.

        Returns:
            List of message dicts in OpenAI format.
        """
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    async def complete(
        self,
        prompt: LLMPrompt,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate a completion using OpenAI API.

        Args:
            prompt: The prompt containing messages and configuration.
            json_mode: Whether to request JSON output format.

        Returns:
            LLMResponse with the generated content and metadata.

        Raises:
            LLMAuthenticationError: If authentication fails.
            LLMRateLimitError: If rate limits are exceeded.
            LLMInvalidRequestError: If the request is invalid.
            LLMProviderError: If the provider returns an error.
        """
        from openai import (
            APIConnectionError,
            AuthenticationError,
            BadRequestError,
            RateLimitError,
        )

        client = self._get_client()

        model = prompt.model or self.model or self.DEFAULT_MODEL
        temperature = self._validate_temperature(prompt.temperature or self.temperature)
        max_tokens = prompt.max_tokens or self.max_tokens

        messages = self._convert_messages(prompt.messages)

        try:
            kwargs: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = await client.chat.completions.create(**kwargs)

            choice = response.choices[0]
            usage = response.usage

            return LLMResponse(
                content=choice.message.content or "",
                model=response.model,
                prompt_tokens=usage.prompt_tokens if usage else 0,
                completion_tokens=usage.completion_tokens if usage else 0,
                total_tokens=usage.total_tokens if usage else 0,
                finish_reason=choice.finish_reason,
                raw_response=response.model_dump() if response else None,
            )

        except AuthenticationError as e:
            raise LLMAuthenticationError(f"OpenAI authentication failed: {e}") from e
        except RateLimitError as e:
            raise LLMRateLimitError(f"OpenAI rate limit exceeded: {e}") from e
        except BadRequestError as e:
            raise LLMInvalidRequestError(f"Invalid request to OpenAI: {e}") from e
        except APIConnectionError as e:
            raise LLMProviderError(f"Failed to connect to OpenAI: {e}") from e
        except Exception as e:
            raise LLMProviderError(f"OpenAI API error: {e}") from e

    async def complete_simple(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate a completion with simple string prompts.

        Args:
            system_prompt: The system prompt defining AI behavior.
            user_prompt: The user's message/request.
            json_mode: Whether to request JSON output format.

        Returns:
            LLMResponse with the generated content and metadata.
        """
        prompt = LLMPrompt(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_prompt),
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return await self.complete(prompt, json_mode=json_mode)


class AnthropicClient(BaseLLMClient):
    """Anthropic API client implementation."""

    DEFAULT_MODEL = "claude-3-sonnet-20240229"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> None:
        """Initialize the Anthropic client.

        Args:
            api_key: Anthropic API key. If not provided, loads from settings.
            model: Model to use (default: claude-3-sonnet-20240229).
            temperature: Sampling temperature (0.0 to 1.0 for Anthropic).
            max_tokens: Maximum tokens in the response.
            timeout: Request timeout in seconds.
        """
        settings = get_settings()
        resolved_key = api_key or settings.anthropic_api_key

        super().__init__(
            api_key=resolved_key,
            model=model or settings.anthropic_model or self.DEFAULT_MODEL,
            temperature=temperature or settings.anthropic_temperature,
            max_tokens=max_tokens or settings.anthropic_max_tokens,
            timeout=timeout,
        )

        self._client: Optional[AsyncAnthropic] = None

    def _get_client(self) -> AsyncAnthropic:
        """Get or create the AsyncAnthropic client.

        Returns:
            Configured AsyncAnthropic client.

        Raises:
            LLMAuthenticationError: If no API key is configured.
        """
        if self._client is None:
            if not self.api_key:
                raise LLMAuthenticationError(
                    "Anthropic API key not configured. Set ANTHROPIC_API_KEY environment "
                    "variable or pass api_key to the client."
                )
            self._client = AsyncAnthropic(
                api_key=self.api_key,
                timeout=self.timeout,
            )
        return self._client

    @classmethod
    def provider_name(cls) -> str:
        """Return the provider name.

        Returns:
            'anthropic'
        """
        return "anthropic"

    def _validate_temperature(self, temperature: float) -> float:
        """Validate and clamp temperature to Anthropic's valid range.

        Anthropic accepts temperature from 0.0 to 1.0.

        Args:
            temperature: The temperature value to validate.

        Returns:
            Validated temperature value clamped to valid range.
        """
        return max(0.0, min(1.0, temperature))

    def _extract_system_message(
        self, messages: List[LLMMessage]
    ) -> tuple[Optional[str], List[LLMMessage]]:
        """Extract system message from message list.

        Anthropic requires system prompt to be passed separately.

        Args:
            messages: List of LLMMessage objects.

        Returns:
            Tuple of (system_content, remaining_messages).
        """
        system_content: Optional[str] = None
        remaining: List[LLMMessage] = []

        for msg in messages:
            if msg.role == "system":
                system_content = msg.content
            else:
                remaining.append(msg)

        return system_content, remaining

    def _convert_messages(
        self, messages: List[LLMMessage]
    ) -> List[Dict[str, str]]:
        """Convert LLMMessage objects to Anthropic format.

        Args:
            messages: List of LLMMessage objects (excluding system).

        Returns:
            List of message dicts in Anthropic format.
        """
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    async def complete(
        self,
        prompt: LLMPrompt,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate a completion using Anthropic API.

        Args:
            prompt: The prompt containing messages and configuration.
            json_mode: Whether to request JSON output format.
                      Note: Anthropic doesn't have native JSON mode, so this
                      appends instructions to the system prompt.

        Returns:
            LLMResponse with the generated content and metadata.

        Raises:
            LLMAuthenticationError: If authentication fails.
            LLMRateLimitError: If rate limits are exceeded.
            LLMInvalidRequestError: If the request is invalid.
            LLMProviderError: If the provider returns an error.
        """
        from anthropic import (
            APIConnectionError,
            AuthenticationError,
            BadRequestError,
            RateLimitError,
        )

        client = self._get_client()

        model = prompt.model or self.model or self.DEFAULT_MODEL
        temperature = self._validate_temperature(prompt.temperature or self.temperature)
        max_tokens = prompt.max_tokens or self.max_tokens

        system_content, remaining_messages = self._extract_system_message(prompt.messages)
        messages = self._convert_messages(remaining_messages)

        # Add JSON instruction if json_mode is requested
        if json_mode and system_content:
            system_content += (
                "\n\nIMPORTANT: You must respond with valid JSON only. "
                "Do not include any text before or after the JSON object."
            )
        elif json_mode:
            system_content = (
                "You must respond with valid JSON only. "
                "Do not include any text before or after the JSON object."
            )

        try:
            kwargs: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            if system_content:
                kwargs["system"] = system_content

            response = await client.messages.create(**kwargs)

            content = ""
            if response.content:
                content = response.content[0].text

            return LLMResponse(
                content=content,
                model=response.model,
                prompt_tokens=response.usage.input_tokens,
                completion_tokens=response.usage.output_tokens,
                total_tokens=response.usage.input_tokens + response.usage.output_tokens,
                finish_reason=response.stop_reason,
                raw_response=response.model_dump() if response else None,
            )

        except AuthenticationError as e:
            raise LLMAuthenticationError(f"Anthropic authentication failed: {e}") from e
        except RateLimitError as e:
            raise LLMRateLimitError(f"Anthropic rate limit exceeded: {e}") from e
        except BadRequestError as e:
            raise LLMInvalidRequestError(f"Invalid request to Anthropic: {e}") from e
        except APIConnectionError as e:
            raise LLMProviderError(f"Failed to connect to Anthropic: {e}") from e
        except Exception as e:
            raise LLMProviderError(f"Anthropic API error: {e}") from e

    async def complete_simple(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate a completion with simple string prompts.

        Args:
            system_prompt: The system prompt defining AI behavior.
            user_prompt: The user's message/request.
            json_mode: Whether to request JSON output format.

        Returns:
            LLMResponse with the generated content and metadata.
        """
        prompt = LLMPrompt(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_prompt),
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return await self.complete(prompt, json_mode=json_mode)


# Provider registry for factory function
_PROVIDERS: Dict[str, Type[BaseLLMClient]] = {
    "openai": OpenAIClient,
    "anthropic": AnthropicClient,
}


def get_llm_client(
    provider: Literal["openai", "anthropic"] = "openai",
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
    timeout: float = 60.0,
) -> BaseLLMClient:
    """Factory function to create an LLM client for the specified provider.

    This is the recommended way to create LLM clients, as it handles
    provider selection and provides a consistent interface.

    Args:
        provider: The LLM provider to use ('openai' or 'anthropic').
        api_key: API key for the provider. If not provided, loads from settings.
        model: Model to use. If not provided, uses provider default.
        temperature: Sampling temperature.
        max_tokens: Maximum tokens in the response.
        timeout: Request timeout in seconds.

    Returns:
        Configured LLM client for the specified provider.

    Raises:
        ValueError: If an unknown provider is specified.

    Example:
        >>> client = get_llm_client(provider="openai")
        >>> response = await client.complete_simple(
        ...     system_prompt="You are a helpful assistant.",
        ...     user_prompt="Hello!"
        ... )
        >>> print(response.content)
    """
    if provider not in _PROVIDERS:
        raise ValueError(
            f"Unknown provider: {provider}. Available providers: {list(_PROVIDERS.keys())}"
        )

    client_class = _PROVIDERS[provider]
    return client_class(
        api_key=api_key,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=timeout,
    )


def get_default_client() -> BaseLLMClient:
    """Get the default LLM client based on application settings.

    Uses the default_ai_provider setting to determine which client to use,
    falling back to OpenAI if the preferred provider's API key is not configured.

    Returns:
        Configured LLM client.

    Raises:
        LLMAuthenticationError: If no API keys are configured.
    """
    settings = get_settings()

    # Try the default provider first
    if settings.default_ai_provider == "anthropic" and settings.has_anthropic_key:
        return get_llm_client(provider="anthropic")
    elif settings.has_openai_key:
        return get_llm_client(provider="openai")
    elif settings.has_anthropic_key:
        return get_llm_client(provider="anthropic")
    else:
        raise LLMAuthenticationError(
            "No LLM API keys configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY "
            "environment variable."
        )
