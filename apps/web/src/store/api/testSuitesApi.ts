import { baseApi, createListTag, createTag } from './baseApi';

/**
 * Test suite entity.
 */
export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Section entity with optional children for tree structure.
 */
export interface Section {
  id: string;
  suiteId: string;
  name: string;
  description?: string;
  parentId?: string;
  position: number;
  children?: Section[];
  testCaseCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for creating a test suite.
 */
export interface CreateTestSuiteRequest {
  projectId: string;
  name: string;
  description?: string;
}

/**
 * Request payload for updating a test suite.
 */
export interface UpdateTestSuiteRequest {
  name?: string;
  description?: string;
}

/**
 * Request payload for creating a section.
 */
export interface CreateSectionRequest {
  projectId: string;
  suiteId: string;
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Request payload for updating a section.
 */
export interface UpdateSectionRequest {
  name?: string;
  description?: string;
  parentId?: string;
  position?: number;
}

/**
 * Test Suites API slice.
 * Provides endpoints for managing test suites and sections.
 */
export const testSuitesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all test suites for a project.
     */
    getTestSuites: builder.query<TestSuite[], string>({
      query: (projectId) => `/projects/${projectId}/suites`,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => createTag('TestSuite', id)),
              createListTag('TestSuite'),
              createTag('Project', projectId),
            ]
          : [createListTag('TestSuite')],
    }),

    /**
     * Get a single test suite by ID.
     */
    getTestSuite: builder.query<TestSuite, { projectId: string; suiteId: string }>({
      query: ({ projectId, suiteId }) => `/projects/${projectId}/suites/${suiteId}`,
      providesTags: (_result, _error, { suiteId }) => [createTag('TestSuite', suiteId)],
    }),

    /**
     * Create a new test suite.
     */
    createTestSuite: builder.mutation<TestSuite, CreateTestSuiteRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/suites`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('TestSuite'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update an existing test suite.
     */
    updateTestSuite: builder.mutation<
      TestSuite,
      { projectId: string; suiteId: string } & UpdateTestSuiteRequest
    >({
      query: ({ projectId, suiteId, ...body }) => ({
        url: `/projects/${projectId}/suites/${suiteId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { suiteId }) => [
        createTag('TestSuite', suiteId),
        createListTag('TestSuite'),
      ],
    }),

    /**
     * Delete a test suite.
     */
    deleteTestSuite: builder.mutation<void, { projectId: string; suiteId: string }>({
      query: ({ projectId, suiteId }) => ({
        url: `/projects/${projectId}/suites/${suiteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { suiteId, projectId }) => [
        createTag('TestSuite', suiteId),
        createListTag('TestSuite'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get sections for a test suite as a tree structure.
     */
    getSections: builder.query<Section[], { projectId: string; suiteId: string }>({
      query: ({ projectId, suiteId }) => `/projects/${projectId}/suites/${suiteId}/sections`,
      providesTags: (result, _error, { suiteId }) =>
        result
          ? [
              ...result.map(({ id }) => createTag('Section', id)),
              createListTag('Section'),
              createTag('TestSuite', suiteId),
            ]
          : [createListTag('Section')],
    }),

    /**
     * Get a single section by ID.
     */
    getSection: builder.query<Section, { projectId: string; suiteId: string; sectionId: string }>({
      query: ({ projectId, suiteId, sectionId }) =>
        `/projects/${projectId}/suites/${suiteId}/sections/${sectionId}`,
      providesTags: (_result, _error, { sectionId }) => [createTag('Section', sectionId)],
    }),

    /**
     * Create a new section.
     */
    createSection: builder.mutation<Section, CreateSectionRequest>({
      query: ({ projectId, suiteId, ...body }) => ({
        url: `/projects/${projectId}/suites/${suiteId}/sections`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { suiteId }) => [
        createListTag('Section'),
        createTag('TestSuite', suiteId),
      ],
    }),

    /**
     * Update an existing section.
     */
    updateSection: builder.mutation<
      Section,
      { projectId: string; suiteId: string; sectionId: string } & UpdateSectionRequest
    >({
      query: ({ projectId, suiteId, sectionId, ...body }) => ({
        url: `/projects/${projectId}/suites/${suiteId}/sections/${sectionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { sectionId, suiteId }) => [
        createTag('Section', sectionId),
        createListTag('Section'),
        createTag('TestSuite', suiteId),
      ],
    }),

    /**
     * Delete a section.
     */
    deleteSection: builder.mutation<void, { projectId: string; suiteId: string; sectionId: string }>(
      {
        query: ({ projectId, suiteId, sectionId }) => ({
          url: `/projects/${projectId}/suites/${suiteId}/sections/${sectionId}`,
          method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, { sectionId, suiteId }) => [
          createTag('Section', sectionId),
          createListTag('Section'),
          createTag('TestSuite', suiteId),
        ],
      }
    ),

    /**
     * Move a section to a new parent or position.
     */
    moveSection: builder.mutation<
      Section,
      {
        projectId: string;
        suiteId: string;
        sectionId: string;
        parentId?: string;
        position: number;
      }
    >({
      query: ({ projectId, suiteId, sectionId, ...body }) => ({
        url: `/projects/${projectId}/suites/${suiteId}/sections/${sectionId}/move`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { suiteId }) => [
        createListTag('Section'),
        createTag('TestSuite', suiteId),
      ],
    }),
  }),
});

export const {
  useGetTestSuitesQuery,
  useLazyGetTestSuitesQuery,
  useGetTestSuiteQuery,
  useLazyGetTestSuiteQuery,
  useCreateTestSuiteMutation,
  useUpdateTestSuiteMutation,
  useDeleteTestSuiteMutation,
  useGetSectionsQuery,
  useLazyGetSectionsQuery,
  useGetSectionQuery,
  useLazyGetSectionQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useMoveSectionMutation,
} = testSuitesApi;
