import { describe, it, expect } from 'vitest';

// Import everything from the main index to verify all exports work
import {
  // Enums
  TestStatus,
  TEST_STATUS_VALUES,
  isTestStatus,
  TestCaseTemplate,
  TEST_CASE_TEMPLATE_VALUES,
  isTestCaseTemplate,
  Priority,
  PRIORITY_VALUES,
  isPriority,
  UserRole,
  USER_ROLE_VALUES,
  isUserRole,
  // Entity enums
  ProjectRole,
  PROJECT_ROLE_VALUES,
  isProjectRole,
  // API constants and functions
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  isApiError,
  isValidationError,
  // API Response functions
  isErrorResponse,
  isApiResponse,
  isPaginatedResponse,
} from '../index';

import type {
  // Entities - import as namespace to verify exports without unused var warnings
  User,
  CreateUserDto,
  UpdateUserDto,
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Project,
  ProjectSettings,
  ProjectMember,
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  TestStep,
  CreateTestStepDto,
  TestCase,
  CreateTestCaseDto,
  UpdateTestCaseDto,
  TestSuite,
  CreateTestSuiteDto,
  UpdateTestSuiteDto,
  Section,
  CreateSectionDto,
  UpdateSectionDto,
  Milestone,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  TestPlan,
  CreateTestPlanDto,
  UpdateTestPlanDto,
  TestRun,
  CreateTestRunDto,
  UpdateTestRunDto,
  TestResult,
  CreateTestResultDto,
  UpdateTestResultDto,
  Requirement,
  CreateRequirementDto,
  UpdateRequirementDto,
  Attachment,
  CreateAttachmentDto,
  // API Types
  PaginatedResponse,
  PaginationParams,
  ApiError,
  ValidationError,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  // API Response Types
  ApiResponse,
  ErrorResponse,
  PaginatedApiResponse,
} from '../index';

// Helper to verify type exports exist (compile-time check)
function assertType<T>(_value: T): void {
  // This function exists only to verify types are exported correctly
}

