import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Progress,
  Avatar,
  Skeleton,
  Button,
} from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import type { RecentRun } from '@/store/api/dashboardApi';

export interface RecentRunsTableProps {
  /** Test runs to display */
  runs: RecentRun[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Maximum number of runs to show */
  maxRuns?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Returns the progress variant based on pass rate.
 */
function getProgressVariant(passRate: number): 'success' | 'warning' | 'error' {
  if (passRate >= 80) return 'success';
  if (passRate >= 50) return 'warning';
  return 'error';
}

/**
 * Loading skeleton for recent runs table.
 */
const RecentRunsSkeleton: FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-2 flex-1" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

/**
 * Recent test runs table component.
 */
export const RecentRunsTable: FC<RecentRunsTableProps> = ({
  runs,
  isLoading = false,
  maxRuns = 5,
  className,
}) => {
  const displayRuns = runs.slice(0, maxRuns);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Test Runs</CardTitle>
          <Link to="/test-runs">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <RecentRunsSkeleton />
        ) : displayRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No test runs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start a test run to see results here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-[180px]">Progress</TableHead>
                  <TableHead className="text-right">Pass Rate</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRuns.map((run) => {
                  const progress =
                    run.totalTests > 0
                      ? Math.round(
                          ((run.passed + run.failed + run.blocked) / run.totalTests) * 100
                        )
                      : 0;

                  return (
                    <TableRow key={run.id}>
                      {/* Name */}
                      <TableCell>
                        <Link
                          to={`/projects/${run.projectId}/runs/${run.id}`}
                          className="flex items-center gap-2 font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {run.status === 'in_progress' ? (
                            <Play className="h-4 w-4 text-blue-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          <span className="truncate">{run.name}</span>
                        </Link>
                      </TableCell>

                      {/* Project */}
                      <TableCell>
                        <Link
                          to={`/projects/${run.projectId}`}
                          className="text-muted-foreground hover:text-primary hover:underline"
                        >
                          {run.projectName}
                        </Link>
                      </TableCell>

                      {/* Progress */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={progress}
                            variant={getProgressVariant(run.passRate)}
                            size="sm"
                            className="w-full"
                          />
                          <span className="w-10 text-right text-xs text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                        <div className="mt-1 flex gap-2 text-xs">
                          <span className="text-green-600 dark:text-green-500">
                            {run.passed} passed
                          </span>
                          <span className="text-red-600 dark:text-red-500">
                            {run.failed} failed
                          </span>
                          {run.blocked > 0 && (
                            <span className="text-yellow-600 dark:text-yellow-500">
                              {run.blocked} blocked
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Pass Rate */}
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            run.passRate >= 80
                              ? 'success'
                              : run.passRate >= 50
                                ? 'warning'
                                : 'destructive'
                          }
                        >
                          {run.passRate}%
                        </Badge>
                      </TableCell>

                      {/* Assignee */}
                      <TableCell>
                        {run.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={run.assignee.name} size="sm" />
                            <span className="truncate text-sm">
                              {run.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatRelativeTime(run.completedAt || run.startedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
