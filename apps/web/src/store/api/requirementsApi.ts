import { baseApi, createListTag, createTag } from './baseApi';
import type { PaginatedResponse } from '@/types';

/**
 * Requirement status options.
 */
export type RequirementStatus = 'draft' | 'active' | 'deprecated' | 'completed';

/**
 * Requirement entity.
 */
export interface Requirement {
  id: string;
  projectId: string;
  externalId: string;
  title: string;
  description?: string;
  source?: string;
  status: RequirementStatus;
  customFields?: Record<string, unknown>;
  linkedTestCases: Array<{
    id: string;
    title: string;
    status?: string;
  }>;
  coveragePercentage: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for fetching requirements.
 */
export interface GetRequirementsParams {
  projectId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: RequirementStatus;
  hasCoverage?: boolean;
}

/**
 * Request payload for creating a requirement.
 */
export interface CreateRequirementRequest {
  projectId: string;
  externalId: string;
  title: string;
  description?: string;
  source?: string;
  status?: RequirementStatus;
  customFields?: Record<string, unknown>;
}

/**
 * Request payload for updating a requirement.
 */
export interface UpdateRequirementRequest {
  externalId?: string;
  title?: string;
  description?: string;
  source?: string;
  status?: RequirementStatus;
  customFields?: Record<string, unknown>;
}

/**
 * Request payload for linking test cases to a requirement.
 */
export interface LinkTestCasesRequest {
  projectId: string;
  requirementId: string;
  testCaseIds: string[];
}

/**
 * Request payload for unlinking test cases from a requirement.
 */
export interface UnlinkTestCasesRequest {
  projectId: string;
  requirementId: string;
  testCaseIds: string[];
}

/**
 * Traceability matrix cell data.
 */
export interface TraceabilityCell {
  requirementId: string;
  testCaseId: string;
  status?: string;
  lastExecuted?: string;
}

/**
 * Traceability matrix data.
 */
export interface TraceabilityMatrix {
  requirements: Array<{
    id: string;
    externalId: string;
    title: string;
  }>;
  testCases: Array<{
    id: string;
    title: string;
  }>;
  coverage: TraceabilityCell[];
  stats: {
    totalRequirements: number;
    coveredRequirements: number;
    coveragePercentage: number;
  };
}

/**
 * Coverage summary for a requirement.
 */
export interface RequirementCoverage {
  requirementId: string;
  totalLinkedCases: number;
  executedCases: number;
  passedCases: number;
  failedCases: number;
  coveragePercentage: number;
}

/**
 * Requirements API slice with CRUD and coverage endpoints.
 */
export const requirementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get a paginated list of requirements for a project.
     */
    getRequirements: builder.query<PaginatedResponse<Requirement>, GetRequirementsParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/requirements`,
        params,
      }),
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.items.map(({ id }) => createTag('Requirement', id)),
              createListTag('Requirement'),
              createTag('Project', projectId),
            ]
          : [createListTag('Requirement')],
    }),

    /**
     * Get a single requirement by ID.
     */
    getRequirement: builder.query<Requirement, { projectId: string; id: string }>({
      query: ({ projectId, id }) => `/projects/${projectId}/requirements/${id}`,
      providesTags: (_result, _error, { id }) => [createTag('Requirement', id)],
    }),

    /**
     * Create a new requirement.
     */
    createRequirement: builder.mutation<Requirement, CreateRequirementRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/requirements`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('Requirement'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update an existing requirement.
     */
    updateRequirement: builder.mutation<
      Requirement,
      { projectId: string; id: string } & UpdateRequirementRequest
    >({
      query: ({ projectId, id, ...body }) => ({
        url: `/projects/${projectId}/requirements/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('Requirement', id),
        createListTag('Requirement'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Delete a requirement.
     */
    deleteRequirement: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/requirements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        createTag('Requirement', id),
        createListTag('Requirement'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Link test cases to a requirement.
     */
    linkTestCases: builder.mutation<Requirement, LinkTestCasesRequest>({
      query: ({ projectId, requirementId, testCaseIds }) => ({
        url: `/projects/${projectId}/requirements/${requirementId}/link`,
        method: 'POST',
        body: { testCaseIds },
      }),
      invalidatesTags: (_result, _error, { requirementId, projectId }) => [
        createTag('Requirement', requirementId),
        createListTag('Requirement'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Unlink test cases from a requirement.
     */
    unlinkTestCases: builder.mutation<Requirement, UnlinkTestCasesRequest>({
      query: ({ projectId, requirementId, testCaseIds }) => ({
        url: `/projects/${projectId}/requirements/${requirementId}/unlink`,
        method: 'POST',
        body: { testCaseIds },
      }),
      invalidatesTags: (_result, _error, { requirementId, projectId }) => [
        createTag('Requirement', requirementId),
        createListTag('Requirement'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get coverage details for a requirement.
     */
    getRequirementCoverage: builder.query<
      RequirementCoverage,
      { projectId: string; requirementId: string }
    >({
      query: ({ projectId, requirementId }) =>
        `/projects/${projectId}/requirements/${requirementId}/coverage`,
      providesTags: (_result, _error, { requirementId }) => [
        createTag('Requirement', requirementId),
      ],
    }),

    /**
     * Get the traceability matrix for a project.
     */
    getTraceabilityMatrix: builder.query<TraceabilityMatrix, { projectId: string }>({
      query: ({ projectId }) => `/projects/${projectId}/requirements/traceability`,
      providesTags: (_result, _error, { projectId }) => [
        createListTag('Requirement'),
        createListTag('TestCase'),
        createTag('Project', projectId),
      ],
    }),
  }),
});

export const {
  useGetRequirementsQuery,
  useLazyGetRequirementsQuery,
  useGetRequirementQuery,
  useLazyGetRequirementQuery,
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
  useLinkTestCasesMutation,
  useUnlinkTestCasesMutation,
  useGetRequirementCoverageQuery,
  useGetTraceabilityMatrixQuery,
} = requirementsApi;
