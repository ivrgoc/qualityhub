import { describe, it, expect } from 'vitest';
import authReducer, {
  setUser,
  clearUser,
  setCredentials,
  clearCredentials,
  setAccessToken,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  selectUser,
  selectIsAuthenticated,
  selectAccessToken,
  selectAuthLoading,
  selectAuthError,
  type AuthState,
} from './authSlice';
import { UserRole } from '@/types';

describe('authSlice', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.TESTER,
    orgId: 'org-1',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockAccessToken = 'mock-jwt-token-123';

  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    accessToken: null,
    isLoading: false,
    error: null,
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should handle setUser', () => {
      const state = authReducer(undefined, setUser(mockUser));
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle setUser and clear previous error', () => {
      const previousState: AuthState = {
        ...initialState,
        error: 'Previous error',
      };
      const state = authReducer(previousState, setUser(mockUser));
      expect(state.error).toBeNull();
    });

    it('should handle clearUser', () => {
      const previousState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        accessToken: mockAccessToken,
        isLoading: false,
        error: null,
      };
      const state = authReducer(previousState, clearUser());
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should handle setCredentials', () => {
      const state = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: mockAccessToken })
      );
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockAccessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle setCredentials and clear loading/error state', () => {
      const previousState: AuthState = {
        ...initialState,
        isLoading: true,
        error: 'Previous error',
      };
      const state = authReducer(
        previousState,
        setCredentials({ user: mockUser, accessToken: mockAccessToken })
      );
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle clearCredentials', () => {
      const previousState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        accessToken: mockAccessToken,
        isLoading: true,
        error: 'Some error',
      };
      const state = authReducer(previousState, clearCredentials());
      expect(state).toEqual(initialState);
    });

    it('should handle setAccessToken', () => {
      const newToken = 'new-jwt-token-456';
      const previousState: AuthState = {
        ...initialState,
        accessToken: mockAccessToken,
      };
      const state = authReducer(previousState, setAccessToken(newToken));
      expect(state.accessToken).toBe(newToken);
    });

    it('should handle setAuthLoading', () => {
      const state = authReducer(undefined, setAuthLoading(true));
      expect(state.isLoading).toBe(true);

      const state2 = authReducer(state, setAuthLoading(false));
      expect(state2.isLoading).toBe(false);
    });

    it('should handle setAuthError', () => {
      const errorMessage = 'Invalid credentials';
      const previousState: AuthState = {
        ...initialState,
        isLoading: true,
      };
      const state = authReducer(previousState, setAuthError(errorMessage));
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    it('should handle clearAuthError', () => {
      const previousState: AuthState = {
        ...initialState,
        error: 'Some error',
      };
      const state = authReducer(previousState, clearAuthError());
      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    const authenticatedState: AuthState = {
      user: mockUser,
      isAuthenticated: true,
      accessToken: mockAccessToken,
      isLoading: false,
      error: null,
    };

    const stateWithAuth = { auth: authenticatedState };

    it('selectUser should return the user', () => {
      expect(selectUser(stateWithAuth)).toEqual(mockUser);
      expect(selectUser({ auth: initialState })).toBeNull();
    });

    it('selectIsAuthenticated should return authentication status', () => {
      expect(selectIsAuthenticated(stateWithAuth)).toBe(true);
      expect(selectIsAuthenticated({ auth: initialState })).toBe(false);
    });

    it('selectAccessToken should return the access token', () => {
      expect(selectAccessToken(stateWithAuth)).toBe(mockAccessToken);
      expect(selectAccessToken({ auth: initialState })).toBeNull();
    });

    it('selectAuthLoading should return loading status', () => {
      expect(selectAuthLoading(stateWithAuth)).toBe(false);
      const loadingState = { auth: { ...initialState, isLoading: true } };
      expect(selectAuthLoading(loadingState)).toBe(true);
    });

    it('selectAuthError should return error message', () => {
      expect(selectAuthError(stateWithAuth)).toBeNull();
      const errorState = { auth: { ...initialState, error: 'Test error' } };
      expect(selectAuthError(errorState)).toBe('Test error');
    });
  });
});
