import { baseApi } from './baseApi';
import type { User } from '@/types';
import { setUser, clearUser } from '../slices/authSlice';

/**
 * Request payload for user login.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response payload from successful login or registration.
 */
export interface LoginResponse {
  accessToken: string;
  user: User;
}

/**
 * Request payload for user registration.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Auth API slice with login, register, logout, and getMe endpoints.
 * Handles authentication state management and token storage.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Login with email and password.
     * On success: stores access token in localStorage and updates auth state.
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store access token in localStorage for persistence
          localStorage.setItem('accessToken', data.accessToken);
          // Update auth state with user data
          dispatch(setUser(data.user));
        } catch {
          // Error handling is done by RTK Query - no action needed here
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Register a new user account.
     * On success: stores access token in localStorage and updates auth state.
     */
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store access token in localStorage for persistence
          localStorage.setItem('accessToken', data.accessToken);
          // Update auth state with user data
          dispatch(setUser(data.user));
        } catch {
          // Error handling is done by RTK Query - no action needed here
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Logout the current user.
     * Clears access token from localStorage and resets auth state.
     */
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // Always clear auth state on logout attempt, even if request fails
          localStorage.removeItem('accessToken');
          dispatch(clearUser());
          // Reset the entire API cache to clear any user-specific data
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    /**
     * Get the currently authenticated user's profile.
     * Used for session restoration and profile display.
     */
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: [{ type: 'User', id: 'ME' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update auth state with fetched user data
          dispatch(setUser(data));
        } catch {
          // If getMe fails (e.g., token expired), clear auth state
          localStorage.removeItem('accessToken');
          dispatch(clearUser());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
