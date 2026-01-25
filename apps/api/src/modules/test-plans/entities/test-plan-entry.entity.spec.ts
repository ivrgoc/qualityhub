import { TestPlanEntry } from './test-plan-entry.entity';
import { TestPlan } from './test-plan.entity';
import { TestCase } from '../../test-cases/entities/test-case.entity';

describe('TestPlanEntry Entity', () => {
  it('should create a test plan entry instance', () => {
    const entry = new TestPlanEntry();

    entry.id = 'entry-123';
    entry.testPlanId = 'plan-456';
    entry.testCaseId = 'case-789';
    entry.position = 0;
    entry.createdAt = new Date('2024-01-01');
    entry.updatedAt = new Date('2024-01-01');

    expect(entry.id).toBe('entry-123');
    expect(entry.testPlanId).toBe('plan-456');
    expect(entry.testCaseId).toBe('case-789');
    expect(entry.position).toBe(0);
    expect(entry.createdAt).toEqual(new Date('2024-01-01'));
    expect(entry.updatedAt).toEqual(new Date('2024-01-01'));
  });

  describe('test plan relation', () => {
    it('should have test plan relation', () => {
      const entry = new TestPlanEntry();
      const testPlan = new TestPlan();
      testPlan.id = 'plan-123';
      testPlan.name = 'Regression Tests';

      entry.testPlanId = testPlan.id;
      entry.testPlan = testPlan;

      expect(entry.testPlan).toBe(testPlan);
      expect(entry.testPlan.id).toBe('plan-123');
      expect(entry.testPlan.name).toBe('Regression Tests');
      expect(entry.testPlanId).toBe(testPlan.id);
    });
  });

  describe('test case relation', () => {
    it('should have test case relation', () => {
      const entry = new TestPlanEntry();
      const testCase = new TestCase();
      testCase.id = 'case-123';
      testCase.title = 'Login Test';

      entry.testCaseId = testCase.id;
      entry.testCase = testCase;

      expect(entry.testCase).toBe(testCase);
      expect(entry.testCase.id).toBe('case-123');
      expect(entry.testCase.title).toBe('Login Test');
      expect(entry.testCaseId).toBe(testCase.id);
    });
  });

  describe('position field', () => {
    it('should support position values', () => {
      const entry = new TestPlanEntry();

      entry.position = 0;
      expect(entry.position).toBe(0);

      entry.position = 5;
      expect(entry.position).toBe(5);

      entry.position = 100;
      expect(entry.position).toBe(100);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      const entry = new TestPlanEntry();
      entry.createdAt = new Date('2024-01-01T10:00:00Z');

      expect(entry.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should have updatedAt timestamp', () => {
      const entry = new TestPlanEntry();
      entry.updatedAt = new Date('2024-01-02T10:00:00Z');

      expect(entry.updatedAt).toEqual(new Date('2024-01-02T10:00:00Z'));
    });
  });

  describe('complete entry scenario', () => {
    it('should create a fully populated entry', () => {
      const entry = new TestPlanEntry();
      const testPlan = new TestPlan();
      const testCase = new TestCase();

      testPlan.id = 'plan-123';
      testPlan.name = 'Smoke Tests';

      testCase.id = 'case-456';
      testCase.title = 'Verify homepage loads';

      entry.id = 'entry-789';
      entry.testPlanId = testPlan.id;
      entry.testPlan = testPlan;
      entry.testCaseId = testCase.id;
      entry.testCase = testCase;
      entry.position = 3;
      entry.createdAt = new Date('2024-01-01');
      entry.updatedAt = new Date('2024-01-01');

      expect(entry.id).toBe('entry-789');
      expect(entry.testPlan.name).toBe('Smoke Tests');
      expect(entry.testCase.title).toBe('Verify homepage loads');
      expect(entry.position).toBe(3);
    });
  });
});
