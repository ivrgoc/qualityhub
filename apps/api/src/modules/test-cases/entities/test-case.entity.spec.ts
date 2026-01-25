import { TestCase, TestCaseTemplate, Priority } from './test-case.entity';
import { Project } from '../../projects/entities/project.entity';
import { Section } from '../../test-suites/entities/section.entity';

describe('TestCase Entity', () => {
  it('should create a test case instance', () => {
    const testCase = new TestCase();

    testCase.id = 'tc-123';
    testCase.title = 'Login with valid credentials';
    testCase.templateType = TestCaseTemplate.STEPS;
    testCase.preconditions = 'User is on login page';
    testCase.steps = [
      { step: 1, action: 'Enter username', expected: 'Username entered' },
      { step: 2, action: 'Enter password', expected: 'Password entered' },
    ];
    testCase.expectedResult = 'User is logged in';
    testCase.priority = Priority.HIGH;
    testCase.estimate = 5;
    testCase.version = 1;
    testCase.projectId = 'proj-456';
    testCase.sectionId = 'section-789';
    testCase.createdBy = 'user-123';
    testCase.createdAt = new Date('2024-01-01');
    testCase.updatedAt = new Date('2024-01-02');
    testCase.deletedAt = null;

    expect(testCase.id).toBe('tc-123');
    expect(testCase.title).toBe('Login with valid credentials');
    expect(testCase.templateType).toBe(TestCaseTemplate.STEPS);
    expect(testCase.preconditions).toBe('User is on login page');
    expect(testCase.steps).toHaveLength(2);
    expect(testCase.expectedResult).toBe('User is logged in');
    expect(testCase.priority).toBe(Priority.HIGH);
    expect(testCase.estimate).toBe(5);
    expect(testCase.version).toBe(1);
    expect(testCase.projectId).toBe('proj-456');
    expect(testCase.sectionId).toBe('section-789');
    expect(testCase.createdBy).toBe('user-123');
    expect(testCase.createdAt).toEqual(new Date('2024-01-01'));
    expect(testCase.updatedAt).toEqual(new Date('2024-01-02'));
    expect(testCase.deletedAt).toBeNull();
  });

  describe('TestCaseTemplate enum', () => {
    it('should have correct template values', () => {
      expect(TestCaseTemplate.STEPS).toBe('steps');
      expect(TestCaseTemplate.TEXT).toBe('text');
      expect(TestCaseTemplate.BDD).toBe('bdd');
      expect(TestCaseTemplate.EXPLORATORY).toBe('exploratory');
    });

    it('should support all template types', () => {
      const testCase = new TestCase();

      testCase.templateType = TestCaseTemplate.STEPS;
      expect(testCase.templateType).toBe('steps');

      testCase.templateType = TestCaseTemplate.TEXT;
      expect(testCase.templateType).toBe('text');

      testCase.templateType = TestCaseTemplate.BDD;
      expect(testCase.templateType).toBe('bdd');

      testCase.templateType = TestCaseTemplate.EXPLORATORY;
      expect(testCase.templateType).toBe('exploratory');
    });
  });

  describe('Priority enum', () => {
    it('should have correct priority values', () => {
      expect(Priority.CRITICAL).toBe('critical');
      expect(Priority.HIGH).toBe('high');
      expect(Priority.MEDIUM).toBe('medium');
      expect(Priority.LOW).toBe('low');
    });

    it('should support all priority levels', () => {
      const testCase = new TestCase();

      testCase.priority = Priority.CRITICAL;
      expect(testCase.priority).toBe('critical');

      testCase.priority = Priority.HIGH;
      expect(testCase.priority).toBe('high');

      testCase.priority = Priority.MEDIUM;
      expect(testCase.priority).toBe('medium');

      testCase.priority = Priority.LOW;
      expect(testCase.priority).toBe('low');
    });
  });

  describe('steps (JSONB)', () => {
    it('should store steps as array of objects', () => {
      const testCase = new TestCase();
      testCase.steps = [
        { step: 1, action: 'Navigate to login page', expected: 'Login page displayed' },
        { step: 2, action: 'Enter username', expected: 'Username entered' },
        { step: 3, action: 'Enter password', expected: 'Password entered' },
        { step: 4, action: 'Click login button', expected: 'User logged in' },
      ];

      expect(testCase.steps).toHaveLength(4);
      expect(testCase.steps[0].step).toBe(1);
      expect(testCase.steps[0].action).toBe('Navigate to login page');
      expect(testCase.steps[3].expected).toBe('User logged in');
    });

    it('should handle empty steps array', () => {
      const testCase = new TestCase();
      testCase.steps = [];

      expect(testCase.steps).toHaveLength(0);
      expect(testCase.steps).toEqual([]);
    });

    it('should handle null steps', () => {
      const testCase = new TestCase();
      testCase.steps = null;

      expect(testCase.steps).toBeNull();
    });

    it('should support complex step objects', () => {
      const testCase = new TestCase();
      testCase.steps = [
        {
          step: 1,
          action: 'Upload file',
          expected: 'File uploaded',
          attachments: ['screenshot.png'],
          notes: 'Ensure file is less than 5MB',
        },
      ];

      expect(testCase.steps[0].attachments).toHaveLength(1);
      expect(testCase.steps[0].notes).toBe('Ensure file is less than 5MB');
    });
  });

  describe('version field', () => {
    it('should support version tracking', () => {
      const testCase = new TestCase();
      testCase.version = 1;

      expect(testCase.version).toBe(1);

      testCase.version = 2;
      expect(testCase.version).toBe(2);
    });

    it('should start at version 1', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'New test case';
      testCase.version = 1;

      expect(testCase.version).toBe(1);
    });

    it('should support incrementing versions', () => {
      const versions = [1, 2, 3, 4, 5];
      const testCase = new TestCase();

      versions.forEach((v) => {
        testCase.version = v;
        expect(testCase.version).toBe(v);
      });
    });
  });

  describe('soft delete', () => {
    it('should support soft delete with deletedAt', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test to delete';
      testCase.deletedAt = null;

      expect(testCase.deletedAt).toBeNull();

      testCase.deletedAt = new Date('2024-06-01');

      expect(testCase.deletedAt).toEqual(new Date('2024-06-01'));
    });

    it('should handle active test case (not deleted)', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Active test case';
      testCase.deletedAt = null;

      const isDeleted = testCase.deletedAt !== null;

      expect(isDeleted).toBe(false);
    });

    it('should identify deleted test case', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Deleted test case';
      testCase.deletedAt = new Date('2024-06-01');

      const isDeleted = testCase.deletedAt !== null;

      expect(isDeleted).toBe(true);
    });
  });

  describe('project relation', () => {
    it('should have project relation', () => {
      const testCase = new TestCase();
      const project = new Project();
      project.id = 'proj-123';
      project.name = 'Test Project';

      testCase.projectId = project.id;
      testCase.project = project;

      expect(testCase.project).toBe(project);
      expect(testCase.project.id).toBe('proj-123');
      expect(testCase.project.name).toBe('Test Project');
      expect(testCase.projectId).toBe(project.id);
    });
  });

  describe('section relation', () => {
    it('should have section relation', () => {
      const testCase = new TestCase();
      const section = new Section();
      section.id = 'section-123';
      section.name = 'Login Tests';

      testCase.sectionId = section.id;
      testCase.section = section;

      expect(testCase.section).toBe(section);
      expect(testCase.section.id).toBe('section-123');
      expect(testCase.section.name).toBe('Login Tests');
      expect(testCase.sectionId).toBe(section.id);
    });

    it('should support nullable section', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test without section';
      testCase.sectionId = null;
      testCase.section = null;

      expect(testCase.sectionId).toBeNull();
      expect(testCase.section).toBeNull();
    });
  });

  describe('customFields (JSONB)', () => {
    it('should store custom fields as JSON object', () => {
      const testCase = new TestCase();
      testCase.customFields = {
        team: 'QA',
        sprint: 10,
        tags: ['regression', 'smoke'],
      };

      expect(testCase.customFields.team).toBe('QA');
      expect(testCase.customFields.sprint).toBe(10);
      expect((testCase.customFields.tags as string[])).toHaveLength(2);
    });

    it('should handle null custom fields', () => {
      const testCase = new TestCase();
      testCase.customFields = null;

      expect(testCase.customFields).toBeNull();
    });

    it('should support nested custom fields', () => {
      const testCase = new TestCase();
      testCase.customFields = {
        metadata: {
          created: '2024-01-01',
          source: 'imported',
          nested: {
            level: 'deep',
          },
        },
      };

      const metadata = testCase.customFields.metadata as Record<string, unknown>;
      expect(metadata.source).toBe('imported');
      expect((metadata.nested as Record<string, unknown>).level).toBe('deep');
    });
  });

  describe('optional fields', () => {
    it('should support optional preconditions', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test without preconditions';

      expect(testCase.preconditions).toBeUndefined();
    });

    it('should support optional expected result', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test without expected result';

      expect(testCase.expectedResult).toBeUndefined();
    });

    it('should support optional estimate', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test without estimate';

      expect(testCase.estimate).toBeUndefined();
    });

    it('should support optional createdBy', () => {
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test without createdBy';

      expect(testCase.createdBy).toBeUndefined();
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const testCase = new TestCase();
      testCase.createdAt = new Date('2024-01-01T10:00:00Z');
      testCase.updatedAt = new Date('2024-01-02T15:30:00Z');

      expect(testCase.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(testCase.updatedAt).toEqual(new Date('2024-01-02T15:30:00Z'));
    });

    it('should support tracking update timestamps', () => {
      const testCase = new TestCase();
      testCase.createdAt = new Date('2024-01-01');
      testCase.updatedAt = new Date('2024-01-01');

      testCase.updatedAt = new Date('2024-02-15');

      expect(testCase.createdAt).toEqual(new Date('2024-01-01'));
      expect(testCase.updatedAt).toEqual(new Date('2024-02-15'));
    });
  });

  describe('complete test case scenario', () => {
    it('should create a fully populated test case', () => {
      const testCase = new TestCase();
      const project = new Project();
      const section = new Section();

      project.id = 'proj-123';
      project.name = 'E-Commerce Project';

      section.id = 'section-456';
      section.name = 'Authentication';

      testCase.id = 'tc-789';
      testCase.title = 'Verify user can login with valid credentials';
      testCase.templateType = TestCaseTemplate.STEPS;
      testCase.preconditions = 'User has a registered account';
      testCase.steps = [
        { step: 1, action: 'Navigate to login page', expected: 'Login form displayed' },
        { step: 2, action: 'Enter valid email', expected: 'Email entered' },
        { step: 3, action: 'Enter valid password', expected: 'Password entered' },
        { step: 4, action: 'Click submit', expected: 'User redirected to dashboard' },
      ];
      testCase.expectedResult = 'User is successfully authenticated and redirected to dashboard';
      testCase.priority = Priority.HIGH;
      testCase.estimate = 10;
      testCase.customFields = { category: 'smoke', automated: false };
      testCase.version = 1;
      testCase.projectId = project.id;
      testCase.project = project;
      testCase.sectionId = section.id;
      testCase.section = section;
      testCase.createdBy = 'user-001';
      testCase.createdAt = new Date('2024-01-01');
      testCase.updatedAt = new Date('2024-01-01');
      testCase.deletedAt = null;

      expect(testCase.id).toBe('tc-789');
      expect(testCase.title).toBe('Verify user can login with valid credentials');
      expect(testCase.templateType).toBe(TestCaseTemplate.STEPS);
      expect(testCase.preconditions).toBe('User has a registered account');
      expect(testCase.steps).toHaveLength(4);
      expect(testCase.expectedResult).toContain('successfully authenticated');
      expect(testCase.priority).toBe(Priority.HIGH);
      expect(testCase.estimate).toBe(10);
      expect(testCase.customFields.category).toBe('smoke');
      expect(testCase.version).toBe(1);
      expect(testCase.project.name).toBe('E-Commerce Project');
      expect(testCase.section.name).toBe('Authentication');
      expect(testCase.createdBy).toBe('user-001');
      expect(testCase.deletedAt).toBeNull();
    });
  });
});
