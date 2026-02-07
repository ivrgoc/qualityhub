import { baseApi } from './baseApi';

/**
 * Dashboard statistics overview.
 */
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
  };
  testCases: {
    total: number;
    automated: number;
    manual: number;
  };
  testRuns: {
    total: number;
    inProgress: number;
    completed: number;
  };
  passRate: {
    current: number;
    trend: number; // percentage change from previous period
  };
}

/**
 * Activity item for the activity feed.
 */
export interface ActivityItem {
  id: string;
  type: 'test_created' | 'test_updated' | 'run_started' | 'run_completed' | 'result_added';
  message: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  timestamp: string;
}

/**
 * Todo item for assigned tests.
 */
export interface TodoItem {
  id: string;
  testRunId: string;
  testRunName: string;
  testCaseId: string;
  testCaseTitle: string;
  projectId: string;
  projectName: string;
  dueDate?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Recent test run for the runs table.
 */
export interface RecentRun {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  totalTests: number;
  passed: number;
  failed: number;
  blocked: number;
  untested: number;
  passRate: number;
  status: 'in_progress' | 'completed';
  assignee?: {
    id: string;
    name: string;
  };
  startedAt: string;
  completedAt?: string;
}

/**
 * Complete dashboard data response.
 */
export interface DashboardData {
  stats: DashboardStats;
  activity: ActivityItem[];
  todos: TodoItem[];
  recentRuns: RecentRun[];
}

/**
 * Project-specific stats from the dashboard/stats endpoint.
 */
export interface ProjectStats {
  testCases: {
    total: number;
    automated: number;
    manual: number;
  };
  testRuns: {
    total: number;
    inProgress: number;
    completed: number;
  };
  passRate: {
    current: number;
    trend: number;
  };
  coverage: {
    overall: number;
  };
}

/**
 * Project-specific recent run from dashboard.
 */
export interface ProjectRecentRun {
  id: string;
  name: string;
  status: 'in_progress' | 'completed';
  passRate: number;
  startedAt: string;
  completedAt?: string;
}

/**
 * Internal type for run payloads from the API.
 */
interface RunPayload {
  id: string;
  name: string;
  completedAt?: string;
  startedAt?: string;
  createdAt: string;
  stats?: { passed: number; total: number; untested: number };
}

/**
 * Dashboard API slice.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get dashboard overview data including stats, activity, todos, and recent runs.
     */
    getDashboard: builder.query<DashboardData, void>({
      query: () => '/dashboard',
      providesTags: ['Project', 'TestCase', 'TestRun', 'TestResult'],
    }),

    /**
     * Get project-specific aggregated statistics.
     */
    getProjectStats: builder.query<ProjectStats, string>({
      query: (projectId) => `/projects/${projectId}/dashboard/stats`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Project', id: projectId },
        'TestCase',
        'TestRun',
      ],
    }),

    /**
     * Get recent test runs for a project (via dashboard).
     */
    getProjectRecentRuns: builder.query<ProjectRecentRun[], string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/runs`,
        params: { pageSize: 5, sort: 'createdAt', order: 'desc' },
      }),
      transformResponse: (response: unknown) => {
        const resp = response as { items?: RunPayload[] } | RunPayload[];
        const items: RunPayload[] = Array.isArray(resp) ? resp : resp.items ?? [];
        return items.map((run): ProjectRecentRun => {
          const stats = run.stats ?? { passed: 0, total: 0, untested: 0 };
          const completed = stats.total - stats.untested;
          return {
            id: run.id,
            name: run.name,
            status: run.completedAt ? 'completed' : 'in_progress',
            passRate: completed > 0 ? (stats.passed / completed) * 100 : 0,
            startedAt: run.startedAt ?? run.createdAt,
            completedAt: run.completedAt,
          };
        });
      },
      providesTags: ['TestRun'],
    }),

    /**
     * Mark a todo item as complete (mark test as executed).
     */
    completeTodo: builder.mutation<void, { todoId: string; status: string }>({
      query: ({ todoId, status }) => ({
        url: `/dashboard/todos/${todoId}/complete`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['TestRun', 'TestResult'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetProjectStatsQuery,
  useGetProjectRecentRunsQuery,
  useCompleteTodoMutation,
} = dashboardApi;
