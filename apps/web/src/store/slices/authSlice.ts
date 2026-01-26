import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

/**
 * Authentication state interface.
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Payload for setting credentials (user + token).
 */
export interface SetCredentialsPayload {
  user: User;
  accessToken: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set the authenticated user.
     * Used when user data is fetched (e.g., from getMe endpoint).
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    /**
     * Clear the current user and authentication state.
     * Used during logout or when auth fails.
     */
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.error = null;
    },

    /**
     * Set both user and access token after successful login/register.
     */
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Clear credentials (both user and token).
     * Alias for clearUser with explicit naming for credential operations.
     */
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Update the access token (e.g., after token refresh).
     */
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    /**
     * Set the loading state during auth operations.
     */
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set an authentication error.
     */
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    /**
     * Clear any authentication error.
     */
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  clearUser,
  setCredentials,
  clearCredentials,
  setAccessToken,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }): User | null => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }): string | null =>
  state.auth.accessToken;
export const selectAuthLoading = (state: { auth: AuthState }): boolean => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }): string | null => state.auth.error;

export default authSlice.reducer;
