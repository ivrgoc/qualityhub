import type { ApiError } from '../types';

/**
 * Base URL for API requests.
 * This should match the RTK Query baseUrl in baseApi.ts.
 */
const API_BASE_URL = '/api/v1';

/**
 * Storage key for the access token.
 */
const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * HTTP methods supported by the fetch wrapper.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Options for API requests.
 */
interface RequestOptions<TBody = unknown> {
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Request body (will be JSON stringified) */
  body?: TBody;
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Query parameters to append to the URL */
  params?: Record<string, string | number | boolean | undefined>;
  /** Whether to include credentials (cookies). Defaults to true. */
  credentials?: RequestCredentials;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Whether to skip automatic JSON parsing of response. Defaults to false. */
  rawResponse?: boolean;
  /** Custom timeout in milliseconds. Defaults to 30000 (30s). */
  timeout?: number;
}

/**
 * Result type for API requests.
 */
type ApiResult<T> =
  | { success: true; data: T; status: number }
  | { success: false; error: ApiError; status: number };

/**
 * Custom error class for API errors.
 * Provides structured access to error details.
 */
export class ApiRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorMessage: string,
    public readonly errorType?: string
  ) {
    super(errorMessage);
    this.name = 'ApiRequestError';
  }

  toApiError(): ApiError {
    return {
      message: this.errorMessage,
      statusCode: this.statusCode,
      error: this.errorType,
    };
  }
}

/**
 * Retrieves the current access token from localStorage.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Stores the access token in localStorage.
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Removes the access token from localStorage.
 */
export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Builds the full URL with query parameters.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Builds request headers with authentication.
 */
function buildHeaders(customHeaders?: Record<string, string>): Headers {
  const headers = new Headers();

  // Set default content type
  headers.set('Content-Type', 'application/json');

  // Add auth token if available
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Add custom headers
  if (customHeaders) {
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  return headers;
}

/**
 * Parses the response body based on content type.
 */
async function parseResponseBody<T>(response: Response, rawResponse?: boolean): Promise<T> {
  if (rawResponse) {
    return response as unknown as T;
  }

  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  // Return text for non-JSON responses
  return (await response.text()) as unknown as T;
}

/**
 * Extracts error details from a failed response.
 */
async function extractError(response: Response): Promise<ApiError> {
  try {
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      const body = await response.json();
      return {
        message: body.message || body.error || 'An error occurred',
        statusCode: response.status,
        error: body.error,
      };
    }

    const text = await response.text();
    return {
      message: text || response.statusText || 'An error occurred',
      statusCode: response.status,
    };
  } catch {
    return {
      message: response.statusText || 'An error occurred',
      statusCode: response.status,
    };
  }
}

/**
 * Attempts to refresh the access token.
 * Returns true if refresh was successful, false otherwise.
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      clearAccessToken();
      return false;
    }

    const data = (await response.json()) as { accessToken: string };

    if (data.accessToken) {
      setAccessToken(data.accessToken);
      return true;
    }

    return false;
  } catch {
    clearAccessToken();
    return false;
  }
}

/**
 * Creates an AbortController with timeout.
 */
function createTimeoutController(
  timeout: number,
  existingSignal?: AbortSignal
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('Request timeout', 'TimeoutError'));
  }, timeout);

  // If an existing signal is provided, abort when it aborts
  if (existingSignal) {
    existingSignal.addEventListener('abort', () => {
      controller.abort(existingSignal.reason);
    });
  }

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
}

/**
 * Core fetch wrapper with authentication and automatic token refresh.
 *
 * @param endpoint - API endpoint (relative to base URL or absolute URL)
 * @param options - Request options
 * @returns Promise resolving to the response data
 * @throws ApiRequestError on failure
 *
 * @example
 * ```typescript
 * // GET request
 * const users = await apiFetch<User[]>('/users');
 *
 * // POST request with body
 * const newUser = await apiFetch<User>('/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' },
 * });
 *
 * // GET with query params
 * const results = await apiFetch<PaginatedResponse<TestCase>>('/projects/1/cases', {
 *   params: { page: 1, pageSize: 20, search: 'login' },
 * });
 * ```
 */
export async function apiFetch<T, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers: customHeaders,
    params,
    credentials = 'include',
    signal,
    rawResponse,
    timeout = 30000,
  } = options;

  const url = buildUrl(endpoint, params);
  const headers = buildHeaders(customHeaders);

  const { controller, cleanup } = createTimeoutController(timeout, signal);

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials,
    signal: controller.signal,
  };

  if (body !== undefined && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    let response = await fetch(url, fetchOptions);

    // Handle 401 - attempt token refresh
    if (response.status === 401) {
      const refreshed = await refreshToken();

      if (refreshed) {
        // Update headers with new token and retry
        const newHeaders = buildHeaders(customHeaders);
        fetchOptions.headers = newHeaders;
        response = await fetch(url, fetchOptions);
      } else {
        // Refresh failed - throw auth error
        throw new ApiRequestError(401, 'Session expired. Please log in again.', 'Unauthorized');
      }
    }

    if (!response.ok) {
      const error = await extractError(response);
      throw new ApiRequestError(error.statusCode, error.message, error.error);
    }

    return await parseResponseBody<T>(response, rawResponse);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Check if the abort was caused by timeout
    const isTimeout =
      controller.signal.aborted &&
      controller.signal.reason instanceof DOMException &&
      controller.signal.reason.name === 'TimeoutError';

    if (isTimeout) {
      throw new ApiRequestError(408, 'Request timed out', 'TimeoutError');
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError(0, 'Request was cancelled', 'AbortError');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiRequestError(0, 'Network error. Please check your connection.', 'NetworkError');
    }

    throw new ApiRequestError(
      0,
      error instanceof Error ? error.message : 'An unexpected error occurred',
      'UnknownError'
    );
  } finally {
    cleanup();
  }
}

/**
 * Safe fetch that returns a result object instead of throwing.
 * Useful when you want to handle errors inline without try/catch.
 *
 * @example
 * ```typescript
 * const result = await apiRequest<User>('/users/me');
 *
 * if (result.success) {
 *   console.log('User:', result.data);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export async function apiRequest<T, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<ApiResult<T>> {
  try {
    const data = await apiFetch<T, TBody>(endpoint, options);
    return { success: true, data, status: 200 };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return {
        success: false,
        error: error.toApiError(),
        status: error.statusCode,
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        statusCode: 0,
      },
      status: 0,
    };
  }
}

/**
 * Convenience methods for common HTTP verbs.
 */
export const api = {
  /**
   * Performs a GET request.
   */
  get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return apiFetch<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Performs a POST request.
   */
  post<T, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return apiFetch<T, TBody>(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * Performs a PUT request.
   */
  put<T, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return apiFetch<T, TBody>(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * Performs a PATCH request.
   */
  patch<T, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return apiFetch<T, TBody>(endpoint, { ...options, method: 'PATCH', body });
  },

  /**
   * Performs a DELETE request.
   */
  delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<T> {
    return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

/**
 * Type guard to check if an error is an ApiRequestError.
 */
export function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

/**
 * Extracts a user-friendly error message from any error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.errorMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * HTTP status code helpers.
 */
export const HttpStatus = {
  isSuccess: (status: number): boolean => status >= 200 && status < 300,
  isClientError: (status: number): boolean => status >= 400 && status < 500,
  isServerError: (status: number): boolean => status >= 500,
  isUnauthorized: (status: number): boolean => status === 401,
  isForbidden: (status: number): boolean => status === 403,
  isNotFound: (status: number): boolean => status === 404,
} as const;
