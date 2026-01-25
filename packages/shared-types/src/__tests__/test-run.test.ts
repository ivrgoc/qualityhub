import { describe, it, expect } from 'vitest';
import {
  TestStatus,
  TEST_STATUS_VALUES,
  isTestStatus,
} from '../test-run';
import type {
  TestRun,
  CreateTestRunDto,
  UpdateTestRunDto,
  TestResult,
  CreateTestResultDto,
  UpdateTestResultDto,
} from '../test-run';

describe('test-run module exports', () => {
  describe('TestStatus enum', () => {
    it('should export all status values', () => {
      expect(TestStatus.UNTESTED).toBe('untested');
      expect(TestStatus.PASSED).toBe('passed');
      expect(TestStatus.FAILED).toBe('failed');
      expect(TestStatus.BLOCKED).toBe('blocked');
      expect(TestStatus.RETEST).toBe('retest');
      expect(TestStatus.SKIPPED).toBe('skipped');
    });

    it('should export TEST_STATUS_VALUES array', () => {
      expect(TEST_STATUS_VALUES).toContain('untested');
      expect(TEST_STATUS_VALUES).toContain('passed');
      expect(TEST_STATUS_VALUES).toContain('failed');
      expect(TEST_STATUS_VALUES).toContain('blocked');
      expect(TEST_STATUS_VALUES).toContain('retest');
      expect(TEST_STATUS_VALUES).toContain('skipped');
      expect(TEST_STATUS_VALUES).toHaveLength(6);
    });

    it('should export isTestStatus type guard', () => {
      expect(isTestStatus('untested')).toBe(true);
      expect(isTestStatus('passed')).toBe(true);
      expect(isTestStatus('failed')).toBe(true);
      expect(isTestStatus('blocked')).toBe(true);
      expect(isTestStatus('retest')).toBe(true);
      expect(isTestStatus('skipped')).toBe(true);
      expect(isTestStatus('invalid')).toBe(false);
      expect(isTestStatus(null)).toBe(false);
      expect(isTestStatus(undefined)).toBe(false);
      expect(isTestStatus(123)).toBe(false);
    });
  });

  describe('TestRun interface', () => {
    it('should accept valid TestRun object with required fields', () => {
      const testRun: TestRun = {
        id: 'run-123',
        projectId: 'project-1',
        name: 'Sprint 15 Regression',
        createdAt: '2024-01-15T10:00:00.000Z',
      };

      expect(testRun.id).toBe('run-123');
      expect(testRun.projectId).toBe('project-1');
      expect(testRun.name).toBe('Sprint 15 Regression');
      expect(testRun.createdAt).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should accept TestRun with optional fields', () => {
      const testRun: TestRun = {
        id: 'run-456',
        projectId: 'project-2',
        planId: 'plan-1',
        suiteId: 'suite-1',
        name: 'Release Candidate Testing',
        description: 'Full regression for v2.0 release',
        assigneeId: 'user-1',
        startedAt: '2024-01-20T09:00:00.000Z',
        completedAt: '2024-01-20T17:00:00.000Z',
        createdAt: '2024-01-19T14:00:00.000Z',
      };

      expect(testRun.planId).toBe('plan-1');
      expect(testRun.suiteId).toBe('suite-1');
      expect(testRun.description).toBe('Full regression for v2.0 release');
      expect(testRun.assigneeId).toBe('user-1');
      expect(testRun.startedAt).toBe('2024-01-20T09:00:00.000Z');
      expect(testRun.completedAt).toBe('2024-01-20T17:00:00.000Z');
    });
  });

  describe('CreateTestRunDto interface', () => {
    it('should accept minimal CreateTestRunDto', () => {
      const dto: CreateTestRunDto = {
        name: 'New Test Run',
      };

      expect(dto.name).toBe('New Test Run');
    });

    it('should accept full CreateTestRunDto', () => {
      const dto: CreateTestRunDto = {
        name: 'Complete Test Run',
        description: 'Comprehensive test run',
        planId: 'plan-123',
        suiteId: 'suite-456',
        assigneeId: 'user-789',
      };

      expect(dto.name).toBe('Complete Test Run');
      expect(dto.description).toBe('Comprehensive test run');
      expect(dto.planId).toBe('plan-123');
      expect(dto.suiteId).toBe('suite-456');
      expect(dto.assigneeId).toBe('user-789');
    });
  });

  describe('UpdateTestRunDto interface', () => {
    it('should accept partial UpdateTestRunDto', () => {
      const dto: UpdateTestRunDto = {
        name: 'Updated Name',
      };

      expect(dto.name).toBe('Updated Name');
    });

    it('should accept UpdateTestRunDto with timing fields', () => {
      const dto: UpdateTestRunDto = {
        startedAt: '2024-01-21T08:00:00.000Z',
        completedAt: '2024-01-21T16:00:00.000Z',
      };

      expect(dto.startedAt).toBe('2024-01-21T08:00:00.000Z');
      expect(dto.completedAt).toBe('2024-01-21T16:00:00.000Z');
    });

    it('should accept UpdateTestRunDto with multiple fields', () => {
      const dto: UpdateTestRunDto = {
        name: 'Updated Test Run',
        description: 'Modified description',
        assigneeId: 'user-new',
        startedAt: '2024-01-22T09:00:00.000Z',
      };

      expect(dto.name).toBe('Updated Test Run');
      expect(dto.description).toBe('Modified description');
      expect(dto.assigneeId).toBe('user-new');
      expect(dto.startedAt).toBe('2024-01-22T09:00:00.000Z');
    });
  });

  describe('TestResult interface', () => {
    it('should accept valid TestResult object', () => {
      const testResult: TestResult = {
        id: 'result-123',
        runId: 'run-1',
        caseId: 'case-1',
        caseVersion: 1,
        status: TestStatus.PASSED,
        executedBy: 'user-1',
        executedAt: '2024-01-15T11:30:00.000Z',
        createdAt: '2024-01-15T11:30:00.000Z',
      };

      expect(testResult.id).toBe('result-123');
      expect(testResult.runId).toBe('run-1');
      expect(testResult.caseId).toBe('case-1');
      expect(testResult.caseVersion).toBe(1);
      expect(testResult.status).toBe(TestStatus.PASSED);
      expect(testResult.executedBy).toBe('user-1');
    });

    it('should accept TestResult with optional fields', () => {
      const testResult: TestResult = {
        id: 'result-456',
        runId: 'run-2',
        caseId: 'case-2',
        caseVersion: 3,
        status: TestStatus.FAILED,
        comment: 'Button click did not trigger expected action',
        elapsedSeconds: 45,
        executedBy: 'user-2',
        executedAt: '2024-01-16T14:00:00.000Z',
        createdAt: '2024-01-16T14:00:00.000Z',
      };

      expect(testResult.comment).toBe('Button click did not trigger expected action');
      expect(testResult.elapsedSeconds).toBe(45);
      expect(testResult.status).toBe(TestStatus.FAILED);
    });

    it('should accept TestResult with all status types', () => {
      const statuses = [
        TestStatus.UNTESTED,
        TestStatus.PASSED,
        TestStatus.FAILED,
        TestStatus.BLOCKED,
        TestStatus.RETEST,
        TestStatus.SKIPPED,
      ];

      statuses.forEach((status, index) => {
        const result: TestResult = {
          id: `result-${index}`,
          runId: 'run-1',
          caseId: 'case-1',
          caseVersion: 1,
          status,
          executedBy: 'user-1',
          executedAt: '2024-01-15T10:00:00.000Z',
          createdAt: '2024-01-15T10:00:00.000Z',
        };
        expect(result.status).toBe(status);
      });
    });
  });

  describe('CreateTestResultDto interface', () => {
    it('should accept minimal CreateTestResultDto', () => {
      const dto: CreateTestResultDto = {
        caseId: 'case-1',
        status: TestStatus.PASSED,
      };

      expect(dto.caseId).toBe('case-1');
      expect(dto.status).toBe(TestStatus.PASSED);
    });

    it('should accept full CreateTestResultDto', () => {
      const dto: CreateTestResultDto = {
        caseId: 'case-2',
        status: TestStatus.FAILED,
        comment: 'Test failed due to timeout',
        elapsedSeconds: 120,
      };

      expect(dto.caseId).toBe('case-2');
      expect(dto.status).toBe(TestStatus.FAILED);
      expect(dto.comment).toBe('Test failed due to timeout');
      expect(dto.elapsedSeconds).toBe(120);
    });
  });

  describe('UpdateTestResultDto interface', () => {
    it('should accept partial UpdateTestResultDto with status only', () => {
      const dto: UpdateTestResultDto = {
        status: TestStatus.RETEST,
      };

      expect(dto.status).toBe(TestStatus.RETEST);
    });

    it('should accept UpdateTestResultDto with comment only', () => {
      const dto: UpdateTestResultDto = {
        comment: 'Updated comment after investigation',
      };

      expect(dto.comment).toBe('Updated comment after investigation');
    });

    it('should accept UpdateTestResultDto with multiple fields', () => {
      const dto: UpdateTestResultDto = {
        status: TestStatus.PASSED,
        comment: 'Passed on retest',
        elapsedSeconds: 30,
      };

      expect(dto.status).toBe(TestStatus.PASSED);
      expect(dto.comment).toBe('Passed on retest');
      expect(dto.elapsedSeconds).toBe(30);
    });
  });
});
