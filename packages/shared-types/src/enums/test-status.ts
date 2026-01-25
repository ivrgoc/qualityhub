export enum TestStatus {
  UNTESTED = 'untested',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  RETEST = 'retest',
  SKIPPED = 'skipped',
}

export const TEST_STATUS_VALUES = Object.values(TestStatus);

export function isTestStatus(value: unknown): value is TestStatus {
  return typeof value === 'string' && TEST_STATUS_VALUES.includes(value as TestStatus);
}
