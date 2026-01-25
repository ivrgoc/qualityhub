import { TestResult, TestStatus } from './test-result.entity';
import { TestRun } from './test-run.entity';
import { TestCase } from '../../test-cases/entities/test-case.entity';

describe('TestResult Entity', () => {
  it('should create a test result instance', () => {
    const testResult = new TestResult();

    testResult.id = 'result-123';
    testResult.testRunId = 'run-456';
    testResult.testCaseId = 'case-789';
    testResult.testCaseVersion = 1;
    testResult.status = TestStatus.PASSED;
    testResult.comment = 'Test passed successfully';
    testResult.elapsedSeconds = 120;
    testResult.defects = ['BUG-001'];
    testResult.attachments = [{ filename: 'screenshot.png', path: '/uploads/screenshot.png' }];
    testResult.executedBy = 'user-001';
    testResult.executedAt = new Date('2024-01-01T10:00:00Z');
    testResult.createdAt = new Date('2024-01-01');
    testResult.updatedAt = new Date('2024-01-01');

    expect(testResult.id).toBe('result-123');
    expect(testResult.testRunId).toBe('run-456');
    expect(testResult.testCaseId).toBe('case-789');
    expect(testResult.testCaseVersion).toBe(1);
    expect(testResult.status).toBe(TestStatus.PASSED);
    expect(testResult.comment).toBe('Test passed successfully');
    expect(testResult.elapsedSeconds).toBe(120);
    expect(testResult.defects).toEqual(['BUG-001']);
    expect(testResult.attachments).toEqual([{ filename: 'screenshot.png', path: '/uploads/screenshot.png' }]);
    expect(testResult.executedBy).toBe('user-001');
    expect(testResult.executedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(testResult.createdAt).toEqual(new Date('2024-01-01'));
    expect(testResult.updatedAt).toEqual(new Date('2024-01-01'));
  });

  describe('status field', () => {
    it('should support UNTESTED status', () => {
      const testResult = new TestResult();
      testResult.status = TestStatus.UNTESTED;

      expect(testResult.status).toBe(TestStatus.UNTESTED);
    });

    it('should support PASSED status', () => {
      const testResult = new TestResult();
      testResult.status = TestStatus.PASSED;

      expect(testResult.status).toBe(TestStatus.PASSED);
    });

    it('should support FAILED status', () => {
      const testResult = new TestResult();
      testResult.status = TestStatus.FAILED;

      expect(testResult.status).toBe(TestStatus.FAILED);
    });

    it('should support BLOCKED status', () => {
      const testResult = new TestResult();
      testResult.status = TestStatus.BLOCKED;

      expect(testResult.status).toBe(TestStatus.BLOCKED);
    });

    it('should support RETEST status', () => {
      const testResult = new TestResult();
      testResult.status = TestStatus.RETEST;

      expect(testResult.status).toBe(TestStatus.RETEST);
    });

    it('should support SKIPPED status', () => {
      const testResult = new TestResult();
      testResult.status = TestStatus.SKIPPED;

      expect(testResult.status).toBe(TestStatus.SKIPPED);
    });

    it('should transition through status values', () => {
      const testResult = new TestResult();

      testResult.status = TestStatus.UNTESTED;
      expect(testResult.status).toBe(TestStatus.UNTESTED);

      testResult.status = TestStatus.PASSED;
      expect(testResult.status).toBe(TestStatus.PASSED);

      testResult.status = TestStatus.RETEST;
      expect(testResult.status).toBe(TestStatus.RETEST);
    });
  });

  describe('comment field', () => {
    it('should support comment', () => {
      const testResult = new TestResult();
      testResult.comment = 'Test execution notes';

      expect(testResult.comment).toBe('Test execution notes');
    });

    it('should support null comment', () => {
      const testResult = new TestResult();
      testResult.comment = null;

      expect(testResult.comment).toBeNull();
    });
  });

  describe('elapsedSeconds field', () => {
    it('should support elapsedSeconds', () => {
      const testResult = new TestResult();
      testResult.elapsedSeconds = 300;

      expect(testResult.elapsedSeconds).toBe(300);
    });

    it('should support null elapsedSeconds', () => {
      const testResult = new TestResult();
      testResult.elapsedSeconds = null;

      expect(testResult.elapsedSeconds).toBeNull();
    });

    it('should support zero elapsedSeconds', () => {
      const testResult = new TestResult();
      testResult.elapsedSeconds = 0;

      expect(testResult.elapsedSeconds).toBe(0);
    });
  });

  describe('defects field', () => {
    it('should support defects array', () => {
      const testResult = new TestResult();
      testResult.defects = ['BUG-001', 'BUG-002', 'BUG-003'];

      expect(testResult.defects).toEqual(['BUG-001', 'BUG-002', 'BUG-003']);
    });

    it('should support null defects', () => {
      const testResult = new TestResult();
      testResult.defects = null;

      expect(testResult.defects).toBeNull();
    });

    it('should support empty defects array', () => {
      const testResult = new TestResult();
      testResult.defects = [];

      expect(testResult.defects).toEqual([]);
    });

    it('should support single defect', () => {
      const testResult = new TestResult();
      testResult.defects = ['BUG-999'];

      expect(testResult.defects).toHaveLength(1);
      expect(testResult.defects[0]).toBe('BUG-999');
    });
  });

  describe('attachments field', () => {
    it('should support attachments array', () => {
      const testResult = new TestResult();
      testResult.attachments = [
        { filename: 'screenshot.png', path: '/uploads/1.png', size: 1024 },
        { filename: 'log.txt', path: '/uploads/2.txt', size: 512 },
      ];

      expect(testResult.attachments).toHaveLength(2);
      expect(testResult.attachments[0]).toEqual({ filename: 'screenshot.png', path: '/uploads/1.png', size: 1024 });
    });

    it('should support null attachments', () => {
      const testResult = new TestResult();
      testResult.attachments = null;

      expect(testResult.attachments).toBeNull();
    });

    it('should support empty attachments array', () => {
      const testResult = new TestResult();
      testResult.attachments = [];

      expect(testResult.attachments).toEqual([]);
    });
  });

  describe('testCaseVersion field', () => {
    it('should support testCaseVersion', () => {
      const testResult = new TestResult();
      testResult.testCaseVersion = 5;

      expect(testResult.testCaseVersion).toBe(5);
    });

    it('should default to version 1', () => {
      const testResult = new TestResult();
      testResult.testCaseVersion = 1;

      expect(testResult.testCaseVersion).toBe(1);
    });
  });

  describe('executedBy field', () => {
    it('should support executedBy', () => {
      const testResult = new TestResult();
      testResult.executedBy = 'user-123';

      expect(testResult.executedBy).toBe('user-123');
    });

    it('should support null executedBy', () => {
      const testResult = new TestResult();
      testResult.executedBy = null;

      expect(testResult.executedBy).toBeNull();
    });
  });

  describe('executedAt field', () => {
    it('should support executedAt timestamp', () => {
      const testResult = new TestResult();
      testResult.executedAt = new Date('2024-01-01T15:30:00Z');

      expect(testResult.executedAt).toEqual(new Date('2024-01-01T15:30:00Z'));
    });

    it('should support null executedAt', () => {
      const testResult = new TestResult();
      testResult.executedAt = null;

      expect(testResult.executedAt).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      const testResult = new TestResult();
      testResult.createdAt = new Date('2024-01-01T10:00:00Z');

      expect(testResult.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should have updatedAt timestamp', () => {
      const testResult = new TestResult();
      testResult.updatedAt = new Date('2024-01-02T10:00:00Z');

      expect(testResult.updatedAt).toEqual(new Date('2024-01-02T10:00:00Z'));
    });
  });

  describe('testRun relation', () => {
    it('should have testRun relation', () => {
      const testResult = new TestResult();
      const testRun = new TestRun();
      testRun.id = 'run-123';
      testRun.name = 'Test Run';

      testResult.testRunId = testRun.id;
      testResult.testRun = testRun;

      expect(testResult.testRun).toBe(testRun);
      expect(testResult.testRun.id).toBe('run-123');
      expect(testResult.testRun.name).toBe('Test Run');
      expect(testResult.testRunId).toBe(testRun.id);
    });
  });

  describe('testCase relation', () => {
    it('should have testCase relation', () => {
      const testResult = new TestResult();
      const testCase = new TestCase();
      testCase.id = 'case-123';
      testCase.title = 'Login Test';

      testResult.testCaseId = testCase.id;
      testResult.testCase = testCase;

      expect(testResult.testCase).toBe(testCase);
      expect(testResult.testCase.id).toBe('case-123');
      expect(testResult.testCase.title).toBe('Login Test');
      expect(testResult.testCaseId).toBe(testCase.id);
    });
  });

  describe('complete test result scenario', () => {
    it('should create a fully populated passed result', () => {
      const testResult = new TestResult();
      const testRun = new TestRun();
      const testCase = new TestCase();

      testRun.id = 'run-123';
      testRun.name = 'Regression Run';

      testCase.id = 'case-456';
      testCase.title = 'User Login';

      testResult.id = 'result-789';
      testResult.testRunId = testRun.id;
      testResult.testRun = testRun;
      testResult.testCaseId = testCase.id;
      testResult.testCase = testCase;
      testResult.testCaseVersion = 2;
      testResult.status = TestStatus.PASSED;
      testResult.comment = 'All assertions passed';
      testResult.elapsedSeconds = 45;
      testResult.defects = null;
      testResult.attachments = [{ filename: 'evidence.png', path: '/uploads/evidence.png' }];
      testResult.executedBy = 'user-001';
      testResult.executedAt = new Date('2024-01-01T10:00:00Z');
      testResult.createdAt = new Date('2024-01-01');
      testResult.updatedAt = new Date('2024-01-01');

      expect(testResult.id).toBe('result-789');
      expect(testResult.status).toBe(TestStatus.PASSED);
      expect(testResult.testRun.name).toBe('Regression Run');
      expect(testResult.testCase.title).toBe('User Login');
      expect(testResult.testCaseVersion).toBe(2);
      expect(testResult.elapsedSeconds).toBe(45);
      expect(testResult.defects).toBeNull();
    });

    it('should create a failed result with defects', () => {
      const testResult = new TestResult();

      testResult.id = 'result-failed';
      testResult.testRunId = 'run-123';
      testResult.testCaseId = 'case-456';
      testResult.testCaseVersion = 1;
      testResult.status = TestStatus.FAILED;
      testResult.comment = 'Assertion failed: expected 200, got 500';
      testResult.elapsedSeconds = 30;
      testResult.defects = ['BUG-100', 'BUG-101'];
      testResult.attachments = [
        { filename: 'error_log.txt', path: '/uploads/error.txt' },
        { filename: 'screenshot.png', path: '/uploads/screen.png' },
      ];
      testResult.executedBy = 'user-002';
      testResult.executedAt = new Date('2024-01-01T11:00:00Z');

      expect(testResult.status).toBe(TestStatus.FAILED);
      expect(testResult.defects).toHaveLength(2);
      expect(testResult.attachments).toHaveLength(2);
    });

    it('should create a blocked result', () => {
      const testResult = new TestResult();

      testResult.id = 'result-blocked';
      testResult.testRunId = 'run-123';
      testResult.testCaseId = 'case-789';
      testResult.testCaseVersion = 1;
      testResult.status = TestStatus.BLOCKED;
      testResult.comment = 'Blocked by BUG-050: Login not working';
      testResult.elapsedSeconds = null;
      testResult.defects = ['BUG-050'];
      testResult.attachments = null;
      testResult.executedBy = 'user-003';
      testResult.executedAt = new Date('2024-01-01T12:00:00Z');

      expect(testResult.status).toBe(TestStatus.BLOCKED);
      expect(testResult.elapsedSeconds).toBeNull();
      expect(testResult.defects).toEqual(['BUG-050']);
    });

    it('should create an untested result', () => {
      const testResult = new TestResult();

      testResult.id = 'result-untested';
      testResult.testRunId = 'run-123';
      testResult.testCaseId = 'case-111';
      testResult.testCaseVersion = 1;
      testResult.status = TestStatus.UNTESTED;
      testResult.comment = null;
      testResult.elapsedSeconds = null;
      testResult.defects = null;
      testResult.attachments = null;
      testResult.executedBy = null;
      testResult.executedAt = null;

      expect(testResult.status).toBe(TestStatus.UNTESTED);
      expect(testResult.comment).toBeNull();
      expect(testResult.executedBy).toBeNull();
      expect(testResult.executedAt).toBeNull();
    });
  });
});

describe('TestStatus Enum', () => {
  it('should have UNTESTED value', () => {
    expect(TestStatus.UNTESTED).toBe('untested');
  });

  it('should have PASSED value', () => {
    expect(TestStatus.PASSED).toBe('passed');
  });

  it('should have FAILED value', () => {
    expect(TestStatus.FAILED).toBe('failed');
  });

  it('should have BLOCKED value', () => {
    expect(TestStatus.BLOCKED).toBe('blocked');
  });

  it('should have RETEST value', () => {
    expect(TestStatus.RETEST).toBe('retest');
  });

  it('should have SKIPPED value', () => {
    expect(TestStatus.SKIPPED).toBe('skipped');
  });
});
