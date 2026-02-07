import { useMemo } from 'react';
import {
  useGetDashboardQuery,
  useCompleteTodoMutation,
  type DashboardStats,
  type ActivityItem,
  type TodoItem,
  type RecentRun,
} from '@/store/api/dashboardApi';

/**
 * Return type for the useDashboard hook.
 */
export interface UseDashboardReturn {
  /** Dashboard statistics */
  stats: DashboardStats | null;
  /** Recent activity items */
  activity: ActivityItem[];
  /** Assigned todo items */
  todos: TodoItem[];
  /** Recent test runs */
  recentRuns: RecentRun[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether data is being refetched */
  isFetching: boolean;
  /** Error message if any */
  error: string | undefined;
  /** Refetch dashboard data */
  refetch: () => void;
  /** Mark a todo as complete */
  completeTodo: (todoId: string, status: string) => Promise<void>;
  /** Whether completing a todo */
  isCompletingTodo: boolean;
}

/**
 * Hook for fetching and managing dashboard data.
 *
 * @example
 * const { stats, activity, todos, recentRuns, isLoading } = useDashboard();
 */
export function useDashboard(): UseDashboardReturn {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDashboardQuery();

  const [completeTodoMutation, { isLoading: isCompletingTodo }] = useCompleteTodoMutation();

  const completeTodo = async (todoId: string, status: string): Promise<void> => {
    await completeTodoMutation({ todoId, status }).unwrap();
  };

  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    if (typeof error === 'object' && 'status' in error) {
      if (error.status === 'FETCH_ERROR') {
        return 'Unable to connect to the server.';
      }
    }
    return 'Failed to load dashboard data.';
  }, [error]);

  return {
    stats: data?.stats ?? null,
    activity: data?.activity ?? [],
    todos: data?.todos ?? [],
    recentRuns: data?.recentRuns ?? [],
    isLoading,
    isFetching,
    error: errorMessage,
    refetch,
    completeTodo,
    isCompletingTodo,
  };
}
