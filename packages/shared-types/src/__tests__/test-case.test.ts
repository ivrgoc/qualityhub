import { describe, it, expect } from 'vitest';
import {
  Priority,
  PRIORITY_VALUES,
  isPriority,
  TestCaseTemplate,
  TEST_CASE_TEMPLATE_VALUES,
  isTestCaseTemplate,
} from '../test-case';
import type {
  TestCase,
  CreateTestCaseDto,
  UpdateTestCaseDto,
  TestStep,
  CreateTestStepDto,
} from '../test-case';

describe('test-case module exports', () => {
  describe('Priority enum', () => {
    it('should export all priority values', () => {
      expect(Priority.CRITICAL).toBe('critical');
      expect(Priority.HIGH).toBe('high');
      expect(Priority.MEDIUM).toBe('medium');
      expect(Priority.LOW).toBe('low');
    });

    it('should export PRIORITY_VALUES array', () => {
      expect(PRIORITY_VALUES).toContain('critical');
      expect(PRIORITY_VALUES).toContain('high');
      expect(PRIORITY_VALUES).toContain('medium');
      expect(PRIORITY_VALUES).toContain('low');
      expect(PRIORITY_VALUES).toHaveLength(4);
    });

    it('should export isPriority type guard', () => {
      expect(isPriority('critical')).toBe(true);
      expect(isPriority('high')).toBe(true);
      expect(isPriority('medium')).toBe(true);
      expect(isPriority('low')).toBe(true);
      expect(isPriority('invalid')).toBe(false);
      expect(isPriority(null)).toBe(false);
      expect(isPriority(undefined)).toBe(false);
    });
  });

  describe('TestCaseTemplate enum', () => {
    it('should export all template values', () => {
      expect(TestCaseTemplate.STEPS).toBe('steps');
      expect(TestCaseTemplate.TEXT).toBe('text');
      expect(TestCaseTemplate.BDD).toBe('bdd');
      expect(TestCaseTemplate.EXPLORATORY).toBe('exploratory');
    });

    it('should export TEST_CASE_TEMPLATE_VALUES array', () => {
      expect(TEST_CASE_TEMPLATE_VALUES).toContain('steps');
      expect(TEST_CASE_TEMPLATE_VALUES).toContain('text');
      expect(TEST_CASE_TEMPLATE_VALUES).toContain('bdd');
      expect(TEST_CASE_TEMPLATE_VALUES).toContain('exploratory');
      expect(TEST_CASE_TEMPLATE_VALUES).toHaveLength(4);
    });

    it('should export isTestCaseTemplate type guard', () => {
      expect(isTestCaseTemplate('steps')).toBe(true);
      expect(isTestCaseTemplate('text')).toBe(true);
      expect(isTestCaseTemplate('bdd')).toBe(true);
      expect(isTestCaseTemplate('exploratory')).toBe(true);
      expect(isTestCaseTemplate('invalid')).toBe(false);
      expect(isTestCaseTemplate(123)).toBe(false);
    });
  });

  describe('TestStep interface', () => {
    it('should accept valid TestStep object', () => {
      const step: TestStep = {
        id: 'step-1',
        content: 'Click the login button',
        expected: 'Login dialog appears',
      };

      expect(step.id).toBe('step-1');
      expect(step.content).toBe('Click the login button');
      expect(step.expected).toBe('Login dialog appears');
    });
  });

  describe('CreateTestStepDto interface', () => {
    it('should accept valid CreateTestStepDto object', () => {
      const dto: CreateTestStepDto = {
        content: 'Enter username',
        expected: 'Username field accepts input',
      };

      expect(dto.content).toBe('Enter username');
      expect(dto.expected).toBe('Username field accepts input');
    });
  });

  describe('TestCase interface', () => {
    it('should accept valid TestCase object with required fields', () => {
      const testCase: TestCase = {
        id: 'tc-123',
        sectionId: 'section-1',
        title: 'User can log in with valid credentials',
        templateType: TestCaseTemplate.STEPS,
        steps: [],
        priority: Priority.HIGH,
        version: 1,
        createdBy: 'user-1',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };

      expect(testCase.id).toBe('tc-123');
      expect(testCase.title).toBe('User can log in with valid credentials');
      expect(testCase.templateType).toBe(TestCaseTemplate.STEPS);
      expect(testCase.priority).toBe(Priority.HIGH);
    });

    it('should accept TestCase with optional fields', () => {
      const testCase: TestCase = {
        id: 'tc-456',
        sectionId: 'section-2',
        title: 'User can reset password',
        templateType: TestCaseTemplate.TEXT,
        preconditions: 'User has a registered account',
        steps: [
          { id: 'step-1', content: 'Click forgot password', expected: 'Reset form appears' },
        ],
        expectedResult: 'Password reset email is sent',
        priority: Priority.MEDIUM,
        estimate: 15,
        version: 2,
        createdBy: 'user-2',
        createdAt: '2024-01-10T08:00:00.000Z',
        updatedAt: '2024-01-15T14:30:00.000Z',
      };

      expect(testCase.preconditions).toBe('User has a registered account');
      expect(testCase.expectedResult).toBe('Password reset email is sent');
      expect(testCase.estimate).toBe(15);
      expect(testCase.steps).toHaveLength(1);
    });

    it('should accept TestCase with BDD template', () => {
      const testCase: TestCase = {
        id: 'tc-789',
        sectionId: 'section-3',
        title: 'Shopping cart checkout',
        templateType: TestCaseTemplate.BDD,
        preconditions: 'Given user has items in cart',
        steps: [],
        expectedResult: 'Then order is placed successfully',
        priority: Priority.CRITICAL,
        version: 1,
        createdBy: 'user-1',
        createdAt: '2024-01-20T09:00:00.000Z',
        updatedAt: '2024-01-20T09:00:00.000Z',
      };

      expect(testCase.templateType).toBe(TestCaseTemplate.BDD);
      expect(testCase.priority).toBe(Priority.CRITICAL);
    });
  });

  describe('CreateTestCaseDto interface', () => {
    it('should accept minimal CreateTestCaseDto', () => {
      const dto: CreateTestCaseDto = {
        sectionId: 'section-1',
        title: 'New test case',
      };

      expect(dto.sectionId).toBe('section-1');
      expect(dto.title).toBe('New test case');
    });

    it('should accept full CreateTestCaseDto', () => {
      const dto: CreateTestCaseDto = {
        sectionId: 'section-1',
        title: 'Complete test case',
        templateType: TestCaseTemplate.STEPS,
        preconditions: 'User is authenticated',
        steps: [
          { content: 'Navigate to settings', expected: 'Settings page loads' },
          { content: 'Click save', expected: 'Settings are saved' },
        ],
        expectedResult: 'User settings are persisted',
        priority: Priority.HIGH,
        estimate: 20,
      };

      expect(dto.templateType).toBe(TestCaseTemplate.STEPS);
      expect(dto.steps).toHaveLength(2);
      expect(dto.priority).toBe(Priority.HIGH);
      expect(dto.estimate).toBe(20);
    });
  });

  describe('UpdateTestCaseDto interface', () => {
    it('should accept partial UpdateTestCaseDto', () => {
      const dto: UpdateTestCaseDto = {
        title: 'Updated title',
      };

      expect(dto.title).toBe('Updated title');
    });

    it('should accept UpdateTestCaseDto with multiple fields', () => {
      const dto: UpdateTestCaseDto = {
        title: 'Updated test case',
        priority: Priority.LOW,
        templateType: TestCaseTemplate.EXPLORATORY,
        estimate: 45,
      };

      expect(dto.title).toBe('Updated test case');
      expect(dto.priority).toBe(Priority.LOW);
      expect(dto.templateType).toBe(TestCaseTemplate.EXPLORATORY);
      expect(dto.estimate).toBe(45);
    });
  });
});
