import { baseApi, createListTag, createTag } from './baseApi';
import type { TestRun, TestResult, TestStatus, PaginatedResponse } from '@/types';

/**
 * Parameters for fetching a paginated list of test runs.
 */
export interface GetTestRunsParams {
  projectId: string;
  planId?: string;
  suiteId?: string;
  assigneeId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Request payload for creating a new test run.
 */
export interface CreateTestRunRequest {
  projectId: string;
  name: string;
  description?: string;
  planId?: string;
  suiteId?: string;
  assigneeId?: string;
  caseIds?: string[];
}

/**
 * Request payload for updating an existing test run.
 */
export interface UpdateTestRunRequest {
  name?: string;
  description?: string;
  assigneeId?: string;
}

/**
 * Request payload for closing/completing a test run.
 */
export interface CloseTestRunRequest {
  projectId: string;
  id: string;
}

/**
 * Parameters for fetching test results for a run.
 */
export interface GetTestResultsParams {
  projectId: string;
  runId: string;
  status?: TestStatus;
  page?: number;
  pageSize?: number;
}

/**
 * Request payload for adding a test result.
 */
export interface AddTestResultRequest {
  projectId: string;
  runId: string;
  caseId: string;
  status: TestStatus;
  comment?: string;
  elapsedSeconds?: number;
  defects?: string[];
}

/**
 * Request payload for bulk adding test results.
 */
export interface BulkAddTestResultsRequest {
  projectId: string;
  runId: string;
  results: Array<Omit<AddTestResultRequest, 'projectId' | 'runId'>>;
}

/**
 * Response for bulk add results operation.
 */
export interface BulkAddTestResultsResponse {
  created: TestResult[];
  failed: Array<{
    caseId: string;
    error: string;
  }>;
}

/**
 * Test run statistics summary.
 */
export interface TestRunStats {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  retest: number;
  skipped: number;
  untested: number;
}

/**
 * Extended test run with statistics.
 */
export interface TestRunWithStats extends TestRun {
  stats: TestRunStats;
}

/**
 * Test Runs API slice with CRUD and results endpoints.
 * Provides endpoints for listing, creating, reading, updating, deleting test runs,
 * as well as managing test results within runs.
 */
export const testRunsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get a paginated list of test runs for a project.
     * Supports pagination, search, and filtering by plan, suite, and assignee.
     */
    getTestRuns: builder.query<PaginatedResponse<TestRunWithStats>, GetTestRunsParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/runs`,
        params,
      }),
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.items.map(({ id }) => createTag('TestRun', id)),
              createListTag('TestRun'),
              createTag('Project', projectId),
            ]
          : [createListTag('TestRun')],
    }),

    /**
     * Get a single test run by ID with statistics.
     */
    getTestRun: builder.query<TestRunWithStats, { projectId: string; id: string }>({
      query: ({ projectId, id }) => `/projects/${projectId}/runs/${id}`,
      providesTags: (_result, _error, { id }) => [createTag('TestRun', id)],
    }),

    /**
     * Create a new test run.
     * Optionally include case IDs to add test cases to the run.
     * Invalidates the test run list cache.
     */
    createTestRun: builder.mutation<TestRun, CreateTestRunRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/runs`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('TestRun'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update an existing test run.
     * Invalidates both the specific test run and the list cache.
     */
    updateTestRun: builder.mutation<
      TestRun,
      { projectId: string; id: string } & UpdateTestRunRequest
    >({
      query: ({ projectId, id, ...body }) => ({
        url: `/projects/${projectId}/runs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('TestRun', id),
        createListTag('TestRun'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Delete a test run by ID (soft delete).
     * Invalidates both the specific test run and the list cache.
     */
    deleteTestRun: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/runs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('TestRun', id),
        createListTag('TestRun'),
        createListTag('TestResult'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Close/complete a test run.
     * Sets the completedAt timestamp.
     */
    closeTestRun: builder.mutation<TestRun, CloseTestRunRequest>({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/runs/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('TestRun', id),
        createListTag('TestRun'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get test results for a specific test run.
     * Supports pagination and filtering by status.
     */
    getTestResults: builder.query<PaginatedResponse<TestResult>, GetTestResultsParams>({
      query: ({ projectId, runId, ...params }) => ({
        url: `/projects/${projectId}/runs/${runId}/results`,
        params,
      }),
      providesTags: (result, _error, { runId }) =>
        result
          ? [
              ...result.items.map(({ id }) => createTag('TestResult', id)),
              createListTag('TestResult'),
              createTag('TestRun', runId),
            ]
          : [createListTag('TestResult')],
    }),

    /**
     * Add a single test result to a test run.
     * Invalidates the test run (to update stats) and test result caches.
     * Uses optimistic updates for immediate UI feedback.
     */
    addTestResult: builder.mutation<TestResult, AddTestResultRequest>({
      query: ({ projectId, runId, ...body }) => ({
        url: `/projects/${projectId}/runs/${runId}/results`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { runId, projectId }) => [
        createTag('TestRun', runId),
        createListTag('TestResult'),
        createTag('Project', projectId),
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ projectId, runId, caseId, status }, { dispatch, queryFulfilled }) {
        // Optimistically update the test run stats
        const patchResult = dispatch(
          testRunsApi.util.updateQueryData('getTestRun', { projectId, id: runId }, (draft) => {
            if (draft.stats) {
              // Decrement untested count and increment the new status count
              draft.stats.untested = Math.max(0, draft.stats.untested - 1);
              switch (status) {
                case 'passed':
                  draft.stats.passed += 1;
                  break;
                case 'failed':
                  draft.stats.failed += 1;
                  break;
                case 'blocked':
                  draft.stats.blocked += 1;
                  break;
                case 'skipped':
                  draft.stats.skipped += 1;
                  break;
                case 'retest':
                  draft.stats.retest += 1;
                  break;
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
    }),

    /**
     * Bulk add multiple test results to a test run.
     * Returns information about successfully created results and any failures.
     */
    bulkAddTestResults: builder.mutation<BulkAddTestResultsResponse, BulkAddTestResultsRequest>({
      query: ({ projectId, runId, results }) => ({
        url: `/projects/${projectId}/runs/${runId}/results/bulk`,
        method: 'POST',
        body: { results },
      }),
      invalidatesTags: (_result, _error, { runId, projectId }) => [
        createTag('TestRun', runId),
        createListTag('TestResult'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get a single test result by ID.
     */
    getTestResult: builder.query<
      TestResult,
      { projectId: string; runId: string; resultId: string }
    >({
      query: ({ projectId, runId, resultId }) =>
        `/projects/${projectId}/runs/${runId}/results/${resultId}`,
      providesTags: (_result, _error, { resultId }) => [createTag('TestResult', resultId)],
    }),

    /**
     * Update an existing test result.
     * Uses optimistic updates for immediate UI feedback when changing status.
     */
    updateTestResult: builder.mutation<
      TestResult,
      {
        projectId: string;
        runId: string;
        resultId: string;
        previousStatus?: TestStatus;
        status?: TestStatus;
        comment?: string;
        elapsedSeconds?: number;
        defects?: string[];
      }
    >({
      query: ({ projectId, runId, resultId, previousStatus: _prev, ...body }) => ({
        url: `/projects/${projectId}/runs/${runId}/results/${resultId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { runId, resultId, projectId }) => [
        createTag('TestResult', resultId),
        createTag('TestRun', runId),
        createListTag('TestResult'),
        createTag('Project', projectId),
      ],
      // Optimistic update for status changes
      async onQueryStarted(
        { projectId, runId, resultId, status, previousStatus },
        { dispatch, queryFulfilled }
      ) {
        // Only do optimistic update if status is changing
        if (!status || !previousStatus || status === previousStatus) {
          return;
        }

        // Helper to update stats
        const updateStatForStatus = (
          stats: TestRunStats,
          testStatus: TestStatus,
          delta: number
        ) => {
          switch (testStatus) {
            case 'passed':
              stats.passed = Math.max(0, stats.passed + delta);
              break;
            case 'failed':
              stats.failed = Math.max(0, stats.failed + delta);
              break;
            case 'blocked':
              stats.blocked = Math.max(0, stats.blocked + delta);
              break;
            case 'skipped':
              stats.skipped = Math.max(0, stats.skipped + delta);
              break;
            case 'retest':
              stats.retest = Math.max(0, stats.retest + delta);
              break;
            case 'untested':
              stats.untested = Math.max(0, stats.untested + delta);
              break;
          }
        };

        // Optimistically update the test run stats
        const runPatch = dispatch(
          testRunsApi.util.updateQueryData('getTestRun', { projectId, id: runId }, (draft) => {
            if (draft.stats) {
              updateStatForStatus(draft.stats, previousStatus, -1);
              updateStatForStatus(draft.stats, status, 1);
            }
          })
        );

        // Optimistically update the test result
        const resultPatch = dispatch(
          testRunsApi.util.updateQueryData(
            'getTestResult',
            { projectId, runId, resultId },
            (draft) => {
              draft.status = status;
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic updates on error
          runPatch.undo();
          resultPatch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetTestRunsQuery,
  useLazyGetTestRunsQuery,
  useGetTestRunQuery,
  useLazyGetTestRunQuery,
  useCreateTestRunMutation,
  useUpdateTestRunMutation,
  useDeleteTestRunMutation,
  useCloseTestRunMutation,
  useGetTestResultsQuery,
  useLazyGetTestResultsQuery,
  useGetTestResultQuery,
  useLazyGetTestResultQuery,
  useAddTestResultMutation,
  useBulkAddTestResultsMutation,
  useUpdateTestResultMutation,
} = testRunsApi;
