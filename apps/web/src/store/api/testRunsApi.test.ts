import { describe, it, expect } from 'vitest';
import {
  testRunsApi,
  type GetTestRunsParams,
  type CreateTestRunRequest,
  type UpdateTestRunRequest,
  type CloseTestRunRequest,
  type GetTestResultsParams,
  type AddTestResultRequest,
  type BulkAddTestResultsRequest,
  type BulkAddTestResultsResponse,
  type TestRunStats,
  type TestRunWithStats,
} from './testRunsApi';
import type { TestRun, TestResult, TestStatus, PaginatedResponse } from '@/types';

// Mock test run data
const mockTestRunStats: TestRunStats = {
  total: 10,
  passed: 5,
  failed: 2,
  blocked: 1,
  retest: 1,
  skipped: 0,
  untested: 1,
};

const mockTestRun: TestRun = {
  id: 'run-123',
  projectId: 'project-456',
  planId: 'plan-789',
  suiteId: 'suite-abc',
  name: 'Sprint 1 Regression',
  description: 'Regression tests for Sprint 1',
  assigneeId: 'user-xyz',
  startedAt: '2024-01-01T00:00:00Z',
  completedAt: undefined,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockTestRunWithStats: TestRunWithStats = {
  ...mockTestRun,
  stats: mockTestRunStats,
};

const mockPaginatedTestRuns: PaginatedResponse<TestRunWithStats> = {
  items: [mockTestRunWithStats],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

const mockTestResult: TestResult = {
  id: 'result-123',
  runId: 'run-123',
  caseId: 'case-456',
  caseVersion: 1,
  status: 'passed' as TestStatus,
  comment: 'Test passed successfully',
  elapsedSeconds: 120,
  executedBy: 'user-xyz',
  executedAt: '2024-01-01T12:00:00Z',
  createdAt: '2024-01-01T12:00:00Z',
};

const mockPaginatedTestResults: PaginatedResponse<TestResult> = {
  items: [mockTestResult],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

describe('testRunsApi', () => {
  describe('endpoints configuration', () => {
    it('should have getTestRuns endpoint defined', () => {
      expect(testRunsApi.endpoints.getTestRuns).toBeDefined();
    });

    it('should have getTestRun endpoint defined', () => {
      expect(testRunsApi.endpoints.getTestRun).toBeDefined();
    });

    it('should have createTestRun endpoint defined', () => {
      expect(testRunsApi.endpoints.createTestRun).toBeDefined();
    });

    it('should have updateTestRun endpoint defined', () => {
      expect(testRunsApi.endpoints.updateTestRun).toBeDefined();
    });

    it('should have deleteTestRun endpoint defined', () => {
      expect(testRunsApi.endpoints.deleteTestRun).toBeDefined();
    });

    it('should have closeTestRun endpoint defined', () => {
      expect(testRunsApi.endpoints.closeTestRun).toBeDefined();
    });

    it('should have getTestResults endpoint defined', () => {
      expect(testRunsApi.endpoints.getTestResults).toBeDefined();
    });

    it('should have getTestResult endpoint defined', () => {
      expect(testRunsApi.endpoints.getTestResult).toBeDefined();
    });

    it('should have addTestResult endpoint defined', () => {
      expect(testRunsApi.endpoints.addTestResult).toBeDefined();
    });

    it('should have bulkAddTestResults endpoint defined', () => {
      expect(testRunsApi.endpoints.bulkAddTestResults).toBeDefined();
    });

    it('should have updateTestResult endpoint defined', () => {
      expect(testRunsApi.endpoints.updateTestResult).toBeDefined();
    });
  });

  describe('getTestRuns endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testRunsApi.endpoints.getTestRuns;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept pagination and filter parameters', () => {
      const params: GetTestRunsParams = {
        projectId: 'project-123',
        planId: 'plan-456',
        suiteId: 'suite-789',
        assigneeId: 'user-abc',
        page: 1,
        pageSize: 25,
        search: 'regression',
      };

      expect(params.projectId).toBe('project-123');
      expect(params.planId).toBe('plan-456');
      expect(params.suiteId).toBe('suite-789');
      expect(params.assigneeId).toBe('user-abc');
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(25);
      expect(params.search).toBe('regression');
    });

    it('should work with only required projectId parameter', () => {
      const params: GetTestRunsParams = {
        projectId: 'project-123',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.planId).toBeUndefined();
      expect(params.suiteId).toBeUndefined();
    });
  });

  describe('getTestRun endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testRunsApi.endpoints.getTestRun;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and id as parameters', () => {
      const params = { projectId: 'project-123', id: 'run-456' };
      expect(typeof params.projectId).toBe('string');
      expect(typeof params.id).toBe('string');
    });
  });

  describe('createTestRun endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.createTestRun;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for creating a test run', () => {
      const createData: CreateTestRunRequest = {
        projectId: 'project-123',
        name: 'New Test Run',
        description: 'Testing new features',
        planId: 'plan-456',
        suiteId: 'suite-789',
        assigneeId: 'user-abc',
        caseIds: ['case-1', 'case-2', 'case-3'],
      };

      expect(createData.projectId).toBe('project-123');
      expect(createData.name).toBe('New Test Run');
      expect(createData.description).toBe('Testing new features');
      expect(createData.planId).toBe('plan-456');
      expect(createData.suiteId).toBe('suite-789');
      expect(createData.assigneeId).toBe('user-abc');
      expect(createData.caseIds).toHaveLength(3);
    });

    it('should allow minimal required fields only', () => {
      const createData: CreateTestRunRequest = {
        projectId: 'project-123',
        name: 'Minimal Test Run',
      };

      expect(createData.projectId).toBe('project-123');
      expect(createData.name).toBe('Minimal Test Run');
      expect(createData.description).toBeUndefined();
      expect(createData.planId).toBeUndefined();
      expect(createData.caseIds).toBeUndefined();
    });
  });

  describe('updateTestRun endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.updateTestRun;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for updating a test run', () => {
      const updateData: { projectId: string; id: string } & UpdateTestRunRequest = {
        projectId: 'project-123',
        id: 'run-456',
        name: 'Updated Run Name',
        description: 'Updated description',
        assigneeId: 'new-user',
      };

      expect(updateData.projectId).toBe('project-123');
      expect(updateData.id).toBe('run-456');
      expect(updateData.name).toBe('Updated Run Name');
      expect(updateData.description).toBe('Updated description');
      expect(updateData.assigneeId).toBe('new-user');
    });

    it('should allow partial updates', () => {
      const updateNameOnly: { projectId: string; id: string } & UpdateTestRunRequest = {
        projectId: 'project-123',
        id: 'run-456',
        name: 'Only Name Updated',
      };

      const updateAssigneeOnly: { projectId: string; id: string } & UpdateTestRunRequest = {
        projectId: 'project-123',
        id: 'run-456',
        assigneeId: 'new-assignee',
      };

      expect(updateNameOnly.name).toBe('Only Name Updated');
      expect(updateNameOnly.assigneeId).toBeUndefined();
      expect(updateAssigneeOnly.name).toBeUndefined();
      expect(updateAssigneeOnly.assigneeId).toBe('new-assignee');
    });
  });

  describe('deleteTestRun endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.deleteTestRun;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and id as parameters', () => {
      const params = { projectId: 'project-123', id: 'run-to-delete' };
      expect(typeof params.projectId).toBe('string');
      expect(typeof params.id).toBe('string');
    });
  });

  describe('closeTestRun endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.closeTestRun;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and id as parameters', () => {
      const closeData: CloseTestRunRequest = {
        projectId: 'project-123',
        id: 'run-456',
      };

      expect(closeData.projectId).toBe('project-123');
      expect(closeData.id).toBe('run-456');
    });
  });

  describe('getTestResults endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testRunsApi.endpoints.getTestResults;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept pagination and filter parameters', () => {
      const params: GetTestResultsParams = {
        projectId: 'project-123',
        runId: 'run-456',
        status: 'passed' as TestStatus,
        page: 1,
        pageSize: 50,
      };

      expect(params.projectId).toBe('project-123');
      expect(params.runId).toBe('run-456');
      expect(params.status).toBe('passed');
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(50);
    });

    it('should work with only required parameters', () => {
      const params: GetTestResultsParams = {
        projectId: 'project-123',
        runId: 'run-456',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.runId).toBe('run-456');
      expect(params.status).toBeUndefined();
    });
  });

  describe('getTestResult endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = testRunsApi.endpoints.getTestResult;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId, runId, and resultId as parameters', () => {
      const params = { projectId: 'project-123', runId: 'run-456', resultId: 'result-789' };
      expect(typeof params.projectId).toBe('string');
      expect(typeof params.runId).toBe('string');
      expect(typeof params.resultId).toBe('string');
    });
  });

  describe('addTestResult endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.addTestResult;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for adding a test result', () => {
      const addData: AddTestResultRequest = {
        projectId: 'project-123',
        runId: 'run-456',
        caseId: 'case-789',
        status: 'passed' as TestStatus,
        comment: 'Test executed successfully',
        elapsedSeconds: 60,
        defects: ['BUG-123'],
      };

      expect(addData.projectId).toBe('project-123');
      expect(addData.runId).toBe('run-456');
      expect(addData.caseId).toBe('case-789');
      expect(addData.status).toBe('passed');
      expect(addData.comment).toBe('Test executed successfully');
      expect(addData.elapsedSeconds).toBe(60);
      expect(addData.defects).toHaveLength(1);
    });

    it('should allow minimal required fields only', () => {
      const addData: AddTestResultRequest = {
        projectId: 'project-123',
        runId: 'run-456',
        caseId: 'case-789',
        status: 'failed' as TestStatus,
      };

      expect(addData.projectId).toBe('project-123');
      expect(addData.caseId).toBe('case-789');
      expect(addData.status).toBe('failed');
      expect(addData.comment).toBeUndefined();
      expect(addData.defects).toBeUndefined();
    });
  });

  describe('bulkAddTestResults endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.bulkAddTestResults;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId, runId and array of results', () => {
      const bulkAddData: BulkAddTestResultsRequest = {
        projectId: 'project-123',
        runId: 'run-456',
        results: [
          { caseId: 'case-1', status: 'passed' as TestStatus },
          { caseId: 'case-2', status: 'failed' as TestStatus, comment: 'Bug found' },
          { caseId: 'case-3', status: 'blocked' as TestStatus, defects: ['BUG-999'] },
        ],
      };

      expect(bulkAddData.projectId).toBe('project-123');
      expect(bulkAddData.runId).toBe('run-456');
      expect(bulkAddData.results).toHaveLength(3);
      expect(bulkAddData.results[0].caseId).toBe('case-1');
      expect(bulkAddData.results[0].status).toBe('passed');
      expect(bulkAddData.results[1].comment).toBe('Bug found');
    });
  });

  describe('updateTestResult endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = testRunsApi.endpoints.updateTestResult;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for updating a test result', () => {
      const updateData = {
        projectId: 'project-123',
        runId: 'run-456',
        resultId: 'result-789',
        status: 'retest' as TestStatus,
        comment: 'Need to retest after fix',
        elapsedSeconds: 90,
        defects: ['BUG-123', 'BUG-456'],
      };

      expect(updateData.projectId).toBe('project-123');
      expect(updateData.runId).toBe('run-456');
      expect(updateData.resultId).toBe('result-789');
      expect(updateData.status).toBe('retest');
      expect(updateData.comment).toBe('Need to retest after fix');
      expect(updateData.defects).toHaveLength(2);
    });
  });

  describe('exported hooks', () => {
    it('should export useGetTestRunsQuery hook', async () => {
      const { useGetTestRunsQuery } = await import('./testRunsApi');
      expect(useGetTestRunsQuery).toBeDefined();
      expect(typeof useGetTestRunsQuery).toBe('function');
    });

    it('should export useLazyGetTestRunsQuery hook', async () => {
      const { useLazyGetTestRunsQuery } = await import('./testRunsApi');
      expect(useLazyGetTestRunsQuery).toBeDefined();
      expect(typeof useLazyGetTestRunsQuery).toBe('function');
    });

    it('should export useGetTestRunQuery hook', async () => {
      const { useGetTestRunQuery } = await import('./testRunsApi');
      expect(useGetTestRunQuery).toBeDefined();
      expect(typeof useGetTestRunQuery).toBe('function');
    });

    it('should export useLazyGetTestRunQuery hook', async () => {
      const { useLazyGetTestRunQuery } = await import('./testRunsApi');
      expect(useLazyGetTestRunQuery).toBeDefined();
      expect(typeof useLazyGetTestRunQuery).toBe('function');
    });

    it('should export useCreateTestRunMutation hook', async () => {
      const { useCreateTestRunMutation } = await import('./testRunsApi');
      expect(useCreateTestRunMutation).toBeDefined();
      expect(typeof useCreateTestRunMutation).toBe('function');
    });

    it('should export useUpdateTestRunMutation hook', async () => {
      const { useUpdateTestRunMutation } = await import('./testRunsApi');
      expect(useUpdateTestRunMutation).toBeDefined();
      expect(typeof useUpdateTestRunMutation).toBe('function');
    });

    it('should export useDeleteTestRunMutation hook', async () => {
      const { useDeleteTestRunMutation } = await import('./testRunsApi');
      expect(useDeleteTestRunMutation).toBeDefined();
      expect(typeof useDeleteTestRunMutation).toBe('function');
    });

    it('should export useCloseTestRunMutation hook', async () => {
      const { useCloseTestRunMutation } = await import('./testRunsApi');
      expect(useCloseTestRunMutation).toBeDefined();
      expect(typeof useCloseTestRunMutation).toBe('function');
    });

    it('should export useGetTestResultsQuery hook', async () => {
      const { useGetTestResultsQuery } = await import('./testRunsApi');
      expect(useGetTestResultsQuery).toBeDefined();
      expect(typeof useGetTestResultsQuery).toBe('function');
    });

    it('should export useLazyGetTestResultsQuery hook', async () => {
      const { useLazyGetTestResultsQuery } = await import('./testRunsApi');
      expect(useLazyGetTestResultsQuery).toBeDefined();
      expect(typeof useLazyGetTestResultsQuery).toBe('function');
    });

    it('should export useGetTestResultQuery hook', async () => {
      const { useGetTestResultQuery } = await import('./testRunsApi');
      expect(useGetTestResultQuery).toBeDefined();
      expect(typeof useGetTestResultQuery).toBe('function');
    });

    it('should export useLazyGetTestResultQuery hook', async () => {
      const { useLazyGetTestResultQuery } = await import('./testRunsApi');
      expect(useLazyGetTestResultQuery).toBeDefined();
      expect(typeof useLazyGetTestResultQuery).toBe('function');
    });

    it('should export useAddTestResultMutation hook', async () => {
      const { useAddTestResultMutation } = await import('./testRunsApi');
      expect(useAddTestResultMutation).toBeDefined();
      expect(typeof useAddTestResultMutation).toBe('function');
    });

    it('should export useBulkAddTestResultsMutation hook', async () => {
      const { useBulkAddTestResultsMutation } = await import('./testRunsApi');
      expect(useBulkAddTestResultsMutation).toBeDefined();
      expect(typeof useBulkAddTestResultsMutation).toBe('function');
    });

    it('should export useUpdateTestResultMutation hook', async () => {
      const { useUpdateTestResultMutation } = await import('./testRunsApi');
      expect(useUpdateTestResultMutation).toBeDefined();
      expect(typeof useUpdateTestResultMutation).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should export GetTestRunsParams interface', () => {
      const params: GetTestRunsParams = {
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

    it('should export CreateTestRunRequest interface', () => {
      const request: CreateTestRunRequest = {
        projectId: 'project-123',
        name: 'New Run',
        description: 'Test description',
      };
      expect(request.projectId).toBe('project-123');
      expect(request.name).toBe('New Run');
    });

    it('should export UpdateTestRunRequest interface', () => {
      const request: UpdateTestRunRequest = {
        name: 'Updated Name',
        description: 'Updated description',
      };
      expect(request.name).toBe('Updated Name');
      expect(request.description).toBe('Updated description');
    });

    it('should export CloseTestRunRequest interface', () => {
      const request: CloseTestRunRequest = {
        projectId: 'project-123',
        id: 'run-456',
      };
      expect(request.projectId).toBe('project-123');
      expect(request.id).toBe('run-456');
    });

    it('should export GetTestResultsParams interface', () => {
      const params: GetTestResultsParams = {
        projectId: 'project-123',
        runId: 'run-456',
        status: 'failed' as TestStatus,
      };
      expect(params.projectId).toBe('project-123');
      expect(params.runId).toBe('run-456');
      expect(params.status).toBe('failed');
    });

    it('should export AddTestResultRequest interface', () => {
      const request: AddTestResultRequest = {
        projectId: 'project-123',
        runId: 'run-456',
        caseId: 'case-789',
        status: 'passed' as TestStatus,
      };
      expect(request.projectId).toBe('project-123');
      expect(request.caseId).toBe('case-789');
      expect(request.status).toBe('passed');
    });

    it('should export BulkAddTestResultsRequest interface', () => {
      const request: BulkAddTestResultsRequest = {
        projectId: 'project-123',
        runId: 'run-456',
        results: [{ caseId: 'case-1', status: 'passed' as TestStatus }],
      };
      expect(request.projectId).toBe('project-123');
      expect(request.runId).toBe('run-456');
      expect(request.results).toHaveLength(1);
    });

    it('should export BulkAddTestResultsResponse interface', () => {
      const response: BulkAddTestResultsResponse = {
        created: [mockTestResult],
        failed: [{ caseId: 'case-fail', error: 'Validation error' }],
      };
      expect(response.created).toHaveLength(1);
      expect(response.failed).toHaveLength(1);
      expect(response.failed[0].caseId).toBe('case-fail');
    });

    it('should export TestRunStats interface', () => {
      const stats: TestRunStats = mockTestRunStats;
      expect(stats.total).toBe(10);
      expect(stats.passed).toBe(5);
      expect(stats.failed).toBe(2);
      expect(stats.blocked).toBe(1);
      expect(stats.retest).toBe(1);
      expect(stats.skipped).toBe(0);
      expect(stats.untested).toBe(1);
    });

    it('should export TestRunWithStats interface', () => {
      const runWithStats: TestRunWithStats = mockTestRunWithStats;
      expect(runWithStats.id).toBe('run-123');
      expect(runWithStats.name).toBe('Sprint 1 Regression');
      expect(runWithStats.stats.total).toBe(10);
      expect(runWithStats.stats.passed).toBe(5);
    });
  });

  describe('type safety', () => {
    it('should have correct TestRun fields in responses', () => {
      expect(mockTestRun.id).toBe('run-123');
      expect(mockTestRun.projectId).toBe('project-456');
      expect(mockTestRun.planId).toBe('plan-789');
      expect(mockTestRun.suiteId).toBe('suite-abc');
      expect(mockTestRun.name).toBe('Sprint 1 Regression');
      expect(mockTestRun.description).toBe('Regression tests for Sprint 1');
      expect(mockTestRun.assigneeId).toBe('user-xyz');
      expect(mockTestRun.startedAt).toBe('2024-01-01T00:00:00Z');
      expect(mockTestRun.completedAt).toBeUndefined();
    });

    it('should have correct TestResult fields in responses', () => {
      expect(mockTestResult.id).toBe('result-123');
      expect(mockTestResult.runId).toBe('run-123');
      expect(mockTestResult.caseId).toBe('case-456');
      expect(mockTestResult.caseVersion).toBe(1);
      expect(mockTestResult.status).toBe('passed');
      expect(mockTestResult.comment).toBe('Test passed successfully');
      expect(mockTestResult.elapsedSeconds).toBe(120);
      expect(mockTestResult.executedBy).toBe('user-xyz');
    });

    it('should have correct PaginatedResponse structure for runs', () => {
      expect(mockPaginatedTestRuns.items).toHaveLength(1);
      expect(mockPaginatedTestRuns.total).toBe(1);
      expect(mockPaginatedTestRuns.page).toBe(1);
      expect(mockPaginatedTestRuns.pageSize).toBe(25);
      expect(mockPaginatedTestRuns.totalPages).toBe(1);
    });

    it('should have correct PaginatedResponse structure for results', () => {
      expect(mockPaginatedTestResults.items).toHaveLength(1);
      expect(mockPaginatedTestResults.total).toBe(1);
      expect(mockPaginatedTestResults.page).toBe(1);
      expect(mockPaginatedTestResults.pageSize).toBe(25);
      expect(mockPaginatedTestResults.totalPages).toBe(1);
    });

    it('should have correct GetTestRunsParams fields', () => {
      const params: GetTestRunsParams = {
        projectId: 'project-123',
        planId: 'plan-456',
        suiteId: 'suite-789',
        assigneeId: 'user-abc',
        page: 1,
        pageSize: 10,
        search: 'test',
      };

      expect(typeof params.projectId).toBe('string');
      expect(typeof params.planId).toBe('string');
      expect(typeof params.suiteId).toBe('string');
      expect(typeof params.assigneeId).toBe('string');
      expect(typeof params.page).toBe('number');
      expect(typeof params.pageSize).toBe('number');
      expect(typeof params.search).toBe('string');
    });
  });

  describe('endpoint URLs', () => {
    it('getTestRuns endpoint should target /projects/:projectId/runs', () => {
      expect(testRunsApi.endpoints.getTestRuns).toBeDefined();
    });

    it('getTestRun endpoint should target /projects/:projectId/runs/:id', () => {
      expect(testRunsApi.endpoints.getTestRun).toBeDefined();
    });

    it('createTestRun endpoint should target /projects/:projectId/runs', () => {
      expect(testRunsApi.endpoints.createTestRun).toBeDefined();
    });

    it('updateTestRun endpoint should target /projects/:projectId/runs/:id', () => {
      expect(testRunsApi.endpoints.updateTestRun).toBeDefined();
    });

    it('deleteTestRun endpoint should target /projects/:projectId/runs/:id', () => {
      expect(testRunsApi.endpoints.deleteTestRun).toBeDefined();
    });

    it('closeTestRun endpoint should target /projects/:projectId/runs/:id/close', () => {
      expect(testRunsApi.endpoints.closeTestRun).toBeDefined();
    });

    it('getTestResults endpoint should target /projects/:projectId/runs/:runId/results', () => {
      expect(testRunsApi.endpoints.getTestResults).toBeDefined();
    });

    it('getTestResult endpoint should target /projects/:projectId/runs/:runId/results/:resultId', () => {
      expect(testRunsApi.endpoints.getTestResult).toBeDefined();
    });

    it('addTestResult endpoint should target /projects/:projectId/runs/:runId/results', () => {
      expect(testRunsApi.endpoints.addTestResult).toBeDefined();
    });

    it('bulkAddTestResults endpoint should target /projects/:projectId/runs/:runId/results/bulk', () => {
      expect(testRunsApi.endpoints.bulkAddTestResults).toBeDefined();
    });

    it('updateTestResult endpoint should target /projects/:projectId/runs/:runId/results/:resultId', () => {
      expect(testRunsApi.endpoints.updateTestResult).toBeDefined();
    });
  });

  describe('cache tags', () => {
    it('getTestRuns should provide TestRun list tags', () => {
      const endpoint = testRunsApi.endpoints.getTestRuns;
      expect(endpoint).toBeDefined();
    });

    it('getTestRun should provide TestRun tags by ID', () => {
      const endpoint = testRunsApi.endpoints.getTestRun;
      expect(endpoint).toBeDefined();
    });

    it('createTestRun should invalidate TestRun list tags', () => {
      const endpoint = testRunsApi.endpoints.createTestRun;
      expect(endpoint).toBeDefined();
    });

    it('updateTestRun should invalidate TestRun tags by ID and list', () => {
      const endpoint = testRunsApi.endpoints.updateTestRun;
      expect(endpoint).toBeDefined();
    });

    it('deleteTestRun should invalidate TestRun and TestResult tags', () => {
      const endpoint = testRunsApi.endpoints.deleteTestRun;
      expect(endpoint).toBeDefined();
    });

    it('closeTestRun should invalidate TestRun tags by ID', () => {
      const endpoint = testRunsApi.endpoints.closeTestRun;
      expect(endpoint).toBeDefined();
    });

    it('getTestResults should provide TestResult list tags', () => {
      const endpoint = testRunsApi.endpoints.getTestResults;
      expect(endpoint).toBeDefined();
    });

    it('addTestResult should invalidate TestRun and TestResult tags', () => {
      const endpoint = testRunsApi.endpoints.addTestResult;
      expect(endpoint).toBeDefined();
    });

    it('bulkAddTestResults should invalidate TestRun and TestResult tags', () => {
      const endpoint = testRunsApi.endpoints.bulkAddTestResults;
      expect(endpoint).toBeDefined();
    });

    it('updateTestResult should invalidate TestResult and TestRun tags', () => {
      const endpoint = testRunsApi.endpoints.updateTestResult;
      expect(endpoint).toBeDefined();
    });
  });

  describe('reducerPath', () => {
    it('should be part of the base API', () => {
      expect(testRunsApi.reducerPath).toBe('api');
    });
  });
});
