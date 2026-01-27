// Organization factory
export {
  createOrganization,
  createOrganizations,
  resetOrganizationCounter,
  type CreateOrganizationOptions,
} from './organization.factory';

// User factory
export {
  createUser,
  createAdminUser,
  createProjectAdminUser,
  createUsers,
  resetUserCounter,
  getDefaultPassword,
  type CreateUserOptions,
} from './user.factory';

// Project factory
export {
  createProject,
  createProjects,
  resetProjectCounter,
  type CreateProjectOptions,
} from './project.factory';

// Test case factory
export {
  createTestCase,
  createBddTestCase,
  createTextTestCase,
  createExploratoryTestCase,
  createTestCases,
  resetTestCaseCounter,
  type CreateTestCaseOptions,
  type TestStep,
} from './test-case.factory';

// Test run factory
export {
  createTestRun,
  createTestResult,
  createTestRunWithResults,
  createTestRuns,
  resetTestRunCounter,
  type CreateTestRunOptions,
  type CreateTestResultOptions,
} from './test-run.factory';

// Reset all counters
export const resetAllCounters = (): void => {
  const { resetOrganizationCounter } = require('./organization.factory');
  const { resetUserCounter } = require('./user.factory');
  const { resetProjectCounter } = require('./project.factory');
  const { resetTestCaseCounter } = require('./test-case.factory');
  const { resetTestRunCounter } = require('./test-run.factory');

  resetOrganizationCounter();
  resetUserCounter();
  resetProjectCounter();
  resetTestCaseCounter();
  resetTestRunCounter();
};
