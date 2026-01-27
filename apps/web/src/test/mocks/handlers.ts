import { http, HttpResponse } from 'msw';

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'tester',
  orgId: 'org-456',
};

// Mock organization data
export const mockOrganization = {
  id: 'org-456',
  name: 'Test Organization',
  slug: 'test-org',
  plan: 'free',
};

// Mock project data
export const mockProjects = [
  {
    id: 'project-1',
    name: 'Project One',
    description: 'First test project',
    organizationId: 'org-456',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'project-2',
    name: 'Project Two',
    description: 'Second test project',
    organizationId: 'org-456',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
];

// Mock test cases data
export const mockTestCases = [
  {
    id: 'tc-1',
    title: 'Login with valid credentials',
    templateType: 'steps',
    priority: 'high',
    version: 1,
    projectId: 'project-1',
    createdBy: 'user-123',
    createdAt: '2024-01-10T00:00:00Z',
    steps: [
      { step: 'Navigate to login page', expectedResult: 'Login page displayed' },
      { step: 'Enter credentials', expectedResult: 'Credentials entered' },
      { step: 'Click login', expectedResult: 'User logged in' },
    ],
  },
  {
    id: 'tc-2',
    title: 'Login with invalid password',
    templateType: 'steps',
    priority: 'medium',
    version: 1,
    projectId: 'project-1',
    createdBy: 'user-123',
    createdAt: '2024-01-11T00:00:00Z',
    steps: [
      { step: 'Navigate to login page', expectedResult: 'Login page displayed' },
      { step: 'Enter invalid password', expectedResult: 'Error message shown' },
    ],
  },
];

// Mock test runs data
export const mockTestRuns = [
  {
    id: 'run-1',
    name: 'Regression Test Run',
    status: 'in_progress',
    projectId: 'project-1',
    assigneeId: 'user-123',
    createdAt: '2024-03-01T00:00:00Z',
    progress: {
      total: 10,
      passed: 5,
      failed: 2,
      blocked: 1,
      untested: 2,
    },
  },
];

// Mock dashboard data
export const mockDashboardData = {
  stats: {
    totalProjects: 2,
    totalTestCases: 25,
    totalTestRuns: 5,
    passRate: 85.5,
  },
  recentActivity: [
    {
      id: 'activity-1',
      type: 'test_result',
      user: mockUser,
      action: 'recorded result',
      target: 'Login Test',
      timestamp: '2024-03-15T10:30:00Z',
    },
    {
      id: 'activity-2',
      type: 'test_case',
      user: mockUser,
      action: 'created',
      target: 'Registration Flow',
      timestamp: '2024-03-15T09:00:00Z',
    },
  ],
  todoItems: [
    {
      id: 'todo-1',
      testCaseId: 'tc-1',
      testRunId: 'run-1',
      title: 'Login with valid credentials',
      status: 'untested',
    },
    {
      id: 'todo-2',
      testCaseId: 'tc-2',
      testRunId: 'run-1',
      title: 'Login with invalid password',
      status: 'untested',
    },
  ],
  recentRuns: mockTestRuns,
};

// Auth tokens
const mockTokens = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
};

// API Base URL
const API_BASE = '/api/v1';

