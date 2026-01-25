/**
 * Test Case Types
 *
 * This module provides a convenient single import point for all test case
 * related types, including interfaces and enums.
 *
 * @example
 * ```typescript
 * import { TestCase, TestStep, Priority, TestCaseTemplate } from '@qualityhub/shared-types/test-case';
 * ```
 */

// Re-export entities
export type { TestCase, CreateTestCaseDto, UpdateTestCaseDto } from './entities/test-case';
export type { TestStep, CreateTestStepDto } from './entities/test-step';

// Re-export enums
export { Priority, PRIORITY_VALUES, isPriority } from './enums/priority';
export {
  TestCaseTemplate,
  TEST_CASE_TEMPLATE_VALUES,
  isTestCaseTemplate,
} from './enums/test-case-template';
