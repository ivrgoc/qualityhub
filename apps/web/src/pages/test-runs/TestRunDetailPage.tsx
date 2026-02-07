import { type FC, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Calendar,
  User,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate, formatRelativeTime } from '@/utils/date';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Alert,
  AlertDescription,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { RunProgress } from '@/components/features/test-runs';
import { useGetTestRunQuery, useGetTestResultsQuery } from '@/store/api/testRunsApi';
import type { TestStatus } from '@/types';

/**
 * Get status badge variant.
 */
function getStatusVariant(status: TestStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'passed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'blocked':
    case 'retest':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Test Run detail page showing progress stats and results table.
 */
export const TestRunDetailPage: FC = () => {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>();

  // Queries
  const {
    data: run,
    isLoading: isLoadingRun,
    error: runError,
  } = useGetTestRunQuery(
    { projectId: projectId!, id: runId! },
    { skip: !projectId || !runId }
  );

  const {
    data: resultsData,
    isLoading: isLoadingResults,
  } = useGetTestResultsQuery(
    { projectId: projectId!, runId: runId!, pageSize: 100 },
    { skip: !projectId || !runId }
  );

  const isLoading = isLoadingRun || isLoadingResults;
  const results = resultsData?.items ?? [];

  // Calculate stats
  const completionRate = useMemo(() => {
    if (!run?.stats) return 0;
    const completed = run.stats.total - run.stats.untested;
    return run.stats.total > 0 ? Math.round((completed / run.stats.total) * 100) : 0;
  }, [run?.stats]);

  const passRate = useMemo(() => {
    if (!run?.stats) return 0;
    const completed = run.stats.total - run.stats.untested;
    return completed > 0 ? Math.round((run.stats.passed / completed) * 100) : 0;
  }, [run?.stats]);

  // Error handling
  const errorMessage = useMemo(() => {
    if (!runError) return null;
    if ('status' in runError) {
      const fetchError = runError as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [runError]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Alert variant="error">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (!run) {
    return (
      <Alert variant="error">
        <AlertDescription>Test run not found</AlertDescription>
      </Alert>
    );
  }

  const isCompleted = !!run.completedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/projects/${projectId}/runs`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Test Runs
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{run.name}</h1>
              <Badge variant={isCompleted ? 'secondary' : 'default'}>
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-3 w-3" />
                    In Progress
                  </>
                )}
              </Badge>
            </div>
            {run.description && (
              <p className="mt-2 text-muted-foreground">{run.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {formatRelativeTime(run.createdAt)}
              </span>
              {run.assigneeId && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Assigned
                </span>
              )}
            </div>
          </div>
          <Button asChild>
            <Link to={`/projects/${projectId}/runs/${runId}/execute`}>
              <Play className="mr-2 h-4 w-4" />
              Execute Tests
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{run.stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{run.stats.passed}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{run.stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{passRate}%</div>
            <div className="text-sm text-muted-foreground">Pass Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {completionRate}% Complete ({run.stats.total - run.stats.untested} of {run.stats.total})
            </span>
          </div>
          <RunProgress stats={run.stats} showLegend size="lg" />
        </CardContent>
      </Card>

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Executed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      TC-{result.caseId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(result.status)}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.elapsedSeconds ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {Math.round(result.elapsedSeconds / 60)}m
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(result.executedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No test results yet. Start executing tests to see results here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
