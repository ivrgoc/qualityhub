import { describe, it, expect } from 'vitest';
import type {
  User,
  Organization,
  Project,
  ProjectSettings,
  ProjectMember,
  CreateProjectDto,
  AddProjectMemberDto,
  TestCase,
  TestRun,
  TestResult,
  CreateTestCaseDto,
} from '../entities';
import { ProjectRole, PROJECT_ROLE_VALUES, isProjectRole } from '../entities';
import { UserRole, TestStatus, Priority, TestCaseTemplate } from '../enums';

describe('Entity types', () => {
  describe('User', () => {
    it('should accept valid user object', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(user.id).toBe('123');
      expect(user.role).toBe(UserRole.TESTER);
    });
  });

  describe('Organization', () => {
    it('should accept valid organization object', () => {
      const org: Organization = {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        plan: 'pro',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(org.slug).toBe('test-org');
    });
  });

  describe('Project', () => {
    it('should accept valid project object', () => {
      const project: Project = {
        id: 'proj-1',
        orgId: 'org-1',
        name: 'Test Project',
        description: 'A test project',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(project.name).toBe('Test Project');
    });

    it('should accept project with optional settings', () => {
      const settings: ProjectSettings = {
        defaultPriority: 'medium',
        allowedStatuses: ['passed', 'failed', 'blocked'],
        customFields: { severity: 'string' },
      };

      const project: Project = {
        id: 'proj-1',
        orgId: 'org-1',
        name: 'Test Project',
        description: 'A test project',
        settings,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(project.settings?.defaultPriority).toBe('medium');
      expect(project.settings?.allowedStatuses).toHaveLength(3);
    });

    it('should accept project with deletedAt for soft delete', () => {
      const project: Project = {
        id: 'proj-1',
        orgId: 'org-1',
        name: 'Deleted Project',
        description: 'A deleted project',
        createdAt: '2024-01-01T00:00:00.000Z',
        deletedAt: '2024-06-01T00:00:00.000Z',
      };

      expect(project.deletedAt).toBeDefined();
    });
  });

  describe('ProjectRole', () => {
    it('should have all expected role values', () => {
      expect(ProjectRole.VIEWER).toBe('viewer');
      expect(ProjectRole.TESTER).toBe('tester');
      expect(ProjectRole.LEAD).toBe('lead');
      expect(ProjectRole.ADMIN).toBe('admin');
    });

    it('should export PROJECT_ROLE_VALUES array', () => {
      expect(PROJECT_ROLE_VALUES).toContain('viewer');
      expect(PROJECT_ROLE_VALUES).toContain('tester');
      expect(PROJECT_ROLE_VALUES).toContain('lead');
      expect(PROJECT_ROLE_VALUES).toContain('admin');
      expect(PROJECT_ROLE_VALUES).toHaveLength(4);
    });

    it('should validate project roles with isProjectRole', () => {
      expect(isProjectRole('viewer')).toBe(true);
      expect(isProjectRole('tester')).toBe(true);
      expect(isProjectRole('lead')).toBe(true);
      expect(isProjectRole('admin')).toBe(true);
      expect(isProjectRole('invalid')).toBe(false);
      expect(isProjectRole(123)).toBe(false);
      expect(isProjectRole(null)).toBe(false);
    });
  });

  describe('ProjectMember', () => {
    it('should accept valid project member object', () => {
      const member: ProjectMember = {
        id: 'member-1',
        projectId: 'proj-1',
        userId: 'user-1',
        role: ProjectRole.TESTER,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(member.role).toBe(ProjectRole.TESTER);
      expect(member.projectId).toBe('proj-1');
      expect(member.userId).toBe('user-1');
    });

    it('should accept project member with admin role', () => {
      const member: ProjectMember = {
        id: 'member-2',
        projectId: 'proj-1',
        userId: 'user-2',
        role: ProjectRole.ADMIN,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(member.role).toBe(ProjectRole.ADMIN);
    });
  });

  describe('CreateProjectDto', () => {
    it('should accept minimal create project DTO', () => {
      const dto: CreateProjectDto = {
        name: 'New Project',
      };

      expect(dto.name).toBe('New Project');
    });

    it('should accept full create project DTO with settings', () => {
      const dto: CreateProjectDto = {
        name: 'New Project',
        description: 'A new project',
        settings: {
          defaultPriority: 'high',
          allowedStatuses: ['passed', 'failed'],
        },
      };

      expect(dto.settings?.defaultPriority).toBe('high');
    });
  });

  describe('AddProjectMemberDto', () => {
    it('should accept valid add member DTO', () => {
      const dto: AddProjectMemberDto = {
        userId: 'user-1',
        role: ProjectRole.LEAD,
      };

      expect(dto.userId).toBe('user-1');
      expect(dto.role).toBe(ProjectRole.LEAD);
    });
  });

  describe('TestCase', () => {
    it('should accept valid test case object', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        sectionId: 'section-1',
        title: 'Login test',
        templateType: TestCaseTemplate.STEPS,
        steps: [
          { id: 'step-1', content: 'Enter username', expected: 'Field accepts input' },
          { id: 'step-2', content: 'Enter password', expected: 'Field accepts input' },
        ],
        priority: Priority.HIGH,
        version: 1,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(testCase.steps).toHaveLength(2);
      expect(testCase.priority).toBe(Priority.HIGH);
    });

    it('should accept test case with optional fields', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        sectionId: 'section-1',
        title: 'Login test',
        templateType: TestCaseTemplate.TEXT,
        preconditions: 'User is logged out',
        steps: [],
        expectedResult: 'User is logged in',
        priority: Priority.MEDIUM,
        estimate: 30,
        version: 1,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(testCase.preconditions).toBe('User is logged out');
      expect(testCase.estimate).toBe(30);
    });
  });

  describe('CreateTestCaseDto', () => {
    it('should accept minimal create DTO', () => {
      const dto: CreateTestCaseDto = {
        sectionId: 'section-1',
        title: 'New test case',
      };

      expect(dto.title).toBe('New test case');
    });

    it('should accept full create DTO', () => {
      const dto: CreateTestCaseDto = {
        sectionId: 'section-1',
        title: 'New test case',
        templateType: TestCaseTemplate.BDD,
        preconditions: 'Given a user',
        steps: [{ content: 'When user logs in', expected: 'Then user is authenticated' }],
        expectedResult: 'User is logged in',
        priority: Priority.CRITICAL,
        estimate: 60,
      };

      expect(dto.templateType).toBe(TestCaseTemplate.BDD);
    });
  });

  describe('TestRun', () => {
    it('should accept valid test run object', () => {
      const testRun: TestRun = {
        id: 'run-1',
        projectId: 'proj-1',
        name: 'Sprint 1 Regression',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(testRun.name).toBe('Sprint 1 Regression');
    });

    it('should accept test run with optional fields', () => {
      const testRun: TestRun = {
        id: 'run-1',
        projectId: 'proj-1',
        planId: 'plan-1',
        suiteId: 'suite-1',
        name: 'Sprint 1 Regression',
        description: 'Full regression for sprint 1',
        assigneeId: 'user-1',
        startedAt: '2024-01-01T10:00:00.000Z',
        completedAt: '2024-01-01T12:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(testRun.planId).toBe('plan-1');
      expect(testRun.completedAt).toBeDefined();
    });
  });

  describe('TestResult', () => {
    it('should accept valid test result object', () => {
      const result: TestResult = {
        id: 'result-1',
        runId: 'run-1',
        caseId: 'tc-1',
        caseVersion: 1,
        status: TestStatus.PASSED,
        executedBy: 'user-1',
        executedAt: '2024-01-01T11:00:00.000Z',
        createdAt: '2024-01-01T11:00:00.000Z',
      };

      expect(result.status).toBe(TestStatus.PASSED);
    });

    it('should accept test result with optional fields', () => {
      const result: TestResult = {
        id: 'result-1',
        runId: 'run-1',
        caseId: 'tc-1',
        caseVersion: 2,
        status: TestStatus.FAILED,
        comment: 'Button not clickable',
        elapsedSeconds: 120,
        executedBy: 'user-1',
        executedAt: '2024-01-01T11:00:00.000Z',
        createdAt: '2024-01-01T11:00:00.000Z',
      };

      expect(result.comment).toBe('Button not clickable');
      expect(result.elapsedSeconds).toBe(120);
    });
  });
});
