import { Milestone } from './milestone.entity';
import { Project } from '../../projects/entities/project.entity';

describe('Milestone Entity', () => {
  it('should create a milestone instance', () => {
    const milestone = new Milestone();

    milestone.id = 'milestone-123';
    milestone.projectId = 'proj-456';
    milestone.name = 'Q1 Release';
    milestone.description = 'End of quarter release milestone';
    milestone.dueDate = new Date('2024-03-31');
    milestone.completed = false;
    milestone.createdAt = new Date('2024-01-01');
    milestone.updatedAt = new Date('2024-01-02');
    milestone.deletedAt = null;

    expect(milestone.id).toBe('milestone-123');
    expect(milestone.projectId).toBe('proj-456');
    expect(milestone.name).toBe('Q1 Release');
    expect(milestone.description).toBe('End of quarter release milestone');
    expect(milestone.dueDate).toEqual(new Date('2024-03-31'));
    expect(milestone.completed).toBe(false);
    expect(milestone.createdAt).toEqual(new Date('2024-01-01'));
    expect(milestone.updatedAt).toEqual(new Date('2024-01-02'));
    expect(milestone.deletedAt).toBeNull();
  });

  describe('completed field', () => {
    it('should support completed status', () => {
      const milestone = new Milestone();
      milestone.completed = false;

      expect(milestone.completed).toBe(false);

      milestone.completed = true;

      expect(milestone.completed).toBe(true);
    });

    it('should default to false', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'New Milestone';
      milestone.completed = false;

      expect(milestone.completed).toBe(false);
    });
  });

  describe('dueDate field', () => {
    it('should support due date', () => {
      const milestone = new Milestone();
      milestone.dueDate = new Date('2024-12-31T23:59:59Z');

      expect(milestone.dueDate).toEqual(new Date('2024-12-31T23:59:59Z'));
    });

    it('should support null due date', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Milestone without due date';
      milestone.dueDate = null;

      expect(milestone.dueDate).toBeNull();
    });

    it('should handle different date formats', () => {
      const milestone = new Milestone();

      milestone.dueDate = new Date('2024-06-15');
      expect(milestone.dueDate.getFullYear()).toBe(2024);
      expect(milestone.dueDate.getMonth()).toBe(5);
      expect(milestone.dueDate.getDate()).toBe(15);
    });
  });

  describe('soft delete', () => {
    it('should support soft delete with deletedAt', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Milestone to delete';
      milestone.deletedAt = null;

      expect(milestone.deletedAt).toBeNull();

      milestone.deletedAt = new Date('2024-06-01');

      expect(milestone.deletedAt).toEqual(new Date('2024-06-01'));
    });

    it('should handle active milestone (not deleted)', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Active milestone';
      milestone.deletedAt = null;

      const isDeleted = milestone.deletedAt !== null;

      expect(isDeleted).toBe(false);
    });

    it('should identify deleted milestone', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Deleted milestone';
      milestone.deletedAt = new Date('2024-06-01');

      const isDeleted = milestone.deletedAt !== null;

      expect(isDeleted).toBe(true);
    });
  });

  describe('project relation', () => {
    it('should have project relation', () => {
      const milestone = new Milestone();
      const project = new Project();
      project.id = 'proj-123';
      project.name = 'Test Project';

      milestone.projectId = project.id;
      milestone.project = project;

      expect(milestone.project).toBe(project);
      expect(milestone.project.id).toBe('proj-123');
      expect(milestone.project.name).toBe('Test Project');
      expect(milestone.projectId).toBe(project.id);
    });
  });

  describe('optional fields', () => {
    it('should support optional description', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Milestone without description';

      expect(milestone.description).toBeUndefined();
    });

    it('should support null description', () => {
      const milestone = new Milestone();
      milestone.id = 'milestone-123';
      milestone.name = 'Milestone with null description';
      milestone.description = null;

      expect(milestone.description).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const milestone = new Milestone();
      milestone.createdAt = new Date('2024-01-01T10:00:00Z');
      milestone.updatedAt = new Date('2024-01-02T15:30:00Z');

      expect(milestone.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(milestone.updatedAt).toEqual(new Date('2024-01-02T15:30:00Z'));
    });

    it('should support tracking update timestamps', () => {
      const milestone = new Milestone();
      milestone.createdAt = new Date('2024-01-01');
      milestone.updatedAt = new Date('2024-01-01');

      milestone.updatedAt = new Date('2024-02-15');

      expect(milestone.createdAt).toEqual(new Date('2024-01-01'));
      expect(milestone.updatedAt).toEqual(new Date('2024-02-15'));
    });
  });

  describe('complete milestone scenario', () => {
    it('should create a fully populated milestone', () => {
      const milestone = new Milestone();
      const project = new Project();

      project.id = 'proj-123';
      project.name = 'E-Commerce Project';

      milestone.id = 'milestone-789';
      milestone.name = 'Beta Release';
      milestone.description = 'Beta version release for internal testing';
      milestone.dueDate = new Date('2024-06-30');
      milestone.completed = false;
      milestone.projectId = project.id;
      milestone.project = project;
      milestone.createdAt = new Date('2024-01-01');
      milestone.updatedAt = new Date('2024-01-01');
      milestone.deletedAt = null;

      expect(milestone.id).toBe('milestone-789');
      expect(milestone.name).toBe('Beta Release');
      expect(milestone.description).toBe('Beta version release for internal testing');
      expect(milestone.dueDate).toEqual(new Date('2024-06-30'));
      expect(milestone.completed).toBe(false);
      expect(milestone.project.name).toBe('E-Commerce Project');
      expect(milestone.deletedAt).toBeNull();
    });

    it('should create a completed milestone', () => {
      const milestone = new Milestone();

      milestone.id = 'milestone-456';
      milestone.name = 'Alpha Release';
      milestone.description = 'Alpha version completed';
      milestone.dueDate = new Date('2024-03-15');
      milestone.completed = true;
      milestone.projectId = 'proj-123';
      milestone.createdAt = new Date('2024-01-01');
      milestone.updatedAt = new Date('2024-03-15');
      milestone.deletedAt = null;

      expect(milestone.completed).toBe(true);
      expect(milestone.name).toBe('Alpha Release');
    });
  });
});
