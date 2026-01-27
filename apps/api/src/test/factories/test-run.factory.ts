import { TestRun } from '../../modules/test-runs/entities/test-run.entity';
import { TestResult, TestStatus } from '../../modules/test-runs/entities/test-result.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import { TestCase } from '../../modules/test-cases/entities/test-case.entity';
import { User } from '../../modules/users/entities/user.entity';
import { getTestDataSource } from '../test-database';
import { createProject } from './project.factory';
import { createTestCase } from './test-case.factory';

let testRunCounter = 0;

export interface CreateTestRunOptions {
  name?: string;
  description?: string;
  projectId?: string;
  project?: Project;
  assigneeId?: string | null;
  assignee?: User | null;
  testPlanId?: string | null;
  config?: Record<string, unknown>;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface CreateTestResultOptions {
  testRunId?: string;
  run?: TestRun;
  testCaseId?: string;
  testCase?: TestCase;
  testCaseVersion?: number;
  status?: TestStatus;
  comment?: string | null;
  elapsedSeconds?: number | null;
  defects?: string[];
  executedBy?: string | null;
  executedAt?: Date | null;
}

/**
 * Create a test run entity
 */
export const createTestRun = async (options: CreateTestRunOptions = {}): Promise<TestRun> => {
  testRunCounter++;
  const dataSource = getTestDataSource();
  const repository = dataSource.getRepository(TestRun);

  // Create or use provided project
  let projectId = options.projectId;
  if (!projectId && !options.project) {
    const project = await createProject();
    projectId = project.id;
  } else if (options.project) {
    projectId = options.project.id;
  }

  const testRun = repository.create({
    name: options.name ?? `Test Run ${testRunCounter}`,
    description: options.description ?? `Description for test run ${testRunCounter}`,
    projectId: projectId!,
    assigneeId: options.assigneeId ?? options.assignee?.id ?? null,
    testPlanId: options.testPlanId ?? null,
    config: options.config ?? null,
    startedAt: options.startedAt ?? null,
    completedAt: options.completedAt ?? null,
  });

  return repository.save(testRun);
};

/**
 * Create a test result entity
 */
export const createTestResult = async (
  options: CreateTestResultOptions = {},
): Promise<TestResult> => {
  const dataSource = getTestDataSource();
  const repository = dataSource.getRepository(TestResult);

  // Create or use provided run
  let testRunId = options.testRunId;
  if (!testRunId && !options.run) {
    const run = await createTestRun();
    testRunId = run.id;
  } else if (options.run) {
    testRunId = options.run.id;
  }

  // Create or use provided test case
  let testCaseId = options.testCaseId;
  let testCaseVersion = options.testCaseVersion ?? 1;
  if (!testCaseId && !options.testCase) {
    const testCase = await createTestCase();
    testCaseId = testCase.id;
    testCaseVersion = testCase.version;
  } else if (options.testCase) {
    testCaseId = options.testCase.id;
    testCaseVersion = options.testCaseVersion ?? options.testCase.version;
  }

  const testResult = repository.create({
    testRunId: testRunId!,
    testCaseId: testCaseId!,
    testCaseVersion,
    status: options.status ?? TestStatus.UNTESTED,
    comment: options.comment ?? null,
    elapsedSeconds: options.elapsedSeconds ?? null,
    defects: options.defects ?? null,
    executedBy: options.executedBy ?? null,
    executedAt: options.executedAt ?? null,
  });

  return repository.save(testResult);
};

/**
 * Create a test run with results
 */
export const createTestRunWithResults = async (
  runOptions: CreateTestRunOptions = {},
  resultCount: number = 5,
  statusDistribution?: Partial<Record<TestStatus, number>>,
): Promise<{ run: TestRun; results: TestResult[] }> => {
  const run = await createTestRun(runOptions);
  const results: TestResult[] = [];

  const distribution = statusDistribution ?? {
    [TestStatus.PASSED]: 2,
    [TestStatus.FAILED]: 1,
    [TestStatus.BLOCKED]: 1,
    [TestStatus.UNTESTED]: 1,
  };

  let count = 0;
  for (const [status, statusCount] of Object.entries(distribution)) {
    for (let i = 0; i < (statusCount ?? 0) && count < resultCount; i++) {
      const result = await createTestResult({
        run,
        status: status as TestStatus,
        executedAt: status !== TestStatus.UNTESTED ? new Date() : null,
      });
      results.push(result);
      count++;
    }
  }

  // Fill remaining with untested
  while (count < resultCount) {
    const result = await createTestResult({
      run,
      status: TestStatus.UNTESTED,
    });
    results.push(result);
    count++;
  }

  return { run, results };
};

/**
 * Create multiple test runs
 */
export const createTestRuns = async (
  count: number,
  options: CreateTestRunOptions = {},
): Promise<TestRun[]> => {
  const runs: TestRun[] = [];
  for (let i = 0; i < count; i++) {
    runs.push(await createTestRun(options));
  }
  return runs;
};

/**
 * Reset the test run counter (useful between tests)
 */
export const resetTestRunCounter = (): void => {
  testRunCounter = 0;
};
