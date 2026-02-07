/**
 * Application route paths as constants for type-safe navigation.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (projectId: string) => `/projects/${projectId}`,
  PROJECT_TEST_CASES: (projectId: string) => `/projects/${projectId}/test-cases`,
  PROJECT_TEAM: (projectId: string) => `/projects/${projectId}/team`,
  PROJECT_SETTINGS: (projectId: string) => `/projects/${projectId}/settings`,
} as const;

/**
 * Type representing all valid route paths.
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
