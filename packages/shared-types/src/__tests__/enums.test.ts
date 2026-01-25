import { describe, it, expect } from 'vitest';
import {
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
} from '../enums';

describe('TestStatus', () => {
  it('should have correct enum values', () => {
    expect(TestStatus.UNTESTED).toBe('untested');
    expect(TestStatus.PASSED).toBe('passed');
    expect(TestStatus.FAILED).toBe('failed');
    expect(TestStatus.BLOCKED).toBe('blocked');
    expect(TestStatus.RETEST).toBe('retest');
    expect(TestStatus.SKIPPED).toBe('skipped');
  });

  it('should export all values', () => {
    expect(TEST_STATUS_VALUES).toHaveLength(6);
    expect(TEST_STATUS_VALUES).toContain('untested');
    expect(TEST_STATUS_VALUES).toContain('passed');
  });

  it('should validate test status correctly', () => {
    expect(isTestStatus('passed')).toBe(true);
    expect(isTestStatus('failed')).toBe(true);
    expect(isTestStatus('invalid')).toBe(false);
    expect(isTestStatus(123)).toBe(false);
    expect(isTestStatus(null)).toBe(false);
  });
});

describe('TestCaseTemplate', () => {
  it('should have correct enum values', () => {
    expect(TestCaseTemplate.STEPS).toBe('steps');
    expect(TestCaseTemplate.TEXT).toBe('text');
    expect(TestCaseTemplate.BDD).toBe('bdd');
    expect(TestCaseTemplate.EXPLORATORY).toBe('exploratory');
  });

  it('should export all values', () => {
    expect(TEST_CASE_TEMPLATE_VALUES).toHaveLength(4);
  });

  it('should validate template correctly', () => {
    expect(isTestCaseTemplate('steps')).toBe(true);
    expect(isTestCaseTemplate('bdd')).toBe(true);
    expect(isTestCaseTemplate('invalid')).toBe(false);
  });
});

describe('Priority', () => {
  it('should have correct enum values', () => {
    expect(Priority.CRITICAL).toBe('critical');
    expect(Priority.HIGH).toBe('high');
    expect(Priority.MEDIUM).toBe('medium');
    expect(Priority.LOW).toBe('low');
  });

  it('should export all values', () => {
    expect(PRIORITY_VALUES).toHaveLength(4);
  });

  it('should validate priority correctly', () => {
    expect(isPriority('high')).toBe(true);
    expect(isPriority('low')).toBe(true);
    expect(isPriority('urgent')).toBe(false);
  });
});

describe('UserRole', () => {
  it('should have correct enum values', () => {
    expect(UserRole.VIEWER).toBe('viewer');
    expect(UserRole.TESTER).toBe('tester');
    expect(UserRole.LEAD).toBe('lead');
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should export all values', () => {
    expect(USER_ROLE_VALUES).toHaveLength(4);
  });

  it('should validate role correctly', () => {
    expect(isUserRole('tester')).toBe(true);
    expect(isUserRole('admin')).toBe(true);
    expect(isUserRole('superadmin')).toBe(false);
  });
});
