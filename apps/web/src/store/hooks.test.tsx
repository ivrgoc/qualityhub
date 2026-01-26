import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './hooks';
import { authReducer, uiReducer, setUser, clearUser } from './slices';
import { baseApi } from './api/baseApi';
import { UserRole } from '@/types';

// Create a test store for hook testing
function createTestStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(baseApi.middleware),
  });
}

// Wrapper component for testing hooks with Redux Provider
function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('hooks', () => {
  describe('useAppDispatch', () => {
    it('should return a dispatch function', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAppDispatch(), {
        wrapper: createWrapper(store),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('function');
    });

    it('should dispatch actions correctly', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const { result } = renderHook(() => useAppDispatch(), {
        wrapper: createWrapper(store),
      });

      // Dispatch action
      result.current(setUser(mockUser));

      // Verify state was updated
      const state = store.getState();
      expect(state.auth.user).toEqual(mockUser);
      expect(state.auth.isAuthenticated).toBe(true);
    });

    it('should handle multiple dispatches', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const { result } = renderHook(() => useAppDispatch(), {
        wrapper: createWrapper(store),
      });

      // Set user
      result.current(setUser(mockUser));
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Clear user
      result.current(clearUser());
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe('useAppSelector', () => {
    it('should select state from the store', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAppSelector((state) => state.auth), {
        wrapper: createWrapper(store),
      });

      expect(result.current).toEqual({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        isLoading: false,
        error: null,
      });
    });

    it('should return updated state after dispatch', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const { result } = renderHook(
        () => useAppSelector((state) => state.auth.user),
        {
          wrapper: createWrapper(store),
        }
      );

      // Initial state
      expect(result.current).toBeNull();

      // Dispatch action wrapped in act
      act(() => {
        store.dispatch(setUser(mockUser));
      });

      // Updated state
      expect(result.current).toEqual(mockUser);
    });

    it('should select nested state properties', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      };

      store.dispatch(setUser(mockUser));

      const { result } = renderHook(
        () => useAppSelector((state) => state.auth.user?.email),
        {
          wrapper: createWrapper(store),
        }
      );

      expect(result.current).toBe('test@example.com');
    });

    it('should select isAuthenticated boolean', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () => useAppSelector((state) => state.auth.isAuthenticated),
        {
          wrapper: createWrapper(store),
        }
      );

      expect(result.current).toBe(false);

      act(() => {
        store.dispatch(
          setUser({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.TESTER,
            orgId: 'org-1',
            createdAt: '2024-01-01T00:00:00Z',
          })
        );
      });

      expect(result.current).toBe(true);
    });
  });

  describe('hooks integration', () => {
    it('should work together in the same component', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Simulate a component that uses both hooks
      const { result } = renderHook(
        () => {
          const dispatch = useAppDispatch();
          const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
          return { dispatch, isAuthenticated };
        },
        {
          wrapper: createWrapper(store),
        }
      );

      // Initial state
      expect(result.current.isAuthenticated).toBe(false);

      // Dispatch using the hook's dispatch wrapped in act
      act(() => {
        result.current.dispatch(setUser(mockUser));
      });

      // State should be updated
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should export RootState type', () => {
      // This is a compile-time check - if types are wrong, TypeScript will fail
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useAppSelector((state) => {
            // Access auth state - this should be typed
            const auth = state.auth;
            // Access api state - this should be typed
            const api = state[baseApi.reducerPath];
            return { auth, api };
          }),
        {
          wrapper: createWrapper(store),
        }
      );

      expect(result.current.auth).toBeDefined();
      expect(result.current.api).toBeDefined();
    });

    it('should export AppDispatch type that handles thunks', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAppDispatch(), {
        wrapper: createWrapper(store),
      });

      // AppDispatch should accept regular actions
      const action = result.current(setUser({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      }));

      // Regular actions return the action object
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('payload');
    });
  });
});
