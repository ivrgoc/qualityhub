import type { Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

/** Default test user credentials used across E2E tests. */
export const TEST_USER = {
  id: 'usr_e2e_001',
  email: 'qa@qualityhub.test',
  password: 'SecurePassword123!',
  name: 'QA Tester',
  role: 'lead' as const,
  organizationId: 'org_e2e_001',
  createdAt: '2025-06-01T00:00:00.000Z',
  updatedAt: '2025-06-01T00:00:00.000Z',
} as const;

/** Sample projects returned by the mocked API. */
export const TEST_PROJECTS = [
  {
    id: 'proj_001',
    name: 'Web App Regression',
    description: 'Regression test suite for the main web application',
    organizationId: TEST_USER.organizationId,
    createdAt: '2025-07-01T00:00:00.000Z',
    updatedAt: '2025-09-15T00:00:00.000Z',
    deletedAt: null,
    stats: { testCases: 142, testRuns: 23, passRate: 94 },
    memberCount: 5,
  },
  {
    id: 'proj_002',
    name: 'Mobile API Tests',
    description: 'API integration tests for the mobile client',
    organizationId: TEST_USER.organizationId,
    createdAt: '2025-08-10T00:00:00.000Z',
    updatedAt: '2025-10-01T00:00:00.000Z',
    deletedAt: null,
    stats: { testCases: 87, testRuns: 12, passRate: 88 },
    memberCount: 3,
  },
] as const;

/** Fake JWT access token for mocked authentication. */
const FAKE_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2e-test-token';

// ---------------------------------------------------------------------------
// Mock API helpers
// ---------------------------------------------------------------------------

/**
 * Sets up API route mocks that are common across most tests.
 *
 * This intercepts `/api/v1/auth/me` so the app's session-init logic
 * recognises the user as authenticated without needing a running backend.
 */
export async function mockAuthenticatedSession(page: Page): Promise<void> {
  // Mock the getMe endpoint used by useSessionInit
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
        role: TEST_USER.role,
        organizationId: TEST_USER.organizationId,
        createdAt: TEST_USER.createdAt,
        updatedAt: TEST_USER.updatedAt,
      }),
    }),
  );

  // Seed localStorage with a fake access token so the app attempts session
  // restoration (which will hit the mocked /auth/me above).
  await page.addInitScript((token: string) => {
    localStorage.setItem('accessToken', token);
  }, FAKE_ACCESS_TOKEN);
}

/**
 * Sets up a mock for the login endpoint that succeeds with the test user.
 */
export async function mockLoginEndpoint(page: Page): Promise<void> {
  await page.route('**/api/v1/auth/login', (route, request) => {
    const body = request.postDataJSON() as { email: string; password: string } | null;

    if (body?.email === TEST_USER.email && body?.password === TEST_USER.password) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: FAKE_ACCESS_TOKEN,
          user: {
            id: TEST_USER.id,
            email: TEST_USER.email,
            name: TEST_USER.name,
            role: TEST_USER.role,
            organizationId: TEST_USER.organizationId,
            createdAt: TEST_USER.createdAt,
            updatedAt: TEST_USER.updatedAt,
          },
        }),
      });
    }

    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid email or password.' }),
    });
  });
}

/**
 * Sets up a mock for the projects list endpoint.
 */
export async function mockProjectsEndpoint(page: Page): Promise<void> {
  await page.route('**/api/v1/projects*', (route) => {
    // Handle both /projects and /projects?includeStats=true etc.
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: TEST_PROJECTS,
        total: TEST_PROJECTS.length,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      }),
    });
  });
}

/**
 * Sets up a mock for the project creation endpoint.
 */
export async function mockCreateProjectEndpoint(page: Page): Promise<void> {
  await page.route('**/api/v1/projects', (route, request) => {
    if (request.method() !== 'POST') {
      return route.fallback();
    }

    const body = request.postDataJSON() as { name: string; description?: string } | null;
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: `proj_${Date.now()}`,
        name: body?.name ?? 'New Project',
        description: body?.description ?? '',
        organizationId: TEST_USER.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      }),
    });
  });
}

/**
 * Sets up a mock for the dashboard endpoint.
 */
export async function mockDashboardEndpoint(page: Page): Promise<void> {
  await page.route('**/api/v1/dashboard*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stats: {
          projects: { total: 2, active: 2 },
          testCases: { total: 229 },
          testRuns: { total: 35, inProgress: 3 },
          passRate: { current: 91, trend: 2.5 },
        },
        activity: [],
        todos: [],
        recentRuns: [],
      }),
    }),
  );
}

/**
 * Mock the unauthenticated session.
 * Ensures no token is in localStorage and /auth/me returns 401.
 */
export async function mockUnauthenticatedSession(page: Page): Promise<void> {
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    }),
  );

  await page.addInitScript(() => {
    localStorage.removeItem('accessToken');
  });
}

/**
 * Mock the token refresh endpoint to always fail (forces re-login).
 */
export async function mockRefreshEndpointFailing(page: Page): Promise<void> {
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Refresh token expired' }),
    }),
  );
}

/**
 * Mock the logout endpoint.
 */
export async function mockLogoutEndpoint(page: Page): Promise<void> {
  await page.route('**/api/v1/auth/logout', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Logged out' }),
    }),
  );
}
