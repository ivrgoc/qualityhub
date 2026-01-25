import { TestPlan } from './test-plan.entity';
import { Project } from '../../projects/entities/project.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';

describe('TestPlan Entity', () => {
  it('should create a test plan instance', () => {
    const testPlan = new TestPlan();

    testPlan.id = 'plan-123';
    testPlan.projectId = 'proj-456';
    testPlan.milestoneId = 'milestone-789';
    testPlan.name = 'Q1 Regression Tests';
    testPlan.description = 'Comprehensive regression tests';
    testPlan.createdAt = new Date('2024-01-01');
    testPlan.updatedAt = new Date('2024-01-01');
    testPlan.deletedAt = null;

    expect(testPlan.id).toBe('plan-123');
    expect(testPlan.projectId).toBe('proj-456');
    expect(testPlan.milestoneId).toBe('milestone-789');
    expect(testPlan.name).toBe('Q1 Regression Tests');
    expect(testPlan.description).toBe('Comprehensive regression tests');
    expect(testPlan.createdAt).toEqual(new Date('2024-01-01'));
    expect(testPlan.updatedAt).toEqual(new Date('2024-01-01'));
    expect(testPlan.deletedAt).toBeNull();
  });

  describe('project relation', () => {
    it('should have project relation', () => {
      const testPlan = new TestPlan();
      const project = new Project();
      project.id = 'proj-123';
      project.name = 'Test Project';

      testPlan.projectId = project.id;
      testPlan.project = project;

      expect(testPlan.project).toBe(project);
      expect(testPlan.project.id).toBe('proj-123');
      expect(testPlan.project.name).toBe('Test Project');
      expect(testPlan.projectId).toBe(project.id);
    });
  });

  describe('milestone relation', () => {
    it('should have milestone relation', () => {
      const testPlan = new TestPlan();
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Q1 Release';

      testPlan.milestoneId = milestone.id;
      testPlan.milestone = milestone;

      expect(testPlan.milestone).toBe(milestone);
      expect(testPlan.milestone.id).toBe('milestone-123');
      expect(testPlan.milestone.name).toBe('Q1 Release');
      expect(testPlan.milestoneId).toBe(milestone.id);
    });

    it('should support null milestone', () => {
      const testPlan = new TestPlan();
      testPlan.id = 'plan-123';
      testPlan.name = 'Test Plan without milestone';
      testPlan.milestoneId = null;

      expect(testPlan.milestoneId).toBeNull();
    });
  });

  describe('name field', () => {
    it('should support name', () => {
      const testPlan = new TestPlan();
      testPlan.name = 'Smoke Tests';

      expect(testPlan.name).toBe('Smoke Tests');
    });

    it('should support different name values', () => {
      const testPlan = new TestPlan();

      testPlan.name = 'Regression Tests';
      expect(testPlan.name).toBe('Regression Tests');

      testPlan.name = 'Integration Tests';
      expect(testPlan.name).toBe('Integration Tests');
    });
  });

  describe('description field', () => {
    it('should support description', () => {
      const testPlan = new TestPlan();
      testPlan.description = 'Detailed test plan description';

      expect(testPlan.description).toBe('Detailed test plan description');
    });

    it('should support null description', () => {
      const testPlan = new TestPlan();
      testPlan.description = null;

      expect(testPlan.description).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      const testPlan = new TestPlan();
      testPlan.createdAt = new Date('2024-01-01T10:00:00Z');

      expect(testPlan.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should have updatedAt timestamp', () => {
      const testPlan = new TestPlan();
      testPlan.updatedAt = new Date('2024-01-02T10:00:00Z');

      expect(testPlan.updatedAt).toEqual(new Date('2024-01-02T10:00:00Z'));
    });

    it('should have deletedAt timestamp for soft delete', () => {
      const testPlan = new TestPlan();
      testPlan.deletedAt = new Date('2024-01-03T10:00:00Z');

      expect(testPlan.deletedAt).toEqual(new Date('2024-01-03T10:00:00Z'));
    });

    it('should have null deletedAt when not deleted', () => {
      const testPlan = new TestPlan();
      testPlan.deletedAt = null;

      expect(testPlan.deletedAt).toBeNull();
    });
  });

  describe('complete test plan scenario', () => {
    it('should create a fully populated test plan', () => {
      const testPlan = new TestPlan();
      const project = new Project();
      const milestone = new Milestone();

      project.id = 'proj-123';
      project.name = 'E-Commerce Project';

      milestone.id = 'milestone-456';
      milestone.name = 'Beta Release';

      testPlan.id = 'plan-789';
      testPlan.name = 'Beta Regression Tests';
      testPlan.description = 'Complete regression test suite for beta release';
      testPlan.projectId = project.id;
      testPlan.project = project;
      testPlan.milestoneId = milestone.id;
      testPlan.milestone = milestone;
      testPlan.createdAt = new Date('2024-01-01');
      testPlan.updatedAt = new Date('2024-01-01');
      testPlan.deletedAt = null;

      expect(testPlan.id).toBe('plan-789');
      expect(testPlan.name).toBe('Beta Regression Tests');
      expect(testPlan.description).toBe('Complete regression test suite for beta release');
      expect(testPlan.project.name).toBe('E-Commerce Project');
      expect(testPlan.milestone.name).toBe('Beta Release');
      expect(testPlan.deletedAt).toBeNull();
    });

    it('should create a test plan without milestone', () => {
      const testPlan = new TestPlan();
      const project = new Project();

      project.id = 'proj-123';
      project.name = 'Standalone Project';

      testPlan.id = 'plan-456';
      testPlan.name = 'Standalone Tests';
      testPlan.description = null;
      testPlan.projectId = project.id;
      testPlan.project = project;
      testPlan.milestoneId = null;
      testPlan.createdAt = new Date('2024-01-01');
      testPlan.updatedAt = new Date('2024-01-01');
      testPlan.deletedAt = null;

      expect(testPlan.milestoneId).toBeNull();
      expect(testPlan.name).toBe('Standalone Tests');
      expect(testPlan.description).toBeNull();
    });
  });
});
