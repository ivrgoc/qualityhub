import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  type LoginRequest,
  type RegisterRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from '@/store/api/authApi';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import type { User } from '@/types';

/**
 * Return type for the useAuth hook.
 */
export interface UseAuthReturn {
  /** Currently authenticated user or null */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  isLoading: boolean;
  /** Current auth error message */
  error: string | null;
  /** Login with email and password */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Whether login is in progress */
  isLoggingIn: boolean;
  /** Login error */
  loginError: string | undefined;
  /** Register a new account */
  register: (data: RegisterRequest) => Promise<void>;
  /** Whether registration is in progress */
  isRegistering: boolean;
  /** Registration error */
  registerError: string | undefined;
  /** Logout the current user */
  logout: () => Promise<void>;
  /** Whether logout is in progress */
  isLoggingOut: boolean;
  /** Request password reset email */
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  /** Whether forgot password request is in progress */
  isForgotPasswordLoading: boolean;
  /** Forgot password error */
  forgotPasswordError: string | undefined;
  /** Reset password with token */
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  /** Whether reset password is in progress */
  isResetPasswordLoading: boolean;
  /** Reset password error */
  resetPasswordError: string | undefined;
}

/**
 * Extracts error message from RTK Query error.
 */
function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;

  // RTK Query FetchBaseQueryError
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Handle API error response
    if (err['data'] && typeof err['data'] === 'object') {
      const data = err['data'] as Record<string, unknown>;
      if (typeof data['message'] === 'string') {
        return data['message'];
      }
    }

    // Handle status errors
    if (err['status'] === 'FETCH_ERROR') {
      return 'Unable to connect to the server. Please check your connection.';
    }

    if (err['status'] === 401) {
      return 'Invalid email or password.';
    }

    if (err['status'] === 409) {
      return 'An account with this email already exists.';
    }

    if (typeof err['error'] === 'string') {
      return err['error'];
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Hook for authentication operations.
 *
 * Provides access to current user state and authentication actions
 * (login, register, logout, forgot/reset password).
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Login
 * await login({ email: 'user@example.com', password: 'password' });
 *
 * // Logout
 * await logout();
 */
export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth state selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // RTK Query mutations
  const [loginMutation, { isLoading: isLoggingIn, error: loginErr }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering, error: registerErr }] =
    useRegisterMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [forgotPasswordMutation, { isLoading: isForgotPasswordLoading, error: forgotErr }] =
    useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetPasswordLoading, error: resetErr }] =
    useResetPasswordMutation();

  /**
   * Login with email and password.
   * On success, redirects to the originally intended destination or dashboard.
   */
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      await loginMutation(credentials).unwrap();

      // Redirect to intended destination or dashboard
      const from = (location.state as { from?: string } | null)?.from || ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    },
    [loginMutation, navigate, location.state]
  );

  /**
   * Register a new user account.
   * On success, redirects to dashboard.
   */
  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      await registerMutation(data).unwrap();
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    [registerMutation, navigate]
  );

  /**
   * Logout the current user.
   * Redirects to login page after logout.
   */
  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation().unwrap();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [logoutMutation, navigate]);

  /**
   * Request a password reset email.
   */
  const forgotPassword = useCallback(
    async (data: ForgotPasswordRequest): Promise<void> => {
      await forgotPasswordMutation(data).unwrap();
    },
    [forgotPasswordMutation]
  );

  /**
   * Reset password using a token from email.
   * On success, redirects to login page.
   */
  const resetPassword = useCallback(
    async (data: ResetPasswordRequest): Promise<void> => {
      await resetPasswordMutation(data).unwrap();
      navigate(ROUTES.LOGIN, { replace: true });
    },
    [resetPasswordMutation, navigate]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    isLoggingIn,
    loginError: getErrorMessage(loginErr),
    register,
    isRegistering,
    registerError: getErrorMessage(registerErr),
    logout,
    isLoggingOut,
    forgotPassword,
    isForgotPasswordLoading,
    forgotPasswordError: getErrorMessage(forgotErr),
    resetPassword,
    isResetPasswordLoading,
    resetPasswordError: getErrorMessage(resetErr),
  };
}
