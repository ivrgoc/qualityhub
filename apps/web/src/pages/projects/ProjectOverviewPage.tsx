import { type FC, useMemo } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  FileText,
  PlayCircle,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui';
import { StatsCard } from '@/components/features/dashboard';
import {
  useGetProjectStatsQuery,
  useGetProjectRecentRunsQuery,
} from '@/store/api/dashboardApi';
import type { Project } from '@/types';

interface ProjectContextType {
  project: Project;
}

/**
 * Loading skeleton for overview page.
 */
const OverviewSkeleton: FC = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

/**
 * Project overview page with stats and quick actions.
 */
export const ProjectOverviewPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const context = useOutletContext<ProjectContextType>();
  const project = context?.project;

  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useGetProjectStatsQuery(projectId!, { skip: !projectId });

  const {
    data: recentRuns,
    isLoading: isLoadingRuns,
  } = useGetProjectRecentRunsQuery(projectId!, { skip: !projectId });

  const isLoading = isLoadingStats || isLoadingRuns;

  const activeRuns = useMemo(
    () => stats?.testRuns.inProgress ?? 0,
    [stats]
  );

  if (!project || isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<FileText />}
          label="Test Cases"
          value={stats?.testCases.total ?? 0}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          icon={<PlayCircle />}
          label="Test Runs"
          value={stats?.testRuns.total ?? 0}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          icon={<TrendingUp />}
          label="Pass Rate"
          value={`${Math.round(stats?.passRate.current ?? 0)}%`}
          trend={stats?.passRate.trend}
          trendLabel="vs last week"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          icon={<Clock />}
          label="Active Runs"
          value={activeRuns}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={`/projects/${projectId}/test-cases/new`}>
              <Button variant="outline" className="w-full justify-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                  <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Create Test Case</p>
                  <p className="text-xs text-muted-foreground">
                    Add a new test case to this project
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link to={`/projects/${projectId}/test-runs/new`}>
              <Button variant="outline" className="w-full justify-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/30">
                  <PlayCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Start Test Run</p>
                  <p className="text-xs text-muted-foreground">
                    Execute tests and record results
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link to={`/projects/${projectId}/team`}>
              <Button variant="outline" className="w-full justify-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Manage Team</p>
                  <p className="text-xs text-muted-foreground">
                    Add or remove team members
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Test Runs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Test Runs</CardTitle>
            <Link to={`/projects/${projectId}/test-runs`}>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(!recentRuns || recentRuns.length === 0) ? (
                <div className="py-8 text-center text-muted-foreground">
                  No test runs yet. Start a test run to see results here.
                </div>
              ) : (
                recentRuns.slice(0, 3).map((run) => (
                  <Link
                    key={run.id}
                    to={`/projects/${projectId}/test-runs/${run.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {run.name}
                      </p>
                      <Badge
                        variant={run.status === 'completed' ? 'passed' : 'blocked'}
                        className="mt-1"
                      >
                        {run.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        run.passRate >= 80
                          ? 'success'
                          : run.passRate >= 50
                            ? 'warning'
                            : 'destructive'
                      }
                    >
                      {Math.round(run.passRate)}%
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
