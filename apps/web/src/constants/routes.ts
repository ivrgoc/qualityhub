/**
 * Application route paths as constants for type-safe navigation.
 */
export const ROUTES = {
  // Public
  HOME: '/',

  // Auth (guest-only)
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Projects
  PROJECTS: '/projects',
  PROJECT_DETAIL: (projectId: string) => `/projects/${projectId}`,
  PROJECT_TEST_CASES: (projectId: string) => `/projects/${projectId}/test-cases`,
  PROJECT_RUNS: (projectId: string) => `/projects/${projectId}/runs`,
  PROJECT_RUN_DETAIL: (projectId: string, runId: string) =>
    `/projects/${projectId}/runs/${runId}`,
  PROJECT_RUN_EXECUTE: (projectId: string, runId: string) =>
    `/projects/${projectId}/runs/${runId}/execute`,
  PROJECT_MILESTONES: (projectId: string) => `/projects/${projectId}/milestones`,
  PROJECT_REPORTS: (projectId: string) => `/projects/${projectId}/reports`,
  PROJECT_REPORT_VIEWER: (projectId: string, reportType: string) =>
    `/projects/${projectId}/reports/${reportType}`,
  PROJECT_REQUIREMENTS: (projectId: string) => `/projects/${projectId}/requirements`,
  PROJECT_REQUIREMENT_DETAIL: (projectId: string, requirementId: string) =>
    `/projects/${projectId}/requirements/${requirementId}`,
  PROJECT_TEAM: (projectId: string) => `/projects/${projectId}/team`,
  PROJECT_SETTINGS: (projectId: string) => `/projects/${projectId}/settings`,

  // Global Settings
  SETTINGS: '/settings',
} as const;

/**
 * Type representing all valid route paths.
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
