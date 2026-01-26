/**
 * Application route paths as constants for type-safe navigation.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;

/**
 * Type representing all valid route paths.
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
