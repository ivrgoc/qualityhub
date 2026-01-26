import { baseApi, createListTag, createTag } from './baseApi';
import type { Project, PaginatedResponse } from '@/types';

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
        result
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
} = projectsApi;
