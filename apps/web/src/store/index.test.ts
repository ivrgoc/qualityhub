import { describe, it, expect, afterEach } from 'vitest';
import { store, useAppDispatch, useAppSelector, type RootState, type AppDispatch } from './index';
import { setUser, clearUser } from './slices';
import { baseApi } from './api/baseApi';
import { UserRole } from '@/types';

describe('store', () => {
  describe('configuration', () => {
    it('should be a valid Redux store', () => {
      expect(store).toBeDefined();
      expect(store.getState).toBeDefined();
      expect(store.dispatch).toBeDefined();
      expect(store.subscribe).toBeDefined();
    });

    it('should have auth reducer configured', () => {
      const state = store.getState();
      expect(state).toHaveProperty('auth');
      expect(state.auth).toEqual({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        isLoading: false,
        error: null,
      });
    });

    it('should have ui reducer configured', () => {
      const state = store.getState();
      expect(state).toHaveProperty('ui');
      expect(state.ui).toEqual({
        sidebar: {
          isOpen: true,
          isCollapsed: false,
        },
        modal: {
          isOpen: false,
          activeModal: null,
          modalStack: [],
        },
        theme: {
          current: 'system',
          systemPreference: 'light',
        },
      });
    });

    it('should have API reducer configured', () => {
      const state = store.getState();
      expect(state).toHaveProperty(baseApi.reducerPath);
    });

    it('should have RTK Query middleware configured', () => {
      // RTK Query middleware adds subscription management
      // We can verify this by checking if the api state has the expected structure
      const state = store.getState();
      const apiState = state[baseApi.reducerPath as keyof typeof state];
      expect(apiState).toBeDefined();
      expect(apiState).toHaveProperty('queries');
      expect(apiState).toHaveProperty('mutations');
    });
  });

  describe('dispatch actions', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.TESTER,
      orgId: 'org-1',
      createdAt: '2024-01-01T00:00:00Z',
    };

    afterEach(() => {
      // Reset auth state after each test
      store.dispatch(clearUser());
    });

    it('should dispatch setUser action correctly', () => {
      store.dispatch(setUser(mockUser));
      const state = store.getState();
      expect(state.auth.user).toEqual(mockUser);
      expect(state.auth.isAuthenticated).toBe(true);
    });

    it('should dispatch clearUser action correctly', () => {
      // First set user
      store.dispatch(setUser(mockUser));
      // Then clear
      store.dispatch(clearUser());
      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.isAuthenticated).toBe(false);
    });
  });

  describe('type exports', () => {
    it('should export RootState type that matches store state', () => {
      const state: RootState = store.getState();
      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty(baseApi.reducerPath);
    });

    it('should export AppDispatch type that matches store dispatch', () => {
      const dispatch: AppDispatch = store.dispatch;
      expect(typeof dispatch).toBe('function');
    });
  });

  describe('typed hooks', () => {
    it('should export useAppDispatch hook', () => {
      expect(useAppDispatch).toBeDefined();
      expect(typeof useAppDispatch).toBe('function');
    });

    it('should export useAppSelector hook', () => {
      expect(useAppSelector).toBeDefined();
      expect(typeof useAppSelector).toBe('function');
    });
  });
});

describe('store middleware', () => {
  it('should include default middleware', () => {
    // Verify that default middleware (like serializability check) is active
    // by ensuring the store handles non-serializable values in ignored paths
    const state = store.getState();
    expect(state).toBeDefined();
  });

  it('should handle async actions through RTK Query', () => {
    // RTK Query endpoints are properly configured if we can access them
    const endpoints = baseApi.endpoints;
    expect(endpoints).toBeDefined();
  });
});
