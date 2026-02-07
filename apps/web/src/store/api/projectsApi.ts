import { baseApi, createListTag, createTag } from './baseApi';
import type { Project, PaginatedResponse, User, UserRole } from '@/types';

/**
 * Parameters for fetching a paginated list of projects.
 */
export interface GetProjectsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Request payload for creating a new project.
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

/**
 * Request payload for updating an existing project.
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

/**
 * Project with additional stats for list/card display.
 */
export interface ProjectWithStats extends Project {
  stats: {
    testCases: number;
    testRuns: number;
    passRate: number;
  };
  memberCount: number;
}

/**
 * Project member.
 */
export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: UserRole;
  user: Pick<User, 'id' | 'name' | 'email'>;
  joinedAt: string;
}

/**
 * Request to add a member to a project.
 */
export interface AddProjectMemberRequest {
  projectId: string;
  email: string;
  role: UserRole;
}

/**
 * Request to update a member's role.
 */
export interface UpdateProjectMemberRequest {
  projectId: string;
  memberId: string;
  role: UserRole;
}

/**
 * Request to remove a member from a project.
 */
export interface RemoveProjectMemberRequest {
  projectId: string;
  memberId: string;
}

/**
 * Projects API slice with CRUD endpoints.
 * Provides endpoints for listing, creating, reading, updating, and deleting projects.
 */
export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get a paginated list of projects.
     * Supports pagination and search filtering.
     */
    getProjects: builder.query<PaginatedResponse<Project>, GetProjectsParams | void>({
      query: (params) => ({
        url: '/projects',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => createTag('Project', id)),
              createListTag('Project'),
            ]
          : [createListTag('Project')],
    }),

    /**
     * Get a single project by ID.
     */
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [createTag('Project', id)],
    }),

    /**
     * Create a new project.
     * Invalidates the project list cache.
     */
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: [createListTag('Project')],
    }),

    /**
     * Update an existing project.
     * Invalidates both the specific project and the list cache.
     */
    updateProject: builder.mutation<Project, { id: string } & UpdateProjectRequest>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        createTag('Project', id),
        createListTag('Project'),
      ],
    }),

    /**
     * Delete a project by ID (soft delete).
     * Invalidates both the specific project and the list cache.
     */
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        createTag('Project', id),
        createListTag('Project'),
      ],
    }),

    /**
     * Get projects with stats for list/grid display.
     */
    getProjectsWithStats: builder.query<PaginatedResponse<ProjectWithStats>, GetProjectsParams | void>({
      query: (params) => ({
        url: '/projects',
        params: { ...params, includeStats: true },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => createTag('Project', id)),
              createListTag('Project'),
            ]
          : [createListTag('Project')],
    }),

    /**
     * Get project members.
     */
    getProjectMembers: builder.query<ProjectMember[], string>({
      query: (projectId) => `/projects/${projectId}/members`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Project', id: `${projectId}-members` },
      ],
    }),

    /**
     * Add a member to a project.
     */
    addProjectMember: builder.mutation<ProjectMember, AddProjectMemberRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-members` },
        createTag('Project', projectId),
      ],
    }),

    /**
     * Update a member's role.
     */
    updateProjectMember: builder.mutation<ProjectMember, UpdateProjectMemberRequest>({
      query: ({ projectId, memberId, ...body }) => ({
        url: `/projects/${projectId}/members/${memberId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-members` },
      ],
    }),

    /**
     * Remove a member from a project.
     */
    removeProjectMember: builder.mutation<void, RemoveProjectMemberRequest>({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-members` },
        createTag('Project', projectId),
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useLazyGetProjectsQuery,
  useGetProjectQuery,
  useLazyGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsWithStatsQuery,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberMutation,
  useRemoveProjectMemberMutation,
} = projectsApi;
