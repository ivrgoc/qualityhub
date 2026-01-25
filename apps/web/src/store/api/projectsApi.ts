import { baseApi } from './baseApi';
import type { Project, PaginatedResponse } from '@/types';

interface GetProjectsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
}

interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
}

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<PaginatedResponse<Project>, GetProjectsParams>({
      query: (params) => ({
        url: '/projects',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'Project' as const,
                id,
              })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation<Project, UpdateProjectRequest>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
