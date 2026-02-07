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

export const { useGetDashboardQuery, useCompleteTodoMutation } = dashboardApi;
