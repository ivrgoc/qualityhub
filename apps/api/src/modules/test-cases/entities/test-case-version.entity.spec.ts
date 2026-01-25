import { TestCaseVersion } from './test-case-version.entity';
import { TestCase, TestCaseTemplate, Priority } from './test-case.entity';

describe('TestCaseVersion Entity', () => {
  it('should create a test case version instance', () => {
    const version = new TestCaseVersion();

    version.id = 'version-123';
    version.testCaseId = 'tc-456';
    version.version = 1;
    version.data = {
      title: 'Login with valid credentials',
      templateType: TestCaseTemplate.STEPS,
      priority: Priority.HIGH,
    };
    version.changedBy = 'user-789';
    version.createdAt = new Date('2024-01-01');

    expect(version.id).toBe('version-123');
    expect(version.testCaseId).toBe('tc-456');
    expect(version.version).toBe(1);
    expect(version.data.title).toBe('Login with valid credentials');
    expect(version.changedBy).toBe('user-789');
    expect(version.createdAt).toEqual(new Date('2024-01-01'));
  });

  it('should have test case relation', () => {
    const version = new TestCaseVersion();
    const testCase = new TestCase();
    testCase.id = 'tc-123';
    testCase.title = 'Test Case';

    version.testCaseId = testCase.id;
    version.testCase = testCase;

    expect(version.testCase).toBe(testCase);
    expect(version.testCase.id).toBe('tc-123');
    expect(version.testCase.title).toBe('Test Case');
    expect(version.testCaseId).toBe(testCase.id);
  });

  it('should store complete test case data snapshot', () => {
    const version = new TestCaseVersion();

    const snapshotData: Record<string, unknown> = {
      title: 'Login with valid credentials',
      templateType: TestCaseTemplate.STEPS,
      preconditions: 'User is on login page',
      steps: [
        { step: 1, action: 'Enter username', expected: 'Username entered' },
        { step: 2, action: 'Enter password', expected: 'Password entered' },
        { step: 3, action: 'Click login', expected: 'User logged in' },
      ],
      expectedResult: 'User is redirected to dashboard',
      priority: Priority.HIGH,
      estimate: 5,
      customFields: { team: 'QA', sprint: 10 },
      sectionId: 'section-123',
    };

    version.data = snapshotData;

    expect(version.data.title).toBe('Login with valid credentials');
    expect(version.data.templateType).toBe(TestCaseTemplate.STEPS);
    expect(version.data.preconditions).toBe('User is on login page');
    expect(version.data.steps).toHaveLength(3);
    expect(version.data.expectedResult).toBe('User is redirected to dashboard');
    expect(version.data.priority).toBe(Priority.HIGH);
    expect(version.data.estimate).toBe(5);
    expect(version.data.customFields).toEqual({ team: 'QA', sprint: 10 });
    expect(version.data.sectionId).toBe('section-123');
  });

  it('should handle nullable changedBy field', () => {
    const version = new TestCaseVersion();
    version.id = 'version-123';
    version.testCaseId = 'tc-456';
    version.version = 1;
    version.data = { title: 'Test' };
    version.changedBy = null;

    expect(version.changedBy).toBeNull();
  });

  it('should support multiple versions for a test case', () => {
    const versions = [
      {
        id: 'version-1',
        testCaseId: 'tc-123',
        version: 1,
        data: { title: 'Original title' },
        changedBy: 'user-1',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'version-2',
        testCaseId: 'tc-123',
        version: 2,
        data: { title: 'Updated title' },
        changedBy: 'user-2',
        createdAt: new Date('2024-01-02'),
      },
      {
        id: 'version-3',
        testCaseId: 'tc-123',
        version: 3,
        data: { title: 'Final title' },
        changedBy: 'user-1',
        createdAt: new Date('2024-01-03'),
      },
    ].map((data) => {
      const version = new TestCaseVersion();
      Object.assign(version, data);
      return version;
    });

    expect(versions).toHaveLength(3);
    expect(versions[0].version).toBe(1);
    expect(versions[1].version).toBe(2);
    expect(versions[2].version).toBe(3);

    const sorted = versions.sort((a, b) => b.version - a.version);
    expect(sorted[0].data.title).toBe('Final title');
  });

  it('should handle empty data object', () => {
    const version = new TestCaseVersion();
    version.id = 'version-123';
    version.testCaseId = 'tc-456';
    version.version = 1;
    version.data = {};

    expect(version.data).toEqual({});
  });

  it('should preserve nested objects in data', () => {
    const version = new TestCaseVersion();

    version.data = {
      customFields: {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      },
    };

    expect(
      (version.data.customFields as Record<string, unknown>).level1,
    ).toBeDefined();
    expect(
      (
        (version.data.customFields as Record<string, unknown>)
          .level1 as Record<string, unknown>
      ).level2,
    ).toBeDefined();
    expect(
      (
        (
          (version.data.customFields as Record<string, unknown>)
            .level1 as Record<string, unknown>
        ).level2 as Record<string, unknown>
      ).level3,
    ).toBe('deep value');
  });

  it('should handle arrays in data', () => {
    const version = new TestCaseVersion();

    version.data = {
      steps: [
        { step: 1, action: 'Step 1' },
        { step: 2, action: 'Step 2' },
      ],
      tags: ['regression', 'smoke', 'critical'],
    };

    expect(version.data.steps).toHaveLength(2);
    expect(version.data.tags).toHaveLength(3);
    expect((version.data.tags as string[])[0]).toBe('regression');
  });
});
