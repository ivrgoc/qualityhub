import { type FC, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

/**
 * Props for route guard components.
 */
export interface RouteGuardProps {
  children: ReactNode;
}

/**
 * Props for AuthGuard component with configurable redirect.
 */
export interface AuthGuardProps extends RouteGuardProps {
  /** URL to redirect unauthenticated users (defaults to login) */
  redirectTo?: string;
}

/**
 * Loading screen displayed while checking authentication status.
 */
const AuthLoadingScreen: FC = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner size="lg" label="Checking authentication..." />
  </div>
);

/**
 * AuthGuard component that protects routes requiring authentication.
 *
 * Features:
 * - Shows loading spinner while auth status is being determined
 * - Redirects unauthenticated users to login page
 * - Preserves the intended destination URL in location state for redirect-back after login
 * - Configurable redirect URL via props
 *
 * @example
 * // Basic usage
 * <AuthGuard>
 *   <DashboardPage />
 * </AuthGuard>
 *
 * @example
 * // With custom redirect
 * <AuthGuard redirectTo="/signin">
 *   <ProtectedContent />
 * </AuthGuard>
 */
export const AuthGuard: FC<AuthGuardProps> = ({
  children,
  redirectTo = ROUTES.LOGIN,
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading screen while checking authentication status
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Redirect unauthenticated users to login, preserving intended destination
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
};

/**
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 *
 * @deprecated Use AuthGuard instead for better loading state handling and redirect-back support
 */
export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading screen while checking authentication status
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
};

/**
 * Props for GuestGuard component with configurable redirect.
 */
export interface GuestGuardProps extends RouteGuardProps {
  /** URL to redirect authenticated users (defaults to dashboard) */
  redirectTo?: string;
}

/**
 * GuestGuard component that protects auth routes from authenticated users.
 *
 * Features:
 * - Shows loading spinner while auth status is being determined
 * - Redirects authenticated users to dashboard or intended destination
 * - Supports redirect-back to originally intended URL after login
 * - Configurable default redirect URL via props
 *
 * @example
 * // Basic usage
 * <GuestGuard>
 *   <LoginPage />
 * </GuestGuard>
 *
 * @example
 * // With custom redirect
 * <GuestGuard redirectTo="/home">
 *   <RegisterPage />
 * </GuestGuard>
 */
export const GuestGuard: FC<GuestGuardProps> = ({
  children,
  redirectTo = ROUTES.DASHBOARD,
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading screen while checking authentication status
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    // Redirect to the originally intended destination or configured default
    const from = (location.state as { from?: string } | null)?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * Protects auth routes (login/register) from authenticated users.
 * Redirects to the originally intended destination or dashboard if user is already authenticated.
 *
 * @deprecated Use GuestGuard instead for better configurability and consistency
 */
export const GuestRoute: FC<RouteGuardProps> = ({ children }) => {
  return <GuestGuard>{children}</GuestGuard>;
};
