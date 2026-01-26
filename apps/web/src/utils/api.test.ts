import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  apiFetch,
  apiRequest,
  api,
  ApiRequestError,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isApiError,
  getErrorMessage,
  HttpStatus,
} from './api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Helper to create mock Response
function createMockResponse(
  body: unknown,
  options: { status?: number; headers?: Record<string, string> } = {}
): Response {
  const { status = 200, headers = { 'Content-Type': 'application/json' } } = options;

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response;
}

describe('api utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('token management', () => {
    it('should get access token from localStorage', () => {
      localStorageMock.setItem('accessToken', 'test-token');
      expect(getAccessToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('should set access token in localStorage', () => {
      setAccessToken('new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-token');
    });

    it('should clear access token from localStorage', () => {
      clearAccessToken();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
    });
  });

  describe('apiFetch', () => {
    it('should make a GET request to the correct URL', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await apiFetch('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should include authorization header when token exists', async () => {
      localStorageMock.setItem('accessToken', 'bearer-token');
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await apiFetch('/users');

      const headers = mockFetch.mock.calls[0][1].headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer bearer-token');
    });

    it('should set Content-Type to application/json', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await apiFetch('/users');

      const headers = mockFetch.mock.calls[0][1].headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should add query parameters to URL', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ items: [] }));

      await apiFetch('/users', {
        params: { page: 1, limit: 20, search: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users?page=1&limit=20&search=test',
        expect.any(Object)
      );
    });

    it('should filter out undefined params', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ items: [] }));

      await apiFetch('/users', {
        params: { page: 1, search: undefined },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/users?page=1', expect.any(Object));
    });

    it('should make POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: '1', name: 'John' }));

      await apiFetch('/users', {
        method: 'POST',
        body: { name: 'John', email: 'john@example.com' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
        })
      );
    });

    it('should return parsed JSON response', async () => {
      const responseData = { id: '1', name: 'John' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await apiFetch<{ id: string; name: string }>('/users/1');

      expect(result).toEqual(responseData);
    });

    it('should throw ApiRequestError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ message: 'Not found', error: 'NotFound' }, { status: 404 })
      );

      try {
        await apiFetch('/users/999');
        expect.fail('Expected apiFetch to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiRequestError);
        expect((error as ApiRequestError).statusCode).toBe(404);
        expect((error as ApiRequestError).errorMessage).toBe('Not found');
      }
    });

    it('should add custom headers', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await apiFetch('/users', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      const headers = mockFetch.mock.calls[0][1].headers as Headers;
      expect(headers.get('X-Custom-Header')).toBe('custom-value');
    });

    describe('token refresh on 401', () => {
      it('should attempt token refresh on 401 response', async () => {
        localStorageMock.setItem('accessToken', 'old-token');

        // First call returns 401
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401 })
        );

        // Refresh call succeeds
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ accessToken: 'new-token' }, { status: 200 })
        );

        // Retry with new token succeeds
        mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }, { status: 200 }));

        const result = await apiFetch('/protected');

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-token');
        expect(result).toEqual({ data: 'success' });
      });

      it('should throw when refresh fails', async () => {
        localStorageMock.setItem('accessToken', 'old-token');

        // First call returns 401
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401 })
        );

        // Refresh call fails
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ message: 'Invalid refresh token' }, { status: 401 })
        );

        await expect(apiFetch('/protected')).rejects.toThrow(ApiRequestError);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      });
    });

    describe('timeout handling', () => {
      it('should throw timeout error when request exceeds timeout', async () => {
        // Use real timers for this test since we're testing actual abort behavior
        vi.useRealTimers();

        // Create a promise that will never resolve naturally, only through abort
        mockFetch.mockImplementation(
          (_url: string, options: RequestInit) =>
            new Promise((resolve, reject) => {
              const timer = setTimeout(
                () => resolve(createMockResponse({ data: 'test' })),
                10000 // Very long timeout to ensure abort happens first
              );
              // Listen for abort signal
              options.signal?.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('The operation was aborted', 'AbortError'));
              });
            })
        );

        try {
          await apiFetch('/slow-endpoint', { timeout: 50 });
          expect.fail('Expected apiFetch to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiRequestError);
          expect((error as ApiRequestError).statusCode).toBe(408);
          expect((error as ApiRequestError).errorMessage).toBe('Request timed out');
        }

        // Restore fake timers for other tests
        vi.useFakeTimers();
      });
    });

    describe('error handling', () => {
      it('should handle network errors', async () => {
        mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        try {
          await apiFetch('/users');
          expect.fail('Expected apiFetch to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiRequestError);
          expect((error as ApiRequestError).statusCode).toBe(0);
          expect((error as ApiRequestError).errorType).toBe('NetworkError');
        }
      });

      it('should handle non-JSON error responses', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
          json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
          text: vi.fn().mockResolvedValue('Internal Server Error'),
        } as unknown as Response);

        await expect(apiFetch('/users')).rejects.toThrow(ApiRequestError);
      });
    });
  });

  describe('apiRequest', () => {
    it('should return success result on successful request', async () => {
      const responseData = { id: '1', name: 'John' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await apiRequest<{ id: string; name: string }>('/users/1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(responseData);
      }
    });

    it('should return error result on failed request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ message: 'Not found' }, { status: 404 })
      );

      const result = await apiRequest('/users/999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(404);
        expect(result.error.message).toBe('Not found');
      }
    });
  });

  describe('api convenience methods', () => {
    it('api.get should make GET request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await api.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('api.post should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: '1' }));

      await api.post('/users', { name: 'John' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John' }),
        })
      );
    });

    it('api.put should make PUT request with body', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: '1' }));

      await api.put('/users/1', { name: 'Jane' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Jane' }),
        })
      );
    });

    it('api.patch should make PATCH request with body', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: '1' }));

      await api.patch('/users/1', { name: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        })
      );
    });

    it('api.delete should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null, { status: 204 }));

      await api.delete('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('ApiRequestError', () => {
    it('should create error with correct properties', () => {
      const error = new ApiRequestError(404, 'Not found', 'NotFoundError');

      expect(error.statusCode).toBe(404);
      expect(error.errorMessage).toBe('Not found');
      expect(error.errorType).toBe('NotFoundError');
      expect(error.name).toBe('ApiRequestError');
    });

    it('toApiError should return ApiError object', () => {
      const error = new ApiRequestError(400, 'Bad request', 'ValidationError');
      const apiError = error.toApiError();

      expect(apiError).toEqual({
        message: 'Bad request',
        statusCode: 400,
        error: 'ValidationError',
      });
    });
  });

  describe('isApiError', () => {
    it('should return true for ApiRequestError', () => {
      const error = new ApiRequestError(404, 'Not found');
      expect(isApiError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isApiError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isApiError('string')).toBe(false);
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from ApiRequestError', () => {
      const error = new ApiRequestError(404, 'User not found');
      expect(getErrorMessage(error)).toBe('User not found');
    });

    it('should extract message from regular Error', () => {
      const error = new Error('Something went wrong');
      expect(getErrorMessage(error)).toBe('Something went wrong');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    });
  });

  describe('HttpStatus helpers', () => {
    it('isSuccess should return true for 2xx status codes', () => {
      expect(HttpStatus.isSuccess(200)).toBe(true);
      expect(HttpStatus.isSuccess(201)).toBe(true);
      expect(HttpStatus.isSuccess(204)).toBe(true);
      expect(HttpStatus.isSuccess(199)).toBe(false);
      expect(HttpStatus.isSuccess(300)).toBe(false);
    });

    it('isClientError should return true for 4xx status codes', () => {
      expect(HttpStatus.isClientError(400)).toBe(true);
      expect(HttpStatus.isClientError(404)).toBe(true);
      expect(HttpStatus.isClientError(499)).toBe(true);
      expect(HttpStatus.isClientError(399)).toBe(false);
      expect(HttpStatus.isClientError(500)).toBe(false);
    });

    it('isServerError should return true for 5xx status codes', () => {
      expect(HttpStatus.isServerError(500)).toBe(true);
      expect(HttpStatus.isServerError(503)).toBe(true);
      expect(HttpStatus.isServerError(499)).toBe(false);
    });

    it('isUnauthorized should return true only for 401', () => {
      expect(HttpStatus.isUnauthorized(401)).toBe(true);
      expect(HttpStatus.isUnauthorized(403)).toBe(false);
    });

    it('isForbidden should return true only for 403', () => {
      expect(HttpStatus.isForbidden(403)).toBe(true);
      expect(HttpStatus.isForbidden(401)).toBe(false);
    });

    it('isNotFound should return true only for 404', () => {
      expect(HttpStatus.isNotFound(404)).toBe(true);
      expect(HttpStatus.isNotFound(400)).toBe(false);
    });
  });
});
