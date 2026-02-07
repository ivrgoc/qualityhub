import { type FC, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Button,
  Alert,
  AlertDescription,
  Skeleton,
  ConfirmDialog,
} from '@/components/ui';
import {
  RunProgress,
  ExecutionTestList,
  ExecutionTestDetail,
  ExecutionResultForm,
} from '@/components/features/test-runs';
import { useTestExecution } from '@/hooks';
import { useGetTestCasesQuery } from '@/store/api/testCasesApi';
import { useToast } from '@/hooks/useToast';
import type { TestStatus } from '@/types';

/**
 * Test Execution page with three-pane layout.
 * Left: Test list with status filter
 * Center: Test case details
 * Right: Result form
 */
export const TestExecutionPage: FC = () => {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Fetch test cases for the project
  const { data: testCasesData, isLoading: isLoadingTestCases } = useGetTestCasesQuery(
    { projectId: projectId!, pageSize: 500 },
    { skip: !projectId }
  );

  const testCases = testCasesData?.items ?? [];

  // Test execution hook
  const {
    run,
    results,
    currentIndex,
    currentTestCase,
    currentResult,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
    goToFirstUntested,
    submitResult,
    isSubmitting,
    closeRun,
    isClosing,
    progress,
    isLoading,
    error,
  } = useTestExecution({
    projectId: projectId!,
    runId: runId!,
    testCases,
  });

  // Build results map for the test list
  const resultsMap = useMemo(() => {
    const map = new Map<string, typeof results[0]>();
    results.forEach((r) => map.set(r.caseId, r));
    return map;
  }, [results]);

  // Handler for submitting result
  const handleSubmitResult = useCallback(
    async (status: TestStatus, comment?: string, elapsedSeconds?: number) => {
      try {
        await submitResult(status, comment, elapsedSeconds);
        toast({
          title: 'Result saved',
          description: `Test marked as ${status}`,
          variant: 'success',
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to save result',
          variant: 'error',
        });
      }
    },
    [submitResult, toast]
  );

  // Handler for closing run
  const handleCloseRun = useCallback(async () => {
    try {
      await closeRun();
      toast({ title: 'Test run closed', variant: 'success' });
      navigate(`/projects/${projectId}/runs/${runId}`);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to close run',
        variant: 'error',
      });
    }
  }, [closeRun, toast, navigate, projectId, runId]);

  const allLoading = isLoading || isLoadingTestCases;

  if (allLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <Skeleton className="w-64 h-full" />
        <Skeleton className="flex-1 h-full" />
        <Skeleton className="w-80 h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertDescription>{error}</AlertDescription>
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to={`/projects/${projectId}/runs/${runId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="font-semibold">{run.name}</h1>
            <p className="text-sm text-muted-foreground">
              {progress.completed} of {progress.total} completed ({progress.passRate}% pass rate)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="w-48">
            <RunProgress stats={run.stats} size="sm" />
          </div>
          <Button
            variant="outline"
            onClick={goToFirstUntested}
            disabled={progress.remaining === 0}
          >
            Jump to Untested
          </Button>
          <Button
            onClick={() => setShowCloseConfirm(true)}
            disabled={isClosing}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Close Run
          </Button>
        </div>
      </div>

      {/* Three-pane layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Test list */}
        <div className="w-64 shrink-0 border-r overflow-hidden">
          <ExecutionTestList
            testCases={testCases}
            results={resultsMap}
            currentIndex={currentIndex}
            statusFilter={statusFilter}
            onSelectTest={goToIndex}
            onStatusFilterChange={setStatusFilter}
            className="h-full"
          />
        </div>

        {/* Center: Test details */}
        <div className="flex-1 min-w-0 border-r overflow-hidden">
          <ExecutionTestDetail
            testCase={currentTestCase}
            testNumber={currentIndex + 1}
            totalTests={testCases.length}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onNext={goToNext}
            onPrevious={goToPrevious}
            className="h-full"
          />
        </div>

        {/* Right: Result form */}
        <div className="w-80 shrink-0 overflow-auto p-4">
          <h2 className="text-lg font-semibold mb-4">Record Result</h2>
          {currentTestCase ? (
            <ExecutionResultForm
              existingResult={currentResult}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitResult}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Select a test case to record its result.
            </p>
          )}
        </div>
      </div>

      {/* Close run confirmation */}
      <ConfirmDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title="Close Test Run"
        description={`Are you sure you want to close this test run? You have ${progress.remaining} untested tests remaining.`}
        confirmLabel="Close Run"
        onConfirm={handleCloseRun}
        isLoading={isClosing}
      />
    </div>
  );
};
