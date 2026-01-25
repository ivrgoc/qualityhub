// Enums
export {
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
} from './enums';

// Entities
export type {
  User,
  CreateUserDto,
  UpdateUserDto,
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
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
} from './entities';

// API Types
export type {
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
} from './api';

export { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, isApiError, isValidationError } from './api';

// API Response Types (consolidated)
export type { ApiResponse, ErrorResponse } from './api-response';
export type { PaginatedResponse as PaginatedApiResponse } from './api-response';
export { isErrorResponse, isApiResponse, isPaginatedResponse } from './api-response';
