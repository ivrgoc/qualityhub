export enum TestStatus {
  UNTESTED = 'untested',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  RETEST = 'retest',
  SKIPPED = 'skipped',
}

export enum TestCaseTemplate {
  STEPS = 'steps',
  TEXT = 'text',
  BDD = 'bdd',
  EXPLORATORY = 'exploratory',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum UserRole {
  VIEWER = 'viewer',
  TESTER = 'tester',
  LEAD = 'lead',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface TestStep {
  id: string;
  content: string;
  expected: string;
}

export interface TestCase {
  id: string;
  sectionId: string;
  title: string;
  templateType: TestCaseTemplate;
  preconditions?: string;
  steps: TestStep[];
  expectedResult?: string;
  priority: Priority;
  estimate?: number;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestRun {
  id: string;
  projectId: string;
  planId?: string;
  suiteId?: string;
  name: string;
  description?: string;
  assigneeId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  runId: string;
  caseId: string;
  caseVersion: number;
  status: TestStatus;
  comment?: string;
  elapsedSeconds?: number;
  executedBy: string;
  executedAt: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