// Request handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'Password123!') {
      return HttpResponse.json({
        ...mockTokens,
        user: mockUser,
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials', statusCode: 401 },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
      organizationName: string;
    };

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'Email already registered', statusCode: 409 },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      id: 'new-user-123',
      email: body.email,
      name: body.name,
      role: 'tester',
      organizationId: 'new-org-123',
    }, { status: 201 });
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.post(`${API_BASE}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };

    if (body.refreshToken === mockTokens.refreshToken) {
      return HttpResponse.json({
        accessToken: 'new-access-token-789',
        refreshToken: 'new-refresh-token-012',
      });
    }

    return HttpResponse.json(
      { message: 'Invalid refresh token', statusCode: 401 },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 }
      );
    }

    return HttpResponse.json(mockUser);
  }),

  // Projects endpoints
  http.get(`${API_BASE}/projects`, () => {
    return HttpResponse.json(mockProjects);
  }),

  http.get(`${API_BASE}/projects/:projectId`, ({ params }) => {
    const project = mockProjects.find((p) => p.id === params.projectId);

    if (!project) {
      return HttpResponse.json(
        { message: 'Project not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json(project);
  }),

  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string };

    return HttpResponse.json({
      id: `project-${Date.now()}`,
      name: body.name,
      description: body.description || null,
      organizationId: 'org-456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.patch(`${API_BASE}/projects/:projectId`, async ({ params, request }) => {
    const project = mockProjects.find((p) => p.id === params.projectId);

    if (!project) {
      return HttpResponse.json(
        { message: 'Project not found', statusCode: 404 },
        { status: 404 }
      );
    }

    const body = await request.json();
    return HttpResponse.json({ ...project, ...body });
  }),

  http.delete(`${API_BASE}/projects/:projectId`, ({ params }) => {
    const project = mockProjects.find((p) => p.id === params.projectId);

    if (!project) {
      return HttpResponse.json(
        { message: 'Project not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Test cases endpoints
  http.get(`${API_BASE}/projects/:projectId/cases`, ({ params }) => {
    const cases = mockTestCases.filter((tc) => tc.projectId === params.projectId);
    return HttpResponse.json(cases);
  }),

  http.get(`${API_BASE}/projects/:projectId/cases/:caseId`, ({ params }) => {
    const testCase = mockTestCases.find((tc) => tc.id === params.caseId);

    if (!testCase) {
      return HttpResponse.json(
        { message: 'Test case not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json(testCase);
  }),

  http.post(`${API_BASE}/projects/:projectId/cases`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string; priority?: string };

    return HttpResponse.json({
      id: `tc-${Date.now()}`,
      title: body.title,
      templateType: 'steps',
      priority: body.priority || 'medium',
      version: 1,
      projectId: params.projectId,
      createdBy: 'user-123',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.patch(`${API_BASE}/projects/:projectId/cases/:caseId`, async ({ params, request }) => {
    const testCase = mockTestCases.find((tc) => tc.id === params.caseId);

    if (!testCase) {
      return HttpResponse.json(
        { message: 'Test case not found', statusCode: 404 },
        { status: 404 }
      );
    }

    const body = await request.json();
    return HttpResponse.json({
      ...testCase,
      ...body,
      version: testCase.version + 1,
    });
  }),

  http.delete(`${API_BASE}/projects/:projectId/cases/:caseId`, ({ params }) => {
    const testCase = mockTestCases.find((tc) => tc.id === params.caseId);

    if (!testCase) {
      return HttpResponse.json(
        { message: 'Test case not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE}/projects/:projectId/cases/:caseId/history`, ({ params }) => {
    const testCase = mockTestCases.find((tc) => tc.id === params.caseId);

    if (!testCase) {
      return HttpResponse.json(
        { message: 'Test case not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json([
      {
        id: 'version-1',
        testCaseId: params.caseId,
        version: 1,
        data: testCase,
        changedBy: 'user-123',
        createdAt: '2024-01-10T00:00:00Z',
      },
    ]);
  }),

  // Test runs endpoints
  http.get(`${API_BASE}/projects/:projectId/runs`, ({ params }) => {
    const runs = mockTestRuns.filter((r) => r.projectId === params.projectId);
    return HttpResponse.json(runs);
  }),

  http.get(`${API_BASE}/projects/:projectId/runs/:runId`, ({ params }) => {
    const run = mockTestRuns.find((r) => r.id === params.runId);

    if (!run) {
      return HttpResponse.json(
        { message: 'Test run not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json(run);
  }),

  http.post(`${API_BASE}/projects/:projectId/runs`, async ({ params, request }) => {
    const body = (await request.json()) as { name: string };

    return HttpResponse.json({
      id: `run-${Date.now()}`,
      name: body.name,
      status: 'not_started',
      projectId: params.projectId,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Dashboard endpoint
  http.get(`${API_BASE}/dashboard`, () => {
    return HttpResponse.json(mockDashboardData);
  }),

  // Reports endpoints
  http.get(`${API_BASE}/projects/:projectId/reports/summary`, () => {
    return HttpResponse.json({
      totalTestCases: 25,
      totalTestRuns: 5,
      passRate: 85.5,
      coverage: 72.3,
      byPriority: {
        critical: 5,
        high: 10,
        medium: 7,
        low: 3,
      },
      byStatus: {
        passed: 18,
        failed: 4,
        blocked: 2,
        skipped: 1,
      },
    });
  }),

  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }),
];

// Handler for simulating network errors
export const errorHandlers = {
  networkError: http.get('*', () => {
    return HttpResponse.error();
  }),

  serverError: http.get('*', () => {
    return HttpResponse.json(
      { message: 'Internal server error', statusCode: 500 },
      { status: 500 }
    );
  }),
};
