import { RequirementCoverage } from './requirement-coverage.entity';
import { Requirement, RequirementStatus, RequirementSource } from './requirement.entity';
import { TestCase } from '../../test-cases/entities/test-case.entity';

describe('RequirementCoverage Entity', () => {
  it('should create a requirement coverage instance', () => {
    const coverage = new RequirementCoverage();

    coverage.id = 'coverage-123';
    coverage.requirementId = 'req-456';
    coverage.testCaseId = 'tc-789';
    coverage.createdBy = 'user-001';
    coverage.createdAt = new Date('2024-01-01');

    expect(coverage.id).toBe('coverage-123');
    expect(coverage.requirementId).toBe('req-456');
    expect(coverage.testCaseId).toBe('tc-789');
    expect(coverage.createdBy).toBe('user-001');
    expect(coverage.createdAt).toEqual(new Date('2024-01-01'));
  });

  describe('requirementId field', () => {
    it('should support requirementId', () => {
      const coverage = new RequirementCoverage();
      coverage.requirementId = 'req-123';

      expect(coverage.requirementId).toBe('req-123');
    });

    it('should support different requirementId values', () => {
      const coverage = new RequirementCoverage();

      coverage.requirementId = 'req-001';
      expect(coverage.requirementId).toBe('req-001');

      coverage.requirementId = 'req-002';
      expect(coverage.requirementId).toBe('req-002');
    });
  });

  describe('testCaseId field', () => {
    it('should support testCaseId', () => {
      const coverage = new RequirementCoverage();
      coverage.testCaseId = 'tc-123';

      expect(coverage.testCaseId).toBe('tc-123');
    });

    it('should support different testCaseId values', () => {
      const coverage = new RequirementCoverage();

      coverage.testCaseId = 'tc-001';
      expect(coverage.testCaseId).toBe('tc-001');

      coverage.testCaseId = 'tc-002';
      expect(coverage.testCaseId).toBe('tc-002');
    });
  });

  describe('createdBy field', () => {
    it('should support createdBy', () => {
      const coverage = new RequirementCoverage();
      coverage.createdBy = 'user-123';

      expect(coverage.createdBy).toBe('user-123');
    });

    it('should support null createdBy', () => {
      const coverage = new RequirementCoverage();
      coverage.createdBy = null;

      expect(coverage.createdBy).toBeNull();
    });
  });

  describe('createdAt field', () => {
    it('should have createdAt timestamp', () => {
      const coverage = new RequirementCoverage();
      coverage.createdAt = new Date('2024-01-01T10:00:00Z');

      expect(coverage.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });
  });

  describe('requirement relation', () => {
    it('should have requirement relation', () => {
      const coverage = new RequirementCoverage();
      const requirement = new Requirement();
      requirement.id = 'req-123';
      requirement.title = 'Login Requirement';
      requirement.source = RequirementSource.JIRA;
      requirement.status = RequirementStatus.APPROVED;

      coverage.requirementId = requirement.id;
      coverage.requirement = requirement;

      expect(coverage.requirement).toBe(requirement);
      expect(coverage.requirement.id).toBe('req-123');
      expect(coverage.requirement.title).toBe('Login Requirement');
      expect(coverage.requirementId).toBe(requirement.id);
    });
  });

  describe('testCase relation', () => {
    it('should have testCase relation', () => {
      const coverage = new RequirementCoverage();
      const testCase = new TestCase();
      testCase.id = 'tc-123';
      testCase.title = 'Test login functionality';

      coverage.testCaseId = testCase.id;
      coverage.testCase = testCase;

      expect(coverage.testCase).toBe(testCase);
      expect(coverage.testCase.id).toBe('tc-123');
      expect(coverage.testCase.title).toBe('Test login functionality');
      expect(coverage.testCaseId).toBe(testCase.id);
    });
  });

  describe('complete coverage scenario', () => {
    it('should create a fully populated coverage entry', () => {
      const coverage = new RequirementCoverage();
      const requirement = new Requirement();
      const testCase = new TestCase();

      requirement.id = 'req-123';
      requirement.title = 'Authentication Requirement';

      testCase.id = 'tc-456';
      testCase.title = 'Verify user login';

      coverage.id = 'coverage-789';
      coverage.requirementId = requirement.id;
      coverage.requirement = requirement;
      coverage.testCaseId = testCase.id;
      coverage.testCase = testCase;
      coverage.createdBy = 'user-001';
      coverage.createdAt = new Date('2024-01-01');

      expect(coverage.id).toBe('coverage-789');
      expect(coverage.requirement.title).toBe('Authentication Requirement');
      expect(coverage.testCase.title).toBe('Verify user login');
      expect(coverage.createdBy).toBe('user-001');
      expect(coverage.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('should create a coverage entry without createdBy', () => {
      const coverage = new RequirementCoverage();

      coverage.id = 'coverage-minimal';
      coverage.requirementId = 'req-123';
      coverage.testCaseId = 'tc-456';
      coverage.createdBy = null;
      coverage.createdAt = new Date('2024-01-01');

      expect(coverage.id).toBe('coverage-minimal');
      expect(coverage.requirementId).toBe('req-123');
      expect(coverage.testCaseId).toBe('tc-456');
      expect(coverage.createdBy).toBeNull();
    });

    it('should support multiple coverages for same requirement', () => {
      const requirement = new Requirement();
      requirement.id = 'req-123';

      const coverage1 = new RequirementCoverage();
      coverage1.id = 'coverage-1';
      coverage1.requirementId = requirement.id;
      coverage1.testCaseId = 'tc-001';

      const coverage2 = new RequirementCoverage();
      coverage2.id = 'coverage-2';
      coverage2.requirementId = requirement.id;
      coverage2.testCaseId = 'tc-002';

      const coverage3 = new RequirementCoverage();
      coverage3.id = 'coverage-3';
      coverage3.requirementId = requirement.id;
      coverage3.testCaseId = 'tc-003';

      requirement.coverages = [coverage1, coverage2, coverage3];

      expect(requirement.coverages).toHaveLength(3);
      expect(requirement.coverages[0].testCaseId).toBe('tc-001');
      expect(requirement.coverages[1].testCaseId).toBe('tc-002');
      expect(requirement.coverages[2].testCaseId).toBe('tc-003');
    });
  });
});
