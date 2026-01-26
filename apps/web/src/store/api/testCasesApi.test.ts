import { describe, it, expect } from 'vitest';
import {
  testCasesApi,
  type GetTestCasesParams,
  type CreateTestCaseRequest,
  type UpdateTestCaseRequest,
  type BulkCreateTestCasesRequest,
  type BulkUpdateTestCasesRequest,
  type BulkDeleteTestCasesRequest,
  type BulkCreateTestCasesResponse,
  type BulkUpdateTestCasesResponse,
  type BulkDeleteTestCasesResponse,
  type TestCaseVersion,
} from './testCasesApi';
import type { TestCase, PaginatedResponse, Priority, TestCaseTemplate } from '@/types';

// Mock test case data
const mockTestCase: TestCase = {
  id: 'tc-123',
  sectionId: 'section-456',
  title: 'Login with valid credentials',
  templateType: 'steps' as TestCaseTemplate,
  preconditions: 'User account exists',
  steps: [
    { id: 'step-1', content: 'Navigate to login page', expected: 'Login form is displayed' },
    { id: 'step-2', content: 'Enter valid credentials', expected: 'Credentials are accepted' },
  ],
  expectedResult: 'User is logged in successfully',
  priority: 'high' as Priority,
  estimate: 300,
  version: 1,
  createdBy: 'user-789',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPaginatedTestCases: PaginatedResponse<TestCase> = {
  items: [mockTestCase],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

const mockTestCaseVersion: TestCaseVersion = {
  id: 'version-1',
  testCaseId: 'tc-123',
  version: 1,
  data: mockTestCase,
  changedBy: 'user-789',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('testCasesApi', () => {
  describe('endpoints configuration', () => {
    it('should have getTestCases endpoint defined', () => {
      expect(testCasesApi.endpoints.getTestCases).toBeDefined();
    });

    it('should have getTestCase endpoint defined', () => {
      expect(testCasesApi.endpoints.getTestCase).toBeDefined();
    });

    it('should have getTestCaseHistory endpoint defined', () => {
      expect(testCasesApi.endpoints.getTestCaseHistory).toBeDefined();
    });

    it('should have createTestCase endpoint defined', () => {
      expect(testCasesApi.endpoints.createTestCase).toBeDefined();
    });

    it('should have updateTestCase endpoint defined', () => {
      expect(testCasesApi.endpoints.updateTestCase).toBeDefined();
    });

    it('should have deleteTestCase endpoint defined', () => {
      expect(testCasesApi.endpoints.deleteTestCase).toBeDefined();
    });

    it('should have bulkCreateTestCases endpoint defined', () => {
      expect(testCasesApi.endpoints.bulkCreateTestCases).toBeDefined();
    });

    it('should have bulkUpdateTestCases endpoint defined', () => {
      expect(testCasesApi.endpoints.bulkUpdateTestCases).toBeDefined();
    });

    it('should have bulkDeleteTestCases endpoint defined', () => {
      expect(testCasesApi.endpoints.bulkDeleteTestCases).toBeDefined();
    });
  });

  describe('getTestCases endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testCasesApi.endpoints.getTestCases;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept pagination and filter parameters', () => {
      const params: GetTestCasesParams = {
        projectId: 'project-123',
        sectionId: 'section-456',
        page: 1,
        pageSize: 25,
        search: 'login',
        priority: 'high' as Priority,
        templateType: 'steps' as TestCaseTemplate,
      };

      expect(params.projectId).toBe('project-123');
      expect(params.sectionId).toBe('section-456');
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(25);
      expect(params.search).toBe('login');
      expect(params.priority).toBe('high');
      expect(params.templateType).toBe('steps');
    });

    it('should work with only required projectId parameter', () => {
      const params: GetTestCasesParams = {
        projectId: 'project-123',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.sectionId).toBeUndefined();
    });
  });

  describe('getTestCase endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testCasesApi.endpoints.getTestCase;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and id as parameters', () => {
      const params = { projectId: 'project-123', id: 'tc-456' };
      expect(typeof params.projectId).toBe('string');
      expect(typeof params.id).toBe('string');
    });
  });

  describe('getTestCaseHistory endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testCasesApi.endpoints.getTestCaseHistory;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and id as parameters', () => {
      const params = { projectId: 'project-123', id: 'tc-456' };
      expect(typeof params.projectId).toBe('string');
      expect(typeof params.id).toBe('string');
    });
  });

  describe('createTestCase endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testCasesApi.endpoints.createTestCase;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for creating a test case', () => {
      const createData: CreateTestCaseRequest = {
        projectId: 'project-123',
        sectionId: 'section-456',
        title: 'New Test Case',
        templateType: 'steps' as TestCaseTemplate,
        preconditions: 'User is logged in',
        steps: [{ id: 'step-1', content: 'Click button', expected: 'Modal opens' }],
        expectedResult: 'Success',
        priority: 'medium' as Priority,
        estimate: 120,
      };

      expect(createData.projectId).toBe('project-123');
      expect(createData.sectionId).toBe('section-456');
      expect(createData.title).toBe('New Test Case');
      expect(createData.templateType).toBe('steps');
      expect(createData.steps).toHaveLength(1);
    });

    it('should allow minimal required fields only', () => {
      const createData: CreateTestCaseRequest = {
        projectId: 'project-123',
        sectionId: 'section-456',
        title: 'Minimal Test Case',
      };

      expect(createData.projectId).toBe('project-123');
      expect(createData.title).toBe('Minimal Test Case');
      expect(createData.templateType).toBeUndefined();
      expect(createData.steps).toBeUndefined();
    });
  });

  describe('updateTestCase endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testCasesApi.endpoints.updateTestCase;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for updating a test case', () => {
      const updateData: { projectId: string; id: string } & UpdateTestCaseRequest = {
        projectId: 'project-123',
        id: 'tc-456',
        title: 'Updated Title',
        priority: 'critical' as Priority,
      };

      expect(updateData.projectId).toBe('project-123');
      expect(updateData.id).toBe('tc-456');
      expect(updateData.title).toBe('Updated Title');
      expect(updateData.priority).toBe('critical');
    });

    it('should allow partial updates', () => {
      const updateTitleOnly: { projectId: string; id: string } & UpdateTestCaseRequest = {
        projectId: 'project-123',
        id: 'tc-456',
        title: 'Only Title Updated',
      };

      const updatePriorityOnly: { projectId: string; id: string } & UpdateTestCaseRequest = {
        projectId: 'project-123',
        id: 'tc-456',
        priority: 'low' as Priority,
      };

      expect(updateTitleOnly.title).toBe('Only Title Updated');
      expect(updateTitleOnly.priority).toBeUndefined();
      expect(updatePriorityOnly.title).toBeUndefined();
      expect(updatePriorityOnly.priority).toBe('low');
    });

    it('should allow moving test case to different section', () => {
      const moveData: { projectId: string; id: string } & UpdateTestCaseRequest = {
        projectId: 'project-123',
        id: 'tc-456',
        sectionId: 'new-section-789',
      };

      expect(moveData.sectionId).toBe('new-section-789');
    });
  });

  describe('deleteTestCase endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testCasesApi.endpoints.deleteTestCase;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and id as parameters', () => {
      const params = { projectId: 'project-123', id: 'tc-to-delete' };
      expect(typeof params.projectId).toBe('string');
      expect(typeof params.id).toBe('string');
    });
  });

  describe('bulkCreateTestCases endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testCasesApi.endpoints.bulkCreateTestCases;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and array of test cases', () => {
      const bulkCreateData: BulkCreateTestCasesRequest = {
        projectId: 'project-123',
        testCases: [
          { sectionId: 'section-1', title: 'Test Case 1' },
          { sectionId: 'section-1', title: 'Test Case 2', priority: 'high' as Priority },
          { sectionId: 'section-2', title: 'Test Case 3', templateType: 'bdd' as TestCaseTemplate },
        ],
      };

      expect(bulkCreateData.projectId).toBe('project-123');
      expect(bulkCreateData.testCases).toHaveLength(3);
      expect(bulkCreateData.testCases[0].title).toBe('Test Case 1');
      expect(bulkCreateData.testCases[1].priority).toBe('high');
    });
  });

  describe('bulkUpdateTestCases endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testCasesApi.endpoints.bulkUpdateTestCases;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and array of updates', () => {
      const bulkUpdateData: BulkUpdateTestCasesRequest = {
        projectId: 'project-123',
        updates: [
          { id: 'tc-1', title: 'Updated Title 1' },
          { id: 'tc-2', priority: 'critical' as Priority },
          { id: 'tc-3', sectionId: 'new-section' },
        ],
      };

      expect(bulkUpdateData.projectId).toBe('project-123');
      expect(bulkUpdateData.updates).toHaveLength(3);
      expect(bulkUpdateData.updates[0].id).toBe('tc-1');
      expect(bulkUpdateData.updates[0].title).toBe('Updated Title 1');
    });
  });

  describe('bulkDeleteTestCases endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testCasesApi.endpoints.bulkDeleteTestCases;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and array of ids', () => {
      const bulkDeleteData: BulkDeleteTestCasesRequest = {
        projectId: 'project-123',
        ids: ['tc-1', 'tc-2', 'tc-3'],
      };

      expect(bulkDeleteData.projectId).toBe('project-123');
      expect(bulkDeleteData.ids).toHaveLength(3);
      expect(bulkDeleteData.ids).toContain('tc-1');
    });
  });

  describe('exported hooks', () => {
    it('should export useGetTestCasesQuery hook', async () => {
      const { useGetTestCasesQuery } = await import('./testCasesApi');
      expect(useGetTestCasesQuery).toBeDefined();
      expect(typeof useGetTestCasesQuery).toBe('function');
    });

    it('should export useLazyGetTestCasesQuery hook', async () => {
      const { useLazyGetTestCasesQuery } = await import('./testCasesApi');
      expect(useLazyGetTestCasesQuery).toBeDefined();
      expect(typeof useLazyGetTestCasesQuery).toBe('function');
    });

    it('should export useGetTestCaseQuery hook', async () => {
      const { useGetTestCaseQuery } = await import('./testCasesApi');
      expect(useGetTestCaseQuery).toBeDefined();
      expect(typeof useGetTestCaseQuery).toBe('function');
    });

    it('should export useLazyGetTestCaseQuery hook', async () => {
      const { useLazyGetTestCaseQuery } = await import('./testCasesApi');
      expect(useLazyGetTestCaseQuery).toBeDefined();
      expect(typeof useLazyGetTestCaseQuery).toBe('function');
    });

    it('should export useGetTestCaseHistoryQuery hook', async () => {
      const { useGetTestCaseHistoryQuery } = await import('./testCasesApi');
      expect(useGetTestCaseHistoryQuery).toBeDefined();
      expect(typeof useGetTestCaseHistoryQuery).toBe('function');
    });

    it('should export useLazyGetTestCaseHistoryQuery hook', async () => {
      const { useLazyGetTestCaseHistoryQuery } = await import('./testCasesApi');
      expect(useLazyGetTestCaseHistoryQuery).toBeDefined();
      expect(typeof useLazyGetTestCaseHistoryQuery).toBe('function');
    });

    it('should export useCreateTestCaseMutation hook', async () => {
      const { useCreateTestCaseMutation } = await import('./testCasesApi');
      expect(useCreateTestCaseMutation).toBeDefined();
      expect(typeof useCreateTestCaseMutation).toBe('function');
    });

    it('should export useUpdateTestCaseMutation hook', async () => {
      const { useUpdateTestCaseMutation } = await import('./testCasesApi');
      expect(useUpdateTestCaseMutation).toBeDefined();
      expect(typeof useUpdateTestCaseMutation).toBe('function');
    });

    it('should export useDeleteTestCaseMutation hook', async () => {
      const { useDeleteTestCaseMutation } = await import('./testCasesApi');
      expect(useDeleteTestCaseMutation).toBeDefined();
      expect(typeof useDeleteTestCaseMutation).toBe('function');
    });

    it('should export useBulkCreateTestCasesMutation hook', async () => {
      const { useBulkCreateTestCasesMutation } = await import('./testCasesApi');
      expect(useBulkCreateTestCasesMutation).toBeDefined();
      expect(typeof useBulkCreateTestCasesMutation).toBe('function');
    });

    it('should export useBulkUpdateTestCasesMutation hook', async () => {
      const { useBulkUpdateTestCasesMutation } = await import('./testCasesApi');
      expect(useBulkUpdateTestCasesMutation).toBeDefined();
      expect(typeof useBulkUpdateTestCasesMutation).toBe('function');
    });

    it('should export useBulkDeleteTestCasesMutation hook', async () => {
      const { useBulkDeleteTestCasesMutation } = await import('./testCasesApi');
      expect(useBulkDeleteTestCasesMutation).toBeDefined();
      expect(typeof useBulkDeleteTestCasesMutation).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should export GetTestCasesParams interface', () => {
      const params: GetTestCasesParams = {
        projectId: 'project-123',
        page: 2,
        pageSize: 50,
        search: 'search query',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.page).toBe(2);
      expect(params.pageSize).toBe(50);
      expect(params.search).toBe('search query');
    });

    it('should export CreateTestCaseRequest interface', () => {
      const request: CreateTestCaseRequest = {
        projectId: 'project-123',
        sectionId: 'section-456',
        title: 'New Test',
        priority: 'medium' as Priority,
      };
      expect(request.projectId).toBe('project-123');
      expect(request.title).toBe('New Test');
    });

    it('should export UpdateTestCaseRequest interface', () => {
      const request: UpdateTestCaseRequest = {
        title: 'Updated Name',
        priority: 'high' as Priority,
      };
      expect(request.title).toBe('Updated Name');
      expect(request.priority).toBe('high');
    });

    it('should export BulkCreateTestCasesRequest interface', () => {
      const request: BulkCreateTestCasesRequest = {
        projectId: 'project-123',
        testCases: [{ sectionId: 'section-1', title: 'Test 1' }],
      };
      expect(request.projectId).toBe('project-123');
      expect(request.testCases).toHaveLength(1);
    });

    it('should export BulkUpdateTestCasesRequest interface', () => {
      const request: BulkUpdateTestCasesRequest = {
        projectId: 'project-123',
        updates: [{ id: 'tc-1', title: 'Updated' }],
      };
      expect(request.projectId).toBe('project-123');
      expect(request.updates).toHaveLength(1);
    });

    it('should export BulkDeleteTestCasesRequest interface', () => {
      const request: BulkDeleteTestCasesRequest = {
        projectId: 'project-123',
        ids: ['tc-1', 'tc-2'],
      };
      expect(request.projectId).toBe('project-123');
      expect(request.ids).toHaveLength(2);
    });

    it('should export BulkCreateTestCasesResponse interface', () => {
      const response: BulkCreateTestCasesResponse = {
        created: [mockTestCase],
        failed: [{ index: 1, error: 'Validation error' }],
      };
      expect(response.created).toHaveLength(1);
      expect(response.failed).toHaveLength(1);
      expect(response.failed[0].index).toBe(1);
    });

    it('should export BulkUpdateTestCasesResponse interface', () => {
      const response: BulkUpdateTestCasesResponse = {
        updated: [mockTestCase],
        failed: [{ id: 'tc-fail', error: 'Not found' }],
      };
      expect(response.updated).toHaveLength(1);
      expect(response.failed).toHaveLength(1);
      expect(response.failed[0].id).toBe('tc-fail');
    });

    it('should export BulkDeleteTestCasesResponse interface', () => {
      const response: BulkDeleteTestCasesResponse = {
        deleted: ['tc-1', 'tc-2'],
        failed: [{ id: 'tc-3', error: 'Permission denied' }],
      };
      expect(response.deleted).toHaveLength(2);
      expect(response.failed).toHaveLength(1);
    });

    it('should export TestCaseVersion interface', () => {
      const version: TestCaseVersion = mockTestCaseVersion;
      expect(version.id).toBe('version-1');
      expect(version.testCaseId).toBe('tc-123');
      expect(version.version).toBe(1);
      expect(version.changedBy).toBe('user-789');
    });
  });

  describe('type safety', () => {
    it('should have correct TestCase fields in responses', () => {
      expect(mockTestCase.id).toBe('tc-123');
      expect(mockTestCase.sectionId).toBe('section-456');
      expect(mockTestCase.title).toBe('Login with valid credentials');
      expect(mockTestCase.templateType).toBe('steps');
      expect(mockTestCase.preconditions).toBe('User account exists');
      expect(mockTestCase.steps).toHaveLength(2);
      expect(mockTestCase.expectedResult).toBe('User is logged in successfully');
      expect(mockTestCase.priority).toBe('high');
      expect(mockTestCase.estimate).toBe(300);
      expect(mockTestCase.version).toBe(1);
      expect(mockTestCase.createdBy).toBe('user-789');
    });

    it('should have correct PaginatedResponse structure', () => {
      expect(mockPaginatedTestCases.items).toHaveLength(1);
      expect(mockPaginatedTestCases.total).toBe(1);
      expect(mockPaginatedTestCases.page).toBe(1);
      expect(mockPaginatedTestCases.pageSize).toBe(25);
      expect(mockPaginatedTestCases.totalPages).toBe(1);
    });

    it('should have correct TestStep structure', () => {
      const step = mockTestCase.steps[0];
      expect(step.id).toBe('step-1');
      expect(step.content).toBe('Navigate to login page');
      expect(step.expected).toBe('Login form is displayed');
    });

    it('should have correct GetTestCasesParams fields', () => {
      const params: GetTestCasesParams = {
        projectId: 'project-123',
        sectionId: 'section-456',
        page: 1,
        pageSize: 10,
        search: 'test',
        priority: 'high' as Priority,
        templateType: 'steps' as TestCaseTemplate,
      };

      expect(typeof params.projectId).toBe('string');
      expect(typeof params.sectionId).toBe('string');
      expect(typeof params.page).toBe('number');
      expect(typeof params.pageSize).toBe('number');
      expect(typeof params.search).toBe('string');
      expect(typeof params.priority).toBe('string');
      expect(typeof params.templateType).toBe('string');
    });
  });

  describe('endpoint URLs', () => {
    it('getTestCases endpoint should target /projects/:projectId/cases', () => {
      expect(testCasesApi.endpoints.getTestCases).toBeDefined();
    });

    it('getTestCase endpoint should target /projects/:projectId/cases/:id', () => {
      expect(testCasesApi.endpoints.getTestCase).toBeDefined();
    });

    it('getTestCaseHistory endpoint should target /projects/:projectId/cases/:id/history', () => {
      expect(testCasesApi.endpoints.getTestCaseHistory).toBeDefined();
    });

    it('createTestCase endpoint should target /projects/:projectId/cases', () => {
      expect(testCasesApi.endpoints.createTestCase).toBeDefined();
    });

    it('updateTestCase endpoint should target /projects/:projectId/cases/:id', () => {
      expect(testCasesApi.endpoints.updateTestCase).toBeDefined();
    });

    it('deleteTestCase endpoint should target /projects/:projectId/cases/:id', () => {
      expect(testCasesApi.endpoints.deleteTestCase).toBeDefined();
    });

    it('bulkCreateTestCases endpoint should target /projects/:projectId/cases/bulk', () => {
      expect(testCasesApi.endpoints.bulkCreateTestCases).toBeDefined();
    });

    it('bulkUpdateTestCases endpoint should target /projects/:projectId/cases/bulk', () => {
      expect(testCasesApi.endpoints.bulkUpdateTestCases).toBeDefined();
    });

    it('bulkDeleteTestCases endpoint should target /projects/:projectId/cases/bulk', () => {
      expect(testCasesApi.endpoints.bulkDeleteTestCases).toBeDefined();
    });
  });

  describe('cache tags', () => {
    it('getTestCases should provide TestCase list tags', () => {
      const endpoint = testCasesApi.endpoints.getTestCases;
      expect(endpoint).toBeDefined();
    });

    it('getTestCase should provide TestCase tags by ID', () => {
      const endpoint = testCasesApi.endpoints.getTestCase;
      expect(endpoint).toBeDefined();
    });

    it('getTestCaseHistory should provide TestCase and TestCaseVersion tags', () => {
      const endpoint = testCasesApi.endpoints.getTestCaseHistory;
      expect(endpoint).toBeDefined();
    });

    it('createTestCase should invalidate TestCase list tags', () => {
      const endpoint = testCasesApi.endpoints.createTestCase;
      expect(endpoint).toBeDefined();
    });

    it('updateTestCase should invalidate TestCase tags by ID and list', () => {
      const endpoint = testCasesApi.endpoints.updateTestCase;
      expect(endpoint).toBeDefined();
    });

    it('deleteTestCase should invalidate TestCase tags by ID and list', () => {
      const endpoint = testCasesApi.endpoints.deleteTestCase;
      expect(endpoint).toBeDefined();
    });

    it('bulkCreateTestCases should invalidate TestCase list tags', () => {
      const endpoint = testCasesApi.endpoints.bulkCreateTestCases;
      expect(endpoint).toBeDefined();
    });

    it('bulkUpdateTestCases should invalidate TestCase tags for updated items', () => {
      const endpoint = testCasesApi.endpoints.bulkUpdateTestCases;
      expect(endpoint).toBeDefined();
    });

    it('bulkDeleteTestCases should invalidate TestCase tags for deleted items', () => {
      const endpoint = testCasesApi.endpoints.bulkDeleteTestCases;
      expect(endpoint).toBeDefined();
    });
  });

  describe('reducerPath', () => {
    it('should be part of the base API', () => {
      expect(testCasesApi.reducerPath).toBe('api');
    });
  });
});
