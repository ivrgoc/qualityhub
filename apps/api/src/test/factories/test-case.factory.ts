import {
  TestCase,
  TestCaseTemplate,
  Priority,
} from '../../modules/test-cases/entities/test-case.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import { Section } from '../../modules/test-suites/entities/section.entity';
import { getTestDataSource } from '../test-database';
import { createProject } from './project.factory';

let testCaseCounter = 0;

export interface TestStep {
  step: string;
  expectedResult: string;
}

export interface CreateTestCaseOptions {
  title?: string;
  templateType?: TestCaseTemplate;
  preconditions?: string;
  steps?: TestStep[];
  expectedResult?: string;
  priority?: Priority;
  estimate?: number;
  customFields?: Record<string, unknown>;
  version?: number;
  projectId?: string;
  project?: Project;
  sectionId?: string | null;
  section?: Section | null;
  createdBy?: string;
}

/**
 * Create a test case entity
 */
export const createTestCase = async (options: CreateTestCaseOptions = {}): Promise<TestCase> => {
  testCaseCounter++;
  const dataSource = getTestDataSource();
  const repository = dataSource.getRepository(TestCase);

  // Create or use provided project
  let projectId = options.projectId;
  if (!projectId && !options.project) {
    const project = await createProject();
    projectId = project.id;
  } else if (options.project) {
    projectId = options.project.id;
  }

  const defaultSteps: TestStep[] = [
    { step: 'Navigate to the login page', expectedResult: 'Login page is displayed' },
    { step: 'Enter valid credentials', expectedResult: 'Credentials are entered' },
    { step: 'Click login button', expectedResult: 'User is logged in successfully' },
  ];

  const testCase = repository.create({
    title: options.title ?? `Test Case ${testCaseCounter}`,
    templateType: options.templateType ?? TestCaseTemplate.STEPS,
    preconditions: options.preconditions ?? 'User has a valid account',
    steps: (options.steps ?? defaultSteps) as unknown as Record<string, unknown>[],
    expectedResult: options.expectedResult ?? 'Test passes successfully',
    priority: options.priority ?? Priority.MEDIUM,
    estimate: options.estimate ?? 5,
    customFields: options.customFields ?? null,
    version: options.version ?? 1,
    projectId: projectId!,
    sectionId: options.sectionId ?? options.section?.id ?? null,
    createdBy: options.createdBy ?? null,
  });

  return repository.save(testCase);
};

/**
 * Create a BDD test case
 */
export const createBddTestCase = async (
  options: Omit<CreateTestCaseOptions, 'templateType' | 'steps'> & {
    gherkin?: string;
  } = {},
): Promise<TestCase> => {
  const defaultGherkin = `Feature: User Login
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be logged in successfully`;

  return createTestCase({
    ...options,
    templateType: TestCaseTemplate.BDD,
    steps: [{ step: options.gherkin ?? defaultGherkin, expectedResult: '' }] as TestStep[],
  });
};

/**
 * Create a text template test case
 */
export const createTextTestCase = async (
  options: Omit<CreateTestCaseOptions, 'templateType'> = {},
): Promise<TestCase> => {
  return createTestCase({
    ...options,
    templateType: TestCaseTemplate.TEXT,
    steps: null as unknown as TestStep[],
  });
};

/**
 * Create an exploratory test case
 */
export const createExploratoryTestCase = async (
  options: Omit<CreateTestCaseOptions, 'templateType'> = {},
): Promise<TestCase> => {
  return createTestCase({
    ...options,
    templateType: TestCaseTemplate.EXPLORATORY,
    title: options.title ?? `Exploratory: Explore feature ${testCaseCounter}`,
  });
};

/**
 * Create multiple test cases
 */
export const createTestCases = async (
  count: number,
  options: CreateTestCaseOptions = {},
): Promise<TestCase[]> => {
  const testCases: TestCase[] = [];
  for (let i = 0; i < count; i++) {
    testCases.push(await createTestCase(options));
  }
  return testCases;
};

/**
 * Reset the test case counter (useful between tests)
 */
export const resetTestCaseCounter = (): void => {
  testCaseCounter = 0;
};
