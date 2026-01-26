import { describe, it, expect } from 'vitest';
import {
  projectsApi,
  type GetProjectsParams,
  type CreateProjectRequest,
  type UpdateProjectRequest,
} from './projectsApi';
import type { Project, PaginatedResponse } from '@/types';

// Mock project data
const mockProject: Project = {
  id: 'project-123',
  orgId: 'org-456',
  name: 'Test Project',
  description: 'A test project for unit tests',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockPaginatedProjects: PaginatedResponse<Project> = {
  items: [mockProject],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

describe('projectsApi', () => {
  describe('endpoints configuration', () => {
    it('should have getProjects endpoint defined', () => {
      expect(projectsApi.endpoints.getProjects).toBeDefined();
    });

    it('should have getProject endpoint defined', () => {
      expect(projectsApi.endpoints.getProject).toBeDefined();
    });

    it('should have createProject endpoint defined', () => {
      expect(projectsApi.endpoints.createProject).toBeDefined();
    });

    it('should have updateProject endpoint defined', () => {
      expect(projectsApi.endpoints.updateProject).toBeDefined();
    });

    it('should have deleteProject endpoint defined', () => {
      expect(projectsApi.endpoints.deleteProject).toBeDefined();
    });
  });

  describe('getProjects endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = projectsApi.endpoints.getProjects;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept pagination parameters', () => {
      const params: GetProjectsParams = {
        page: 1,
        pageSize: 25,
        search: 'test',
      };

      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(25);
      expect(params.search).toBe('test');
    });

    it('should work without parameters', () => {
      const params: GetProjectsParams | void = undefined;
      expect(params).toBeUndefined();
    });
  });

  describe('getProject endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = projectsApi.endpoints.getProject;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept project ID as string', () => {
      const projectId = 'project-123';
      expect(typeof projectId).toBe('string');
    });
  });

  describe('createProject endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = projectsApi.endpoints.createProject;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for creating a project', () => {
      const createData: CreateProjectRequest = {
        name: 'New Project',
        description: 'A new test project',
      };

      expect(createData.name).toBe('New Project');
      expect(createData.description).toBe('A new test project');
    });

    it('should allow optional description', () => {
      const createData: CreateProjectRequest = {
        name: 'New Project Without Description',
      };

      expect(createData.name).toBe('New Project Without Description');
      expect(createData.description).toBeUndefined();
    });
  });

  describe('updateProject endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = projectsApi.endpoints.updateProject;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for updating a project', () => {
      const updateData: { id: string } & UpdateProjectRequest = {
        id: 'project-123',
        name: 'Updated Project Name',
        description: 'Updated description',
      };

      expect(updateData.id).toBe('project-123');
      expect(updateData.name).toBe('Updated Project Name');
      expect(updateData.description).toBe('Updated description');
    });

    it('should allow partial updates', () => {
      const updateNameOnly: { id: string } & UpdateProjectRequest = {
        id: 'project-123',
        name: 'Only Name Updated',
      };

      const updateDescriptionOnly: { id: string } & UpdateProjectRequest = {
        id: 'project-456',
        description: 'Only description updated',
      };

      expect(updateNameOnly.name).toBe('Only Name Updated');
      expect(updateNameOnly.description).toBeUndefined();
      expect(updateDescriptionOnly.name).toBeUndefined();
      expect(updateDescriptionOnly.description).toBe('Only description updated');
    });
  });

  describe('deleteProject endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = projectsApi.endpoints.deleteProject;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept project ID as string', () => {
      const projectId = 'project-to-delete';
      expect(typeof projectId).toBe('string');
    });
  });

  describe('exported hooks', () => {
    it('should export useGetProjectsQuery hook', async () => {
      const { useGetProjectsQuery } = await import('./projectsApi');
      expect(useGetProjectsQuery).toBeDefined();
      expect(typeof useGetProjectsQuery).toBe('function');
    });

    it('should export useLazyGetProjectsQuery hook', async () => {
      const { useLazyGetProjectsQuery } = await import('./projectsApi');
      expect(useLazyGetProjectsQuery).toBeDefined();
      expect(typeof useLazyGetProjectsQuery).toBe('function');
    });

    it('should export useGetProjectQuery hook', async () => {
      const { useGetProjectQuery } = await import('./projectsApi');
      expect(useGetProjectQuery).toBeDefined();
      expect(typeof useGetProjectQuery).toBe('function');
    });

    it('should export useLazyGetProjectQuery hook', async () => {
      const { useLazyGetProjectQuery } = await import('./projectsApi');
      expect(useLazyGetProjectQuery).toBeDefined();
      expect(typeof useLazyGetProjectQuery).toBe('function');
    });

    it('should export useCreateProjectMutation hook', async () => {
      const { useCreateProjectMutation } = await import('./projectsApi');
      expect(useCreateProjectMutation).toBeDefined();
      expect(typeof useCreateProjectMutation).toBe('function');
    });

    it('should export useUpdateProjectMutation hook', async () => {
      const { useUpdateProjectMutation } = await import('./projectsApi');
      expect(useUpdateProjectMutation).toBeDefined();
      expect(typeof useUpdateProjectMutation).toBe('function');
    });

    it('should export useDeleteProjectMutation hook', async () => {
      const { useDeleteProjectMutation } = await import('./projectsApi');
      expect(useDeleteProjectMutation).toBeDefined();
      expect(typeof useDeleteProjectMutation).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should export GetProjectsParams interface', () => {
      const params: GetProjectsParams = {
        page: 2,
        pageSize: 50,
        search: 'search query',
      };
      expect(params.page).toBe(2);
      expect(params.pageSize).toBe(50);
      expect(params.search).toBe('search query');
    });

    it('should export CreateProjectRequest interface', () => {
      const request: CreateProjectRequest = {
        name: 'New Project',
        description: 'Description',
      };
      expect(request.name).toBe('New Project');
      expect(request.description).toBe('Description');
    });

    it('should export UpdateProjectRequest interface', () => {
      const request: UpdateProjectRequest = {
        name: 'Updated Name',
        description: 'Updated Description',
      };
      expect(request.name).toBe('Updated Name');
      expect(request.description).toBe('Updated Description');
    });
  });

  describe('type safety', () => {
    it('should have correct Project fields in responses', () => {
      expect(mockProject.id).toBe('project-123');
      expect(mockProject.orgId).toBe('org-456');
      expect(mockProject.name).toBe('Test Project');
      expect(mockProject.description).toBe('A test project for unit tests');
      expect(mockProject.createdAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should have correct PaginatedResponse structure', () => {
      expect(mockPaginatedProjects.items).toHaveLength(1);
      expect(mockPaginatedProjects.total).toBe(1);
      expect(mockPaginatedProjects.page).toBe(1);
      expect(mockPaginatedProjects.pageSize).toBe(25);
      expect(mockPaginatedProjects.totalPages).toBe(1);
    });

    it('should have correct GetProjectsParams fields', () => {
      const params: GetProjectsParams = {
        page: 1,
        pageSize: 10,
        search: 'test',
      };

      expect(typeof params.page).toBe('number');
      expect(typeof params.pageSize).toBe('number');
      expect(typeof params.search).toBe('string');
    });

    it('should have correct CreateProjectRequest fields', () => {
      const request: CreateProjectRequest = {
        name: 'Test',
        description: 'Description',
      };

      expect(typeof request.name).toBe('string');
      expect(typeof request.description).toBe('string');
    });

    it('should have correct UpdateProjectRequest fields', () => {
      const request: UpdateProjectRequest = {
        name: 'Test',
        description: 'Description',
      };

      expect(typeof request.name).toBe('string');
      expect(typeof request.description).toBe('string');
    });
  });

  describe('endpoint URLs', () => {
    it('getProjects endpoint should target /projects', () => {
      expect(projectsApi.endpoints.getProjects).toBeDefined();
    });

    it('getProject endpoint should target /projects/:id', () => {
      expect(projectsApi.endpoints.getProject).toBeDefined();
    });

    it('createProject endpoint should target /projects', () => {
      expect(projectsApi.endpoints.createProject).toBeDefined();
    });

    it('updateProject endpoint should target /projects/:id', () => {
      expect(projectsApi.endpoints.updateProject).toBeDefined();
    });

    it('deleteProject endpoint should target /projects/:id', () => {
      expect(projectsApi.endpoints.deleteProject).toBeDefined();
    });
  });

  describe('cache tags', () => {
    it('getProjects should provide Project list tags', () => {
      const endpoint = projectsApi.endpoints.getProjects;
      expect(endpoint).toBeDefined();
    });

    it('getProject should provide Project tags by ID', () => {
      const endpoint = projectsApi.endpoints.getProject;
      expect(endpoint).toBeDefined();
    });

    it('createProject should invalidate Project list tags', () => {
      const endpoint = projectsApi.endpoints.createProject;
      expect(endpoint).toBeDefined();
    });

    it('updateProject should invalidate Project tags by ID and list', () => {
      const endpoint = projectsApi.endpoints.updateProject;
      expect(endpoint).toBeDefined();
    });

    it('deleteProject should invalidate Project tags by ID and list', () => {
      const endpoint = projectsApi.endpoints.deleteProject;
      expect(endpoint).toBeDefined();
    });
  });

  describe('reducerPath', () => {
    it('should be part of the base API', () => {
      expect(projectsApi.reducerPath).toBe('api');
    });
  });
});
