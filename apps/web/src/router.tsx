/* eslint-disable react-refresh/only-export-components */
import { type FC, Suspense, lazy } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { DashboardLayout } from '@/components/layouts';
import { AuthGuard, GuestGuard } from '@/components/routing';

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
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
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

// Project pages
const ProjectsListPage = lazy(() =>
  import('@/pages/projects/ProjectsListPage').then((module) => ({
    default: module.ProjectsListPage,
  }))
);
const ProjectDetailPage = lazy(() =>
  import('@/pages/projects/ProjectDetailPage').then((module) => ({
    default: module.ProjectDetailPage,
  }))
);
const ProjectOverviewPage = lazy(() =>
  import('@/pages/projects/ProjectOverviewPage').then((module) => ({
    default: module.ProjectOverviewPage,
  }))
);
const ProjectSettingsPage = lazy(() =>
  import('@/pages/projects/ProjectSettingsPage').then((module) => ({
    default: module.ProjectSettingsPage,
  }))
);
const ProjectTeamPage = lazy(() =>
  import('@/pages/projects/ProjectTeamPage').then((module) => ({
    default: module.ProjectTeamPage,
  }))
);

// Test Cases pages
const TestCasesPage = lazy(() =>
  import('@/pages/test-cases/TestCasesPage').then((module) => ({
    default: module.TestCasesPage,
  }))
);

// Test Runs pages
const TestRunsListPage = lazy(() =>
  import('@/pages/test-runs/TestRunsListPage').then((module) => ({
    default: module.TestRunsListPage,
  }))
);
const TestRunDetailPage = lazy(() =>
  import('@/pages/test-runs/TestRunDetailPage').then((module) => ({
    default: module.TestRunDetailPage,
  }))
);
const TestExecutionPage = lazy(() =>
  import('@/pages/test-runs/TestExecutionPage').then((module) => ({
    default: module.TestExecutionPage,
  }))
);

// Milestones pages
const MilestonesPage = lazy(() =>
  import('@/pages/milestones/MilestonesPage').then((module) => ({
    default: module.MilestonesPage,
  }))
);

// Reports pages
const ReportsPage = lazy(() =>
  import('@/pages/reports/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  }))
);
const ReportViewerPage = lazy(() =>
  import('@/pages/reports/ReportViewerPage').then((module) => ({
    default: module.ReportViewerPage,
  }))
);

// Requirements pages
const RequirementsPage = lazy(() =>
  import('@/pages/requirements/RequirementsPage').then((module) => ({
    default: module.RequirementsPage,
  }))
);
const RequirementDetailPage = lazy(() =>
  import('@/pages/requirements/RequirementDetailPage').then((module) => ({
    default: module.RequirementDetailPage,
  }))
);

// Settings pages
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);

/**
 * Preload functions for common navigation patterns.
 * Call these on mouseEnter/touchStart for faster navigation.
 */
export const preloadRoutes = {
  dashboard: () => import('@/pages/DashboardPage'),
  projects: () => import('@/pages/projects/ProjectsListPage'),
  projectDetail: () => import('@/pages/projects/ProjectDetailPage'),
  projectOverview: () => import('@/pages/projects/ProjectOverviewPage'),
  testCases: () => import('@/pages/test-cases/TestCasesPage'),
  testRuns: () => import('@/pages/test-runs/TestRunsListPage'),
  testExecution: () => import('@/pages/test-runs/TestExecutionPage'),
  milestones: () => import('@/pages/milestones/MilestonesPage'),
  reports: () => import('@/pages/reports/ReportsPage'),
  requirements: () => import('@/pages/requirements/RequirementsPage'),
  settings: () => import('@/pages/settings/SettingsPage'),
  login: () => import('@/pages/LoginPage'),
  register: () => import('@/pages/RegisterPage'),
};

/**
 * Hook for preloading routes on hover.
 * Usage: <Link onMouseEnter={usePreloadRoute('dashboard')} to="/dashboard">
 */
export const createPreloadHandler = (routeName: keyof typeof preloadRoutes) => {
  let preloaded = false;
  return () => {
    if (!preloaded) {
      preloaded = true;
      preloadRoutes[routeName]();
    }
  };
};

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
 * Route configuration for guest-only routes (login, register, password reset).
 * Authenticated users are redirected to dashboard.
 */
const guestRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestGuard>
        <ForgotPasswordPage />
      </GuestGuard>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <GuestGuard>
        <ResetPasswordPage />
      </GuestGuard>
    ),
  },
];

/**
 * Layout wrapper for protected routes that includes the dashboard layout.
 */
const ProtectedLayout: FC = () => (
  <AuthGuard>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </AuthGuard>
);

/**
 * Route configuration for protected routes (require authentication).
 * Unauthenticated users are redirected to login.
 */
const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/projects',
        element: <ProjectsListPage />,
      },
      {
        path: '/projects/:projectId',
        element: <ProjectDetailPage />,
        children: [
          {
            index: true,
            element: <ProjectOverviewPage />,
          },
          {
            path: 'test-cases',
            element: <TestCasesPage />,
          },
          {
            path: 'runs',
            element: <TestRunsListPage />,
          },
          {
            path: 'runs/:runId',
            element: <TestRunDetailPage />,
          },
          {
            path: 'runs/:runId/execute',
            element: <TestExecutionPage />,
          },
          {
            path: 'milestones',
            element: <MilestonesPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'reports/:reportType',
            element: <ReportViewerPage />,
          },
          {
            path: 'requirements',
            element: <RequirementsPage />,
          },
          {
            path: 'requirements/:requirementId',
            element: <RequirementDetailPage />,
          },
          {
            path: 'team',
            element: <ProjectTeamPage />,
          },
          {
            path: 'settings',
            element: <ProjectSettingsPage />,
          },
        ],
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
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