describe('index exports', () => {
  describe('Enum exports', () => {
    it('should export TestStatus enum and helpers', () => {
      expect(TestStatus).toBeDefined();
      expect(TestStatus.PASSED).toBe('passed');
      expect(TEST_STATUS_VALUES).toContain('passed');
      expect(isTestStatus('passed')).toBe(true);
    });

    it('should export TestCaseTemplate enum and helpers', () => {
      expect(TestCaseTemplate).toBeDefined();
      expect(TestCaseTemplate.STEPS).toBe('steps');
      expect(TEST_CASE_TEMPLATE_VALUES).toContain('steps');
      expect(isTestCaseTemplate('steps')).toBe(true);
    });

    it('should export Priority enum and helpers', () => {
      expect(Priority).toBeDefined();
      expect(Priority.HIGH).toBe('high');
      expect(PRIORITY_VALUES).toContain('high');
      expect(isPriority('high')).toBe(true);
    });

    it('should export UserRole enum and helpers', () => {
      expect(UserRole).toBeDefined();
      expect(UserRole.ADMIN).toBe('admin');
      expect(USER_ROLE_VALUES).toContain('admin');
      expect(isUserRole('admin')).toBe(true);
    });

    it('should export ProjectRole enum and helpers', () => {
      expect(ProjectRole).toBeDefined();
      expect(ProjectRole.LEAD).toBe('lead');
      expect(PROJECT_ROLE_VALUES).toContain('lead');
      expect(isProjectRole('lead')).toBe(true);
    });
  });

  describe('Entity type exports', () => {
    it('should export User types', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.TESTER,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(user.id).toBe('1');

      const createDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      expect(createDto.email).toBe('new@example.com');

      const updateDto: UpdateUserDto = {
        name: 'Updated User',
      };
      assertType<UpdateUserDto>(updateDto);
    });

    it('should export Organization types', () => {
      const org: Organization = {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        plan: 'pro',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(org.slug).toBe('test-org');

      const createDto: CreateOrganizationDto = {
        name: 'New Org',
        slug: 'new-org',
      };
      assertType<CreateOrganizationDto>(createDto);

      const updateDto: UpdateOrganizationDto = {
        name: 'Updated Org',
      };
      assertType<UpdateOrganizationDto>(updateDto);
    });

    it('should export Project types including ProjectSettings and ProjectMember', () => {
      const settings: ProjectSettings = {
        defaultPriority: 'medium',
        allowedStatuses: ['passed', 'failed'],
      };
      expect(settings.defaultPriority).toBe('medium');

      const project: Project = {
        id: 'proj-1',
        orgId: 'org-1',
        name: 'Test Project',
        description: 'A test project',
        settings,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(project.name).toBe('Test Project');

      const createDto: CreateProjectDto = {
        name: 'New Project',
        description: 'A new project',
      };
      assertType<CreateProjectDto>(createDto);

      const updateDto: UpdateProjectDto = {
        name: 'Updated Project',
      };
      assertType<UpdateProjectDto>(updateDto);

      const member: ProjectMember = {
        id: 'member-1',
        projectId: 'proj-1',
        userId: 'user-1',
        role: ProjectRole.TESTER,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(member.role).toBe(ProjectRole.TESTER);

      const addMemberDto: AddProjectMemberDto = {
        userId: 'user-2',
        role: ProjectRole.LEAD,
      };
      expect(addMemberDto.role).toBe(ProjectRole.LEAD);

      const updateMemberDto: UpdateProjectMemberDto = {
        role: ProjectRole.ADMIN,
      };
      expect(updateMemberDto.role).toBe(ProjectRole.ADMIN);
    });

    it('should export TestStep types', () => {
      const step: TestStep = {
        id: 'step-1',
        content: 'Click login button',
        expected: 'Login form appears',
      };
      expect(step.content).toBe('Click login button');

      const createDto: CreateTestStepDto = {
        content: 'New step',
        expected: 'Expected result',
      };
      assertType<CreateTestStepDto>(createDto);
    });

    it('should export TestCase types', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        sectionId: 'section-1',
        title: 'Login test',
        templateType: TestCaseTemplate.STEPS,
        steps: [],
        priority: Priority.HIGH,
        version: 1,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(testCase.title).toBe('Login test');

      const createDto: CreateTestCaseDto = {
        sectionId: 'section-1',
        title: 'New Test Case',
      };
      assertType<CreateTestCaseDto>(createDto);

      const updateDto: UpdateTestCaseDto = {
        title: 'Updated Test Case',
      };
      assertType<UpdateTestCaseDto>(updateDto);
    });

    it('should export TestSuite types', () => {
      const suite: TestSuite = {
        id: 'suite-1',
        projectId: 'proj-1',
        name: 'Authentication Suite',
        position: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(suite.name).toBe('Authentication Suite');

      const createDto: CreateTestSuiteDto = {
        projectId: 'proj-1',
        name: 'New Suite',
      };
      assertType<CreateTestSuiteDto>(createDto);

      const updateDto: UpdateTestSuiteDto = {
        name: 'Updated Suite',
      };
      assertType<UpdateTestSuiteDto>(updateDto);
    });

    it('should export Section types', () => {
      const section: Section = {
        id: 'section-1',
        suiteId: 'suite-1',
        name: 'Login Tests',
        position: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(section.name).toBe('Login Tests');

      const createDto: CreateSectionDto = {
        suiteId: 'suite-1',
        name: 'New Section',
      };
      assertType<CreateSectionDto>(createDto);

      const updateDto: UpdateSectionDto = {
        name: 'Updated Section',
      };
      assertType<UpdateSectionDto>(updateDto);
    });

    it('should export Milestone types', () => {
      const milestone: Milestone = {
        id: 'milestone-1',
        projectId: 'proj-1',
        name: 'Sprint 1',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(milestone.name).toBe('Sprint 1');

      const createDto: CreateMilestoneDto = {
        projectId: 'proj-1',
        name: 'New Milestone',
      };
      assertType<CreateMilestoneDto>(createDto);

      const updateDto: UpdateMilestoneDto = {
        name: 'Updated Milestone',
      };
      assertType<UpdateMilestoneDto>(updateDto);
    });

    it('should export TestPlan types', () => {
      const plan: TestPlan = {
        id: 'plan-1',
        projectId: 'proj-1',
        name: 'Release Plan',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(plan.name).toBe('Release Plan');

      const createDto: CreateTestPlanDto = {
        projectId: 'proj-1',
        name: 'New Plan',
      };
      assertType<CreateTestPlanDto>(createDto);

      const updateDto: UpdateTestPlanDto = {
        name: 'Updated Plan',
      };
      assertType<UpdateTestPlanDto>(updateDto);
    });

    it('should export TestRun types', () => {
      const run: TestRun = {
        id: 'run-1',
        projectId: 'proj-1',
        name: 'Sprint 1 Regression',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(run.name).toBe('Sprint 1 Regression');

      const createDto: CreateTestRunDto = {
        projectId: 'proj-1',
        name: 'New Run',
      };
      assertType<CreateTestRunDto>(createDto);

      const updateDto: UpdateTestRunDto = {
        name: 'Updated Run',
      };
      assertType<UpdateTestRunDto>(updateDto);
    });

    it('should export TestResult types', () => {
      const result: TestResult = {
        id: 'result-1',
        runId: 'run-1',
        caseId: 'tc-1',
        caseVersion: 1,
        status: TestStatus.PASSED,
        executedBy: 'user-1',
        executedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(result.status).toBe(TestStatus.PASSED);

      const createDto: CreateTestResultDto = {
        runId: 'run-1',
        caseId: 'tc-1',
        status: TestStatus.PASSED,
      };
      assertType<CreateTestResultDto>(createDto);

      const updateDto: UpdateTestResultDto = {
        status: TestStatus.FAILED,
      };
      assertType<UpdateTestResultDto>(updateDto);
    });

    it('should export Requirement types', () => {
      const requirement: Requirement = {
        id: 'req-1',
        projectId: 'proj-1',
        title: 'User can login',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(requirement.title).toBe('User can login');

      const createDto: CreateRequirementDto = {
        projectId: 'proj-1',
        title: 'New Requirement',
      };
      assertType<CreateRequirementDto>(createDto);

      const updateDto: UpdateRequirementDto = {
        title: 'Updated Requirement',
      };
      assertType<UpdateRequirementDto>(updateDto);
    });

    it('should export Attachment types', () => {
      const attachment: Attachment = {
        id: 'att-1',
        entityType: 'test_result',
        entityId: 'result-1',
        filename: 'screenshot.png',
        path: '/uploads/screenshot.png',
        size: 12345,
        mimeType: 'image/png',
        uploadedBy: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      expect(attachment.filename).toBe('screenshot.png');

      const createDto: CreateAttachmentDto = {
        entityType: 'test_result',
        entityId: 'result-1',
        filename: 'new-screenshot.png',
        path: '/uploads/new-screenshot.png',
        size: 54321,
        mimeType: 'image/png',
      };
      assertType<CreateAttachmentDto>(createDto);
    });
  });

  describe('API type exports', () => {
    it('should export pagination constants', () => {
      expect(DEFAULT_PAGE).toBe(1);
      expect(DEFAULT_PAGE_SIZE).toBe(25);
      expect(MAX_PAGE_SIZE).toBe(100);
    });

    it('should export PaginationParams type', () => {
      const params: PaginationParams = {
        page: 1,
        pageSize: 25,
      };
      expect(params.page).toBe(1);
    });

    it('should export PaginatedResponse type', () => {
      const response: PaginatedResponse<{ id: string }> = {
        items: [{ id: '1' }],
        total: 1,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      };
      expect(response.items).toHaveLength(1);
    });

    it('should export ApiError type and validator', () => {
      const error: ApiError = {
        statusCode: 400,
        message: 'Bad request',
        error: 'BadRequest',
      };
      expect(error.statusCode).toBe(400);
      expect(isApiError(error)).toBe(true);
      expect(isApiError({ random: 'object' })).toBe(false);
    });

    it('should export ValidationError type and validator', () => {
      const error: ValidationError = {
        statusCode: 422,
        message: 'Validation failed',
        error: 'UnprocessableEntity',
        errors: {
          email: ['Invalid email format'],
        },
      };
      expect(error.errors?.email).toContain('Invalid email format');
      expect(isValidationError(error)).toBe(true);
    });

    it('should export auth types', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(loginRequest.email).toBe('test@example.com');

      const registerRequest: RegisterRequest = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      expect(registerRequest.name).toBe('New User');

      const authResponse: AuthResponse = {
        accessToken: 'token123',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.TESTER,
          orgId: 'org-1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(authResponse.accessToken).toBe('token123');

      const refreshResponse: RefreshTokenResponse = {
        accessToken: 'newtoken123',
      };
      expect(refreshResponse.accessToken).toBe('newtoken123');

      const forgotRequest: ForgotPasswordRequest = {
        email: 'test@example.com',
      };
      expect(forgotRequest.email).toBe('test@example.com');

      const resetRequest: ResetPasswordRequest = {
        token: 'resettoken',
        password: 'newpassword123',
      };
      expect(resetRequest.token).toBe('resettoken');
    });
  });

  describe('API Response type exports', () => {
    it('should export ApiResponse type and validator', () => {
      const response: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: '1' },
      };
      expect(response.success).toBe(true);
      expect(isApiResponse(response)).toBe(true);
      expect(isApiResponse({ random: 'object' })).toBe(false);
    });

    it('should export ErrorResponse type and validator', () => {
      const response: ErrorResponse = {
        success: false,
        message: 'Not found',
        statusCode: 404,
      };
      expect(response.success).toBe(false);
      expect(isErrorResponse(response)).toBe(true);
      expect(isErrorResponse({ random: 'object' })).toBe(false);
    });

    it('should export PaginatedApiResponse type and validator', () => {
      const response: PaginatedApiResponse<{ id: string }> = {
        items: [{ id: '1' }],
        total: 1,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      };
      expect(response.items).toHaveLength(1);
      expect(isPaginatedResponse(response)).toBe(true);
      expect(isPaginatedResponse({ random: 'object' })).toBe(false);
    });
  });
});
