import { type FC } from 'react';
import {
  FolderKanban,
  FileText,
  PlayCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button, Alert, AlertDescription } from '@/components/ui';
import {
  StatsCard,
  ActivityFeed,
  TodoList,
  RecentRunsTable,
} from '@/components/features/dashboard';
import { useDashboard } from '@/hooks/useDashboard';

/**
 * Dashboard page displaying stats, activity, todos, and recent test runs.
 */
export const DashboardPage: FC = () => {
  const {
    stats,
    activity,
    todos,
    recentRuns,
    isLoading,
    isFetching,
    error,
    refetch,
    completeTodo,
    isCompletingTodo,
  } = useDashboard();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here's an overview of your testing activity.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<FolderKanban />}
          label="Active Projects"
          value={stats?.projects.active ?? 0}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          icon={<FileText />}
          label="Test Cases"
          value={stats?.testCases.total ?? 0}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          icon={<PlayCircle />}
          label="Active Runs"
          value={stats?.testRuns.inProgress ?? 0}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          icon={<TrendingUp />}
          label="Pass Rate"
          value={`${stats?.passRate.current ?? 0}%`}
          trend={stats?.passRate.trend}
          trendLabel="vs last week"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed items={activity} isLoading={isLoading} maxItems={8} />
        </div>

        {/* Todo List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TodoList
            items={todos}
            isLoading={isLoading}
            onComplete={(todoId) => completeTodo(todoId, 'passed')}
            isCompleting={isCompletingTodo}
            maxItems={5}
          />
        </div>
      </div>

      {/* Recent Runs Table */}
      <RecentRunsTable runs={recentRuns} isLoading={isLoading} maxRuns={5} />
    </div>
  );
};
