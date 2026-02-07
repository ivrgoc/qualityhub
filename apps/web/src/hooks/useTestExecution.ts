import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  useGetTestRunQuery,
  useGetTestResultsQuery,
  useAddTestResultMutation,
  useCloseTestRunMutation,
  type TestRunWithStats,
} from '@/store/api/testRunsApi';
import type { TestResult, TestStatus, TestCase } from '@/types';

/**
 * Test case with result for execution.
 */
export interface ExecutionTestCase {
  testCase: TestCase;
  result?: TestResult;
}

/**
 * Options for the useTestExecution hook.
 */
export interface UseTestExecutionOptions {
  projectId: string;
  runId: string;
  testCases: TestCase[];
}

/**
 * Return type of the useTestExecution hook.
 */
export interface UseTestExecutionResult {
  // Run data
  run: TestRunWithStats | null;
  results: TestResult[];

  // Current test
  currentIndex: number;
  currentTestCase: TestCase | null;
  currentResult: TestResult | undefined;

  // Navigation
  hasNext: boolean;
  hasPrevious: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  goToFirstUntested: () => void;

  // Result submission
  submitResult: (status: TestStatus, comment?: string, elapsedSeconds?: number) => Promise<void>;
  isSubmitting: boolean;

  // Run completion
  closeRun: () => Promise<void>;
  isClosing: boolean;

  // Progress
  progress: {
    total: number;
    completed: number;
    remaining: number;
    passRate: number;
  };

  // Loading & error states
  isLoading: boolean;
  error: string | null;
}

/**
 * Keyboard shortcut mapping for test statuses.
 */
export const STATUS_SHORTCUTS: Record<string, TestStatus> = {
  p: 'passed',
  f: 'failed',
  b: 'blocked',
  s: 'skipped',
  r: 'retest',
};

/**
 * Custom hook for managing test execution workflow.
 * Handles navigation, keyboard shortcuts, and result submission.
 */
export function useTestExecution({
  projectId,
  runId,
  testCases,
}: UseTestExecutionOptions): UseTestExecutionResult {
  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);

  // RTK Query hooks
  const {
    data: run,
    isLoading: isLoadingRun,
    error: runError,
  } = useGetTestRunQuery(
    { projectId, id: runId },
    { skip: !projectId || !runId }
  );

  const {
    data: resultsData,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useGetTestResultsQuery(
    { projectId, runId, pageSize: 500 },
    { skip: !projectId || !runId }
  );

  const [addResultMutation, { isLoading: isSubmitting }] = useAddTestResultMutation();
  const [closeRunMutation, { isLoading: isClosing }] = useCloseTestRunMutation();

  // Derived data
  const results = resultsData?.items ?? [];
  const currentTestCase = testCases[currentIndex] ?? null;

  // Find current result for the current test case
  const currentResult = useMemo(
    () => results.find((r) => r.caseId === currentTestCase?.id),
    [results, currentTestCase]
  );

  // Build results map for quick lookup
  const resultsMap = useMemo(() => {
    const map = new Map<string, TestResult>();
    results.forEach((r) => map.set(r.caseId, r));
    return map;
  }, [results]);

  // Progress calculation
  const progress = useMemo(() => {
    const total = testCases.length;
    const completed = results.filter((r) => r.status !== 'untested').length;
    const passed = results.filter((r) => r.status === 'passed').length;
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

    return {
      total,
      completed,
      remaining: total - completed,
      passRate,
    };
  }, [testCases.length, results]);

  // Navigation helpers
  const hasNext = currentIndex < testCases.length - 1;
  const hasPrevious = currentIndex > 0;

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasNext]);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [hasPrevious]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < testCases.length) {
        setCurrentIndex(index);
      }
    },
    [testCases.length]
  );

  const goToFirstUntested = useCallback(() => {
    const untestedIndex = testCases.findIndex((tc) => {
      const result = resultsMap.get(tc.id);
      return !result || result.status === 'untested';
    });
    if (untestedIndex !== -1) {
      setCurrentIndex(untestedIndex);
    }
  }, [testCases, resultsMap]);

  // Result submission
  const submitResult = useCallback(
    async (status: TestStatus, comment?: string, elapsedSeconds?: number) => {
      if (!currentTestCase) return;

      await addResultMutation({
        projectId,
        runId,
        caseId: currentTestCase.id,
        status,
        comment,
        elapsedSeconds,
      }).unwrap();

      // Auto-advance to next test after submission
      if (hasNext) {
        goToNext();
      }
    },
    [currentTestCase, addResultMutation, projectId, runId, hasNext, goToNext]
  );

  // Close run
  const closeRun = useCallback(async () => {
    await closeRunMutation({ projectId, id: runId }).unwrap();
  }, [closeRunMutation, projectId, runId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Navigation
      if (e.key === 'ArrowRight' || e.key === 'j') {
        e.preventDefault();
        goToNext();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'k') {
        e.preventDefault();
        goToPrevious();
        return;
      }

      // Status shortcuts
      const status = STATUS_SHORTCUTS[e.key.toLowerCase()];
      if (status && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        submitResult(status);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, submitResult]);

  // Error handling
  const error = useMemo(() => {
    const err = runError || resultsError;
    if (!err) return null;
    if ('status' in err) {
      const fetchError = err as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [runError, resultsError]);

  return {
    // Run data
    run: run ?? null,
    results,

    // Current test
    currentIndex,
    currentTestCase,
    currentResult,

    // Navigation
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
    goToFirstUntested,

    // Result submission
    submitResult,
    isSubmitting,

    // Run completion
    closeRun,
    isClosing,

    // Progress
    progress,

    // Loading & error states
    isLoading: isLoadingRun || isLoadingResults,
    error,
  };
}
