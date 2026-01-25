import { TestRun, TestRunStatus } from './test-run.entity';
import { TestResult } from './test-result.entity';
import { Project } from '../../projects/entities/project.entity';

describe('TestRun Entity', () => {
  it('should create a test run instance', () => {
    const testRun = new TestRun();

    testRun.id = 'run-123';
    testRun.projectId = 'proj-456';
    testRun.name = 'Regression Test Run';
    testRun.description = 'Full regression suite execution';
    testRun.status = TestRunStatus.NOT_STARTED;
    testRun.config = { browser: 'chrome', environment: 'staging' };
    testRun.testPlanId = 'plan-789';
    testRun.assigneeId = 'user-001';
    testRun.startedAt = null;
    testRun.completedAt = null;
    testRun.createdAt = new Date('2024-01-01');
    testRun.updatedAt = new Date('2024-01-01');
    testRun.deletedAt = null;

    expect(testRun.id).toBe('run-123');
    expect(testRun.projectId).toBe('proj-456');
    expect(testRun.name).toBe('Regression Test Run');
    expect(testRun.description).toBe('Full regression suite execution');
    expect(testRun.status).toBe(TestRunStatus.NOT_STARTED);
    expect(testRun.config).toEqual({ browser: 'chrome', environment: 'staging' });
    expect(testRun.testPlanId).toBe('plan-789');
    expect(testRun.assigneeId).toBe('user-001');
    expect(testRun.startedAt).toBeNull();
    expect(testRun.completedAt).toBeNull();
    expect(testRun.createdAt).toEqual(new Date('2024-01-01'));
    expect(testRun.updatedAt).toEqual(new Date('2024-01-01'));
    expect(testRun.deletedAt).toBeNull();
  });

  describe('name field', () => {
    it('should support name', () => {
      const testRun = new TestRun();
      testRun.name = 'Smoke Test Run';

      expect(testRun.name).toBe('Smoke Test Run');
    });

    it('should support different name values', () => {
      const testRun = new TestRun();

      testRun.name = 'Regression Tests';
      expect(testRun.name).toBe('Regression Tests');

      testRun.name = 'Integration Tests';
      expect(testRun.name).toBe('Integration Tests');
    });
  });

  describe('description field', () => {
    it('should support description', () => {
      const testRun = new TestRun();
      testRun.description = 'Detailed test run description';

      expect(testRun.description).toBe('Detailed test run description');
    });

    it('should support null description', () => {
      const testRun = new TestRun();
      testRun.description = null;

      expect(testRun.description).toBeNull();
    });
  });

  describe('status field', () => {
    it('should support NOT_STARTED status', () => {
      const testRun = new TestRun();
      testRun.status = TestRunStatus.NOT_STARTED;

      expect(testRun.status).toBe(TestRunStatus.NOT_STARTED);
    });

    it('should support IN_PROGRESS status', () => {
      const testRun = new TestRun();
      testRun.status = TestRunStatus.IN_PROGRESS;

      expect(testRun.status).toBe(TestRunStatus.IN_PROGRESS);
    });

    it('should support COMPLETED status', () => {
      const testRun = new TestRun();
      testRun.status = TestRunStatus.COMPLETED;

      expect(testRun.status).toBe(TestRunStatus.COMPLETED);
    });

    it('should support ABORTED status', () => {
      const testRun = new TestRun();
      testRun.status = TestRunStatus.ABORTED;

      expect(testRun.status).toBe(TestRunStatus.ABORTED);
    });

    it('should transition through status values', () => {
      const testRun = new TestRun();

      testRun.status = TestRunStatus.NOT_STARTED;
      expect(testRun.status).toBe(TestRunStatus.NOT_STARTED);

      testRun.status = TestRunStatus.IN_PROGRESS;
      expect(testRun.status).toBe(TestRunStatus.IN_PROGRESS);

      testRun.status = TestRunStatus.COMPLETED;
      expect(testRun.status).toBe(TestRunStatus.COMPLETED);
    });
  });

  describe('config field', () => {
    it('should support config object', () => {
      const testRun = new TestRun();
      testRun.config = {
        browser: 'firefox',
        environment: 'production',
        timeout: 30000,
      };

      expect(testRun.config).toEqual({
        browser: 'firefox',
        environment: 'production',
        timeout: 30000,
      });
    });

    it('should support null config', () => {
      const testRun = new TestRun();
      testRun.config = null;

      expect(testRun.config).toBeNull();
    });

    it('should support nested config objects', () => {
      const testRun = new TestRun();
      testRun.config = {
        browser: {
          name: 'chrome',
          version: '120',
        },
        retries: 3,
      };

      expect(testRun.config).toEqual({
        browser: {
          name: 'chrome',
          version: '120',
        },
        retries: 3,
      });
    });

    it('should support empty config object', () => {
      const testRun = new TestRun();
      testRun.config = {};

      expect(testRun.config).toEqual({});
    });
  });

  describe('assignee field', () => {
    it('should support assigneeId', () => {
      const testRun = new TestRun();
      testRun.assigneeId = 'user-123';

      expect(testRun.assigneeId).toBe('user-123');
    });

    it('should support null assigneeId', () => {
      const testRun = new TestRun();
      testRun.assigneeId = null;

      expect(testRun.assigneeId).toBeNull();
    });

    it('should allow reassigning', () => {
      const testRun = new TestRun();
      testRun.assigneeId = 'user-001';

      expect(testRun.assigneeId).toBe('user-001');

      testRun.assigneeId = 'user-002';

      expect(testRun.assigneeId).toBe('user-002');
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      const testRun = new TestRun();
      testRun.createdAt = new Date('2024-01-01T10:00:00Z');

      expect(testRun.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should have updatedAt timestamp', () => {
      const testRun = new TestRun();
      testRun.updatedAt = new Date('2024-01-02T10:00:00Z');

      expect(testRun.updatedAt).toEqual(new Date('2024-01-02T10:00:00Z'));
    });

    it('should have deletedAt timestamp for soft delete', () => {
      const testRun = new TestRun();
      testRun.deletedAt = new Date('2024-01-03T10:00:00Z');

      expect(testRun.deletedAt).toEqual(new Date('2024-01-03T10:00:00Z'));
    });

    it('should have null deletedAt when not deleted', () => {
      const testRun = new TestRun();
      testRun.deletedAt = null;

      expect(testRun.deletedAt).toBeNull();
    });

    it('should support startedAt timestamp', () => {
      const testRun = new TestRun();
      testRun.startedAt = new Date('2024-01-01T09:00:00Z');

      expect(testRun.startedAt).toEqual(new Date('2024-01-01T09:00:00Z'));
    });

    it('should support null startedAt', () => {
      const testRun = new TestRun();
      testRun.startedAt = null;

      expect(testRun.startedAt).toBeNull();
    });

    it('should support completedAt timestamp', () => {
      const testRun = new TestRun();
      testRun.completedAt = new Date('2024-01-01T12:00:00Z');

      expect(testRun.completedAt).toEqual(new Date('2024-01-01T12:00:00Z'));
    });

    it('should support null completedAt', () => {
      const testRun = new TestRun();
      testRun.completedAt = null;

      expect(testRun.completedAt).toBeNull();
    });
  });

  describe('project relation', () => {
    it('should have project relation', () => {
      const testRun = new TestRun();
      const project = new Project();
      project.id = 'proj-123';
      project.name = 'Test Project';

      testRun.projectId = project.id;
      testRun.project = project;

      expect(testRun.project).toBe(project);
      expect(testRun.project.id).toBe('proj-123');
      expect(testRun.project.name).toBe('Test Project');
      expect(testRun.projectId).toBe(project.id);
    });
  });

  describe('testPlanId field', () => {
    it('should support testPlanId', () => {
      const testRun = new TestRun();
      testRun.testPlanId = 'plan-123';

      expect(testRun.testPlanId).toBe('plan-123');
    });

    it('should support null testPlanId', () => {
      const testRun = new TestRun();
      testRun.testPlanId = null;

      expect(testRun.testPlanId).toBeNull();
    });
  });

  describe('results relation', () => {
    it('should have results relation', () => {
      const testRun = new TestRun();
      const result1 = new TestResult();
      const result2 = new TestResult();

      result1.id = 'result-1';
      result2.id = 'result-2';

      testRun.results = [result1, result2];

      expect(testRun.results).toHaveLength(2);
      expect(testRun.results[0].id).toBe('result-1');
      expect(testRun.results[1].id).toBe('result-2');
    });

    it('should support empty results array', () => {
      const testRun = new TestRun();
      testRun.results = [];

      expect(testRun.results).toHaveLength(0);
    });
  });

  describe('soft delete', () => {
    it('should support soft delete with deletedAt', () => {
      const testRun = new TestRun();
      testRun.id = 'run-123';
      testRun.name = 'Test run to delete';
      testRun.deletedAt = null;

      expect(testRun.deletedAt).toBeNull();

      testRun.deletedAt = new Date('2024-06-01');

      expect(testRun.deletedAt).toEqual(new Date('2024-06-01'));
    });

    it('should handle active test run (not deleted)', () => {
      const testRun = new TestRun();
      testRun.id = 'run-123';
      testRun.name = 'Active test run';
      testRun.deletedAt = null;

      const isDeleted = testRun.deletedAt !== null;

      expect(isDeleted).toBe(false);
    });

    it('should identify deleted test run', () => {
      const testRun = new TestRun();
      testRun.id = 'run-123';
      testRun.name = 'Deleted test run';
      testRun.deletedAt = new Date('2024-06-01');

      const isDeleted = testRun.deletedAt !== null;

      expect(isDeleted).toBe(true);
    });
  });

  describe('complete test run scenario', () => {
    it('should create a fully populated test run', () => {
      const testRun = new TestRun();
      const project = new Project();

      project.id = 'proj-123';
      project.name = 'E-Commerce Project';

      testRun.id = 'run-789';
      testRun.name = 'Full Regression Run';
      testRun.description = 'Complete regression test suite execution';
      testRun.status = TestRunStatus.IN_PROGRESS;
      testRun.config = { browser: 'chrome', environment: 'staging' };
      testRun.projectId = project.id;
      testRun.project = project;
      testRun.testPlanId = 'plan-456';
      testRun.assigneeId = 'user-001';
      testRun.startedAt = new Date('2024-01-01T09:00:00Z');
      testRun.completedAt = null;
      testRun.createdAt = new Date('2024-01-01');
      testRun.updatedAt = new Date('2024-01-01');
      testRun.deletedAt = null;

      expect(testRun.id).toBe('run-789');
      expect(testRun.name).toBe('Full Regression Run');
      expect(testRun.description).toBe('Complete regression test suite execution');
      expect(testRun.status).toBe(TestRunStatus.IN_PROGRESS);
      expect(testRun.config).toEqual({ browser: 'chrome', environment: 'staging' });
      expect(testRun.project.name).toBe('E-Commerce Project');
      expect(testRun.testPlanId).toBe('plan-456');
      expect(testRun.assigneeId).toBe('user-001');
      expect(testRun.startedAt).toEqual(new Date('2024-01-01T09:00:00Z'));
      expect(testRun.completedAt).toBeNull();
      expect(testRun.deletedAt).toBeNull();
    });

    it('should create a completed test run', () => {
      const testRun = new TestRun();

      testRun.id = 'run-456';
      testRun.name = 'Completed Smoke Tests';
      testRun.description = 'Smoke test execution completed';
      testRun.status = TestRunStatus.COMPLETED;
      testRun.config = null;
      testRun.projectId = 'proj-123';
      testRun.testPlanId = null;
      testRun.assigneeId = 'user-002';
      testRun.startedAt = new Date('2024-01-01T08:00:00Z');
      testRun.completedAt = new Date('2024-01-01T10:00:00Z');
      testRun.createdAt = new Date('2024-01-01');
      testRun.updatedAt = new Date('2024-01-01');
      testRun.deletedAt = null;

      expect(testRun.status).toBe(TestRunStatus.COMPLETED);
      expect(testRun.startedAt).toEqual(new Date('2024-01-01T08:00:00Z'));
      expect(testRun.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should create an aborted test run', () => {
      const testRun = new TestRun();

      testRun.id = 'run-999';
      testRun.name = 'Aborted Test Run';
      testRun.status = TestRunStatus.ABORTED;
      testRun.startedAt = new Date('2024-01-01T08:00:00Z');
      testRun.completedAt = new Date('2024-01-01T08:30:00Z');

      expect(testRun.status).toBe(TestRunStatus.ABORTED);
      expect(testRun.startedAt).toEqual(new Date('2024-01-01T08:00:00Z'));
      expect(testRun.completedAt).toEqual(new Date('2024-01-01T08:30:00Z'));
    });

    it('should create a test run without optional fields', () => {
      const testRun = new TestRun();

      testRun.id = 'run-minimal';
      testRun.name = 'Minimal Test Run';
      testRun.projectId = 'proj-123';
      testRun.status = TestRunStatus.NOT_STARTED;
      testRun.description = null;
      testRun.config = null;
      testRun.testPlanId = null;
      testRun.assigneeId = null;
      testRun.startedAt = null;
      testRun.completedAt = null;

      expect(testRun.name).toBe('Minimal Test Run');
      expect(testRun.description).toBeNull();
      expect(testRun.config).toBeNull();
      expect(testRun.testPlanId).toBeNull();
      expect(testRun.assigneeId).toBeNull();
      expect(testRun.startedAt).toBeNull();
      expect(testRun.completedAt).toBeNull();
    });
  });
});

describe('TestRunStatus Enum', () => {
  it('should have NOT_STARTED value', () => {
    expect(TestRunStatus.NOT_STARTED).toBe('not_started');
  });

  it('should have IN_PROGRESS value', () => {
    expect(TestRunStatus.IN_PROGRESS).toBe('in_progress');
  });

  it('should have COMPLETED value', () => {
    expect(TestRunStatus.COMPLETED).toBe('completed');
  });

  it('should have ABORTED value', () => {
    expect(TestRunStatus.ABORTED).toBe('aborted');
  });
});
