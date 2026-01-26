import { baseApi, createListTag, createTag } from './baseApi';
import type { TestCase, TestStep, Priority, TestCaseTemplate, PaginatedResponse } from '@/types';

/**
 * Parameters for fetching a paginated list of test cases.
 */
export interface GetTestCasesParams {
  projectId: string;
  sectionId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  priority?: Priority;
  templateType?: TestCaseTemplate;
}

/**
 * Request payload for creating a new test case.
 */
export interface CreateTestCaseRequest {
  projectId: string;
  sectionId: string;
  title: string;
  templateType?: TestCaseTemplate;
  preconditions?: string;
  steps?: TestStep[];
  expectedResult?: string;
  priority?: Priority;
  estimate?: number;
}

/**
 * Request payload for updating an existing test case.
 */
export interface UpdateTestCaseRequest {
  title?: string;
  templateType?: TestCaseTemplate;
  preconditions?: string;
  steps?: TestStep[];
  expectedResult?: string;
  priority?: Priority;
  estimate?: number;
  sectionId?: string;
}

/**
 * Request payload for bulk creating test cases.
 */
export interface BulkCreateTestCasesRequest {
  projectId: string;
  testCases: Omit<CreateTestCaseRequest, 'projectId'>[];
}

/**
 * Response for bulk create operation.
 */
export interface BulkCreateTestCasesResponse {
  created: TestCase[];
  failed: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Request payload for bulk updating test cases.
 */
export interface BulkUpdateTestCasesRequest {
  projectId: string;
  updates: Array<{
    id: string;
  } & UpdateTestCaseRequest>;
}

/**
 * Response for bulk update operation.
 */
export interface BulkUpdateTestCasesResponse {
  updated: TestCase[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Request payload for bulk deleting test cases.
 */
export interface BulkDeleteTestCasesRequest {
  projectId: string;
  ids: string[];
}

/**
 * Response for bulk delete operation.
 */
export interface BulkDeleteTestCasesResponse {
  deleted: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Test case version history entry.
 */
export interface TestCaseVersion {
  id: string;
  testCaseId: string;
  version: number;
  data: TestCase;
  changedBy: string;
  createdAt: string;
}

/**
 * Test Cases API slice with CRUD and bulk endpoints.
 * Provides endpoints for listing, creating, reading, updating, deleting test cases,
 * as well as bulk operations and version history.
 */
export const testCasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get a paginated list of test cases for a project.
     * Supports pagination, search, and filtering by section, priority, and template type.
     */
    getTestCases: builder.query<PaginatedResponse<TestCase>, GetTestCasesParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/cases`,
        params,
      }),
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.items.map(({ id }) => createTag('TestCase', id)),
              createListTag('TestCase'),
              createTag('Project', projectId),
            ]
          : [createListTag('TestCase')],
    }),

    /**
     * Get a single test case by ID.
     */
    getTestCase: builder.query<TestCase, { projectId: string; id: string }>({
      query: ({ projectId, id }) => `/projects/${projectId}/cases/${id}`,
      providesTags: (_result, _error, { id }) => [createTag('TestCase', id)],
    }),

    /**
     * Get the version history for a test case.
     */
    getTestCaseHistory: builder.query<TestCaseVersion[], { projectId: string; id: string }>({
      query: ({ projectId, id }) => `/projects/${projectId}/cases/${id}/history`,
      providesTags: (_result, _error, { id }) => [
        createTag('TestCase', id),
        createTag('TestCaseVersion', id),
      ],
    }),

    /**
     * Create a new test case.
     * Invalidates the test case list cache.
     */
    createTestCase: builder.mutation<TestCase, CreateTestCaseRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/cases`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('TestCase'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update an existing test case.
     * Invalidates both the specific test case and the list cache.
     */
    updateTestCase: builder.mutation<
      TestCase,
      { projectId: string; id: string } & UpdateTestCaseRequest
    >({
      query: ({ projectId, id, ...body }) => ({
        url: `/projects/${projectId}/cases/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('TestCase', id),
        createTag('TestCaseVersion', id),
        createListTag('TestCase'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Delete a test case by ID (soft delete).
     * Invalidates both the specific test case and the list cache.
     */
    deleteTestCase: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/cases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('TestCase', id),
        createListTag('TestCase'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Bulk create multiple test cases.
     * Returns information about successfully created cases and any failures.
     */
    bulkCreateTestCases: builder.mutation<BulkCreateTestCasesResponse, BulkCreateTestCasesRequest>({
      query: ({ projectId, testCases }) => ({
        url: `/projects/${projectId}/cases/bulk`,
        method: 'POST',
        body: { testCases },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('TestCase'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Bulk update multiple test cases.
     * Returns information about successfully updated cases and any failures.
     */
    bulkUpdateTestCases: builder.mutation<BulkUpdateTestCasesResponse, BulkUpdateTestCasesRequest>({
      query: ({ projectId, updates }) => ({
        url: `/projects/${projectId}/cases/bulk`,
        method: 'PUT',
        body: { updates },
      }),
      invalidatesTags: (result, _error, { projectId }) => {
        const tags: Array<{ type: 'TestCase' | 'TestCaseVersion' | 'Project'; id: string }> = [
          createListTag('TestCase'),
          createTag('Project', projectId),
        ];
        if (result?.updated) {
          result.updated.forEach(({ id }) => {
            tags.push(createTag('TestCase', id));
            tags.push(createTag('TestCaseVersion', id));
          });
        }
        return tags;
      },
    }),

    /**
     * Bulk delete multiple test cases.
     * Returns information about successfully deleted cases and any failures.
     */
    bulkDeleteTestCases: builder.mutation<BulkDeleteTestCasesResponse, BulkDeleteTestCasesRequest>({
      query: ({ projectId, ids }) => ({
        url: `/projects/${projectId}/cases/bulk`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: (result, _error, { projectId }) => {
        const tags: Array<{ type: 'TestCase' | 'Project'; id: string }> = [
          createListTag('TestCase'),
          createTag('Project', projectId),
        ];
        if (result?.deleted) {
          result.deleted.forEach((id) => {
            tags.push(createTag('TestCase', id));
          });
        }
        return tags;
      },
    }),
  }),
});

export const {
  useGetTestCasesQuery,
  useLazyGetTestCasesQuery,
  useGetTestCaseQuery,
  useLazyGetTestCaseQuery,
  useGetTestCaseHistoryQuery,
  useLazyGetTestCaseHistoryQuery,
  useCreateTestCaseMutation,
  useUpdateTestCaseMutation,
  useDeleteTestCaseMutation,
  useBulkCreateTestCasesMutation,
  useBulkUpdateTestCasesMutation,
  useBulkDeleteTestCasesMutation,
} = testCasesApi;
