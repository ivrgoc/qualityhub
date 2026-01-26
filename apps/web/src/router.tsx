/* eslint-disable react-refresh/only-export-components */
import { type FC, Suspense, lazy } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { ProtectedRoute, GuestRoute } from '@/components/routing';

// Lazy-loaded page components
const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage }))
);
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  }))
);

/**
 * Loading fallback component displayed while lazy-loaded routes are loading.
 */
const PageLoadingFallback: FC = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner size="lg" label="Loading page..." />
  </div>
);

/**
 * Layout wrapper that provides Suspense boundary for lazy-loaded routes.
 */
const SuspenseLayout: FC = () => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Outlet />
  </Suspense>
);

/**
 * Route configuration for public routes (accessible to all).
 */
const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

/**
 * Route configuration for guest-only routes (login, register).
 * Authenticated users are redirected to dashboard.
 */
const guestRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
];

/**
 * Route configuration for protected routes (require authentication).
 * Unauthenticated users are redirected to login.
 */
const protectedRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
];

/**
 * Combined route configuration with Suspense wrapper.
 */
const routes: RouteObject[] = [
  {
    element: <SuspenseLayout />,
    children: [...publicRoutes, ...guestRoutes, ...protectedRoutes],
  },
];

/**
 * Application router instance.
 * Uses createBrowserRouter for client-side routing with the History API.
 */
export const router = createBrowserRouter(routes);
