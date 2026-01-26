import { type FC, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

/**
 * Props for route guard components.
 */
export interface RouteGuardProps {
  children: ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Protects auth routes (login/register) from authenticated users.
 * Redirects to dashboard if user is already authenticated.
 */
export const GuestRoute: FC<RouteGuardProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
