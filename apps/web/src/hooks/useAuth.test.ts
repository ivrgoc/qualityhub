import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { createElement, type ReactNode } from 'react';
import { useAuth } from './useAuth';
import authReducer from '@/store/slices/authSlice';
import { authApi } from '@/store/api/authApi';
import { baseApi } from '@/store/api/baseApi';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/login',
      state: null,
      search: '',
      hash: '',
      key: 'default',
    }),
  };
});

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  });
};

// Wrapper component for testing hooks
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      Provider,
      { store },
      createElement(MemoryRouter, null, children)
    );
  };
};

describe('useAuth', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('Initial State', () => {
    it('should return initial unauthenticated state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return authenticated state when user exists in store', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'tester' as const,
        orgId: 'org-456',
      };

      store = createTestStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
          accessToken: 'token-123',
          isLoading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should call login mutation with credentials', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'Password123!',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isLoggingIn).toBe(false);

      // Start login but don't await
      const loginPromise = act(async () => {
        result.current.login({
          email: 'test@example.com',
          password: 'Password123!',
        });
      });

      // Loading state should be true during the request
      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(true);
      });

      await loginPromise;
    });

    it('should return error on invalid credentials', async () => {
      // Override handler for this test
      server.use(
        http.post('/api/v1/auth/login', () => {
          return HttpResponse.json(
            { message: 'Invalid credentials', statusCode: 401 },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'wrong@example.com',
            password: 'WrongPassword!',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.loginError).toBeDefined();
      });
    });
  });

  describe('register', () => {
    it('should call register mutation with data', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'Password123!',
          name: 'New User',
          organizationName: 'New Org',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should return error when email already exists', async () => {
      // Override handler for this test
      server.use(
        http.post('/api/v1/auth/register', () => {
          return HttpResponse.json(
            { message: 'Email already registered', statusCode: 409 },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'Password123!',
            name: 'Test User',
            organizationName: 'Test Org',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.registerError).toBeDefined();
      });
    });
  });

  describe('logout', () => {
    it('should call logout mutation and redirect to login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'tester' as const,
        orgId: 'org-456',
      };

      store = createTestStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
          accessToken: 'token-123',
          isLoading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call forgot password mutation', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.forgotPassword({
          email: 'test@example.com',
        });
      });

      // Should not navigate on forgot password
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should call reset password mutation and redirect to login', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.resetPassword({
          token: 'reset-token-123',
          password: 'NewPassword123!',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });
  });

  describe('Error Message Extraction', () => {
    it('should extract message from API error response', async () => {
      server.use(
        http.post('/api/v1/auth/login', () => {
          return HttpResponse.json(
            { message: 'Custom error message', statusCode: 400 },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'password',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.loginError).toBe('Custom error message');
      });
    });

    it('should handle network error', async () => {
      server.use(
        http.post('/api/v1/auth/login', () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'password',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.loginError).toBeDefined();
      });
    });
  });

  describe('Loading States', () => {
    it('should track isLoggingIn state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isLoggingIn).toBe(false);
    });

    it('should track isRegistering state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isRegistering).toBe(false);
    });

    it('should track isLoggingOut state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isLoggingOut).toBe(false);
    });

    it('should track isForgotPasswordLoading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isForgotPasswordLoading).toBe(false);
    });

    it('should track isResetPasswordLoading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isResetPasswordLoading).toBe(false);
    });
  });
});
