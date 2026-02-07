import { baseApi, createListTag, createTag } from './baseApi';

/**
 * Milestone entity.
 */
export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate?: string;
  startDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Milestone with progress statistics.
 */
export interface MilestoneWithStats extends Milestone {
  stats: {
    totalRuns: number;
    completedRuns: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
}

/**
 * Test plan entity.
 */
export interface TestPlan {
  id: string;
  projectId: string;
  milestoneId?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Test plan entry (links a test case to a plan).
 */
export interface TestPlanEntry {
  id: string;
  planId: string;
  testCaseId: string;
  position: number;
}

/**
 * Test plan with entries and stats.
 */
export interface TestPlanWithStats extends TestPlan {
  entries: TestPlanEntry[];
  stats: {
    totalCases: number;
  };
}

/**
 * Request payload for creating a milestone.
 */
export interface CreateMilestoneRequest {
  projectId: string;
  name: string;
  description?: string;
  dueDate?: string;
  startDate?: string;
}

/**
 * Request payload for updating a milestone.
 */
export interface UpdateMilestoneRequest {
  name?: string;
  description?: string;
  dueDate?: string;
  startDate?: string;
  isCompleted?: boolean;
}

/**
 * Request payload for creating a test plan.
 */
export interface CreateTestPlanRequest {
  projectId: string;
  milestoneId?: string;
  name: string;
  description?: string;
}

/**
 * Request payload for updating a test plan.
 */
export interface UpdateTestPlanRequest {
  milestoneId?: string;
  name?: string;
  description?: string;
}

/**
 * Milestones API slice.
 */
export const milestonesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all milestones for a project.
     */
    getMilestones: builder.query<MilestoneWithStats[], string>({
      query: (projectId) => `/projects/${projectId}/milestones`,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => createTag('Milestone', id)),
              createListTag('Milestone'),
              createTag('Project', projectId),
            ]
          : [createListTag('Milestone')],
    }),

    /**
     * Get a single milestone by ID.
     */
    getMilestone: builder.query<MilestoneWithStats, { projectId: string; id: string }>({
      query: ({ projectId, id }) => `/projects/${projectId}/milestones/${id}`,
      providesTags: (_result, _error, { id }) => [createTag('Milestone', id)],
    }),

    /**
     * Create a new milestone.
     */
    createMilestone: builder.mutation<Milestone, CreateMilestoneRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/milestones`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('Milestone'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update a milestone.
     */
    updateMilestone: builder.mutation<
      Milestone,
      { projectId: string; id: string } & UpdateMilestoneRequest
    >({
      query: ({ projectId, id, ...body }) => ({
        url: `/projects/${projectId}/milestones/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        createTag('Milestone', id),
        createListTag('Milestone'),
      ],
    }),

    /**
     * Delete a milestone.
     */
    deleteMilestone: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/milestones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('Milestone', id),
        createListTag('Milestone'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get all test plans for a project.
     */
    getTestPlans: builder.query<TestPlanWithStats[], { projectId: string; milestoneId?: string }>({
      query: ({ projectId, milestoneId }) => ({
        url: `/projects/${projectId}/plans`,
        params: milestoneId ? { milestoneId } : undefined,
      }),
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.map(({ id }) => createTag('TestPlan', id)),
              createListTag('TestPlan'),
              createTag('Project', projectId),
            ]
          : [createListTag('TestPlan')],
    }),

    /**
     * Get a single test plan by ID.
     */
    getTestPlan: builder.query<TestPlanWithStats, { projectId: string; id: string }>({
      query: ({ projectId, id }) => `/projects/${projectId}/plans/${id}`,
      providesTags: (_result, _error, { id }) => [createTag('TestPlan', id)],
    }),

    /**
     * Create a new test plan.
     */
    createTestPlan: builder.mutation<TestPlan, CreateTestPlanRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/plans`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('TestPlan'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update a test plan.
     */
    updateTestPlan: builder.mutation<
      TestPlan,
      { projectId: string; id: string } & UpdateTestPlanRequest
    >({
      query: ({ projectId, id, ...body }) => ({
        url: `/projects/${projectId}/plans/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        createTag('TestPlan', id),
        createListTag('TestPlan'),
      ],
    }),

    /**
     * Delete a test plan.
     */
    deleteTestPlan: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('TestPlan', id),
        createListTag('TestPlan'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Add test cases to a test plan.
     */
    addPlanEntries: builder.mutation<
      TestPlanEntry[],
      { projectId: string; planId: string; testCaseIds: string[] }
    >({
      query: ({ projectId, planId, testCaseIds }) => ({
        url: `/projects/${projectId}/plans/${planId}/entries`,
        method: 'POST',
        body: { testCaseIds },
      }),
      invalidatesTags: (_result, _error, { planId }) => [
        createTag('TestPlan', planId),
      ],
    }),

    /**
     * Remove test cases from a test plan.
     */
    removePlanEntries: builder.mutation<
      void,
      { projectId: string; planId: string; entryIds: string[] }
    >({
      query: ({ projectId, planId, entryIds }) => ({
        url: `/projects/${projectId}/plans/${planId}/entries`,
        method: 'DELETE',
        body: { entryIds },
      }),
      invalidatesTags: (_result, _error, { planId }) => [
        createTag('TestPlan', planId),
      ],
    }),
  }),
});

export const {
  useGetMilestonesQuery,
  useLazyGetMilestonesQuery,
  useGetMilestoneQuery,
  useLazyGetMilestoneQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useGetTestPlansQuery,
  useLazyGetTestPlansQuery,
  useGetTestPlanQuery,
  useLazyGetTestPlanQuery,
  useCreateTestPlanMutation,
  useUpdateTestPlanMutation,
  useDeleteTestPlanMutation,
  useAddPlanEntriesMutation,
  useRemovePlanEntriesMutation,
} = milestonesApi;
