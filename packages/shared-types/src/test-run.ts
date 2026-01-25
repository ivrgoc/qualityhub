/**
 * Test Run Types
 *
 * This module provides a convenient single import point for all test run
 * related types, including interfaces and enums.
 *
 * @example
 * ```typescript
 * import { TestRun, TestResult, TestStatus } from '@qualityhub/shared-types/test-run';
 * ```
 */

// Re-export entities
export type {
  TestRun,
  CreateTestRunDto,
  UpdateTestRunDto,
} from './entities/test-run';

export type {
  TestResult,
  CreateTestResultDto,
  UpdateTestResultDto,
} from './entities/test-result';

// Re-export enums
export {
  TestStatus,
  TEST_STATUS_VALUES,
  isTestStatus,
} from './enums/test-status';
