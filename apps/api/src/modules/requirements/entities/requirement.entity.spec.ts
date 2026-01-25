import { Requirement, RequirementStatus, RequirementSource } from './requirement.entity';
import { RequirementCoverage } from './requirement-coverage.entity';
import { Project } from '../../projects/entities/project.entity';

describe('Requirement Entity', () => {
  it('should create a requirement instance', () => {
    const requirement = new Requirement();

    requirement.id = 'req-123';
    requirement.projectId = 'proj-456';
    requirement.title = 'User should be able to login';
    requirement.description = 'Users must authenticate with email and password';
    requirement.externalId = 'PROJ-100';
    requirement.source = RequirementSource.JIRA;
    requirement.status = RequirementStatus.APPROVED;
    requirement.customFields = { priority: 'high', component: 'auth' };
    requirement.createdBy = 'user-001';
    requirement.createdAt = new Date('2024-01-01');
    requirement.updatedAt = new Date('2024-01-01');
    requirement.deletedAt = null;

    expect(requirement.id).toBe('req-123');
    expect(requirement.projectId).toBe('proj-456');
    expect(requirement.title).toBe('User should be able to login');
    expect(requirement.description).toBe('Users must authenticate with email and password');
    expect(requirement.externalId).toBe('PROJ-100');
    expect(requirement.source).toBe(RequirementSource.JIRA);
    expect(requirement.status).toBe(RequirementStatus.APPROVED);
    expect(requirement.customFields).toEqual({ priority: 'high', component: 'auth' });
    expect(requirement.createdBy).toBe('user-001');
    expect(requirement.createdAt).toEqual(new Date('2024-01-01'));
    expect(requirement.updatedAt).toEqual(new Date('2024-01-01'));
    expect(requirement.deletedAt).toBeNull();
  });

  describe('title field', () => {
    it('should support title', () => {
      const requirement = new Requirement();
      requirement.title = 'User should be able to reset password';

      expect(requirement.title).toBe('User should be able to reset password');
    });

    it('should support different title values', () => {
      const requirement = new Requirement();

      requirement.title = 'Login functionality';
      expect(requirement.title).toBe('Login functionality');

      requirement.title = 'Password reset feature';
      expect(requirement.title).toBe('Password reset feature');
    });
  });

  describe('description field', () => {
    it('should support description', () => {
      const requirement = new Requirement();
      requirement.description = 'Detailed requirement description';

      expect(requirement.description).toBe('Detailed requirement description');
    });

    it('should support null description', () => {
      const requirement = new Requirement();
      requirement.description = null;

      expect(requirement.description).toBeNull();
    });
  });

  describe('externalId field', () => {
    it('should support externalId', () => {
      const requirement = new Requirement();
      requirement.externalId = 'JIRA-123';

      expect(requirement.externalId).toBe('JIRA-123');
    });

    it('should support null externalId', () => {
      const requirement = new Requirement();
      requirement.externalId = null;

      expect(requirement.externalId).toBeNull();
    });

    it('should support different external ID formats', () => {
      const requirement = new Requirement();

      requirement.externalId = 'PROJ-100';
      expect(requirement.externalId).toBe('PROJ-100');

      requirement.externalId = 'GH-456';
      expect(requirement.externalId).toBe('GH-456');

      requirement.externalId = 'ADO-789';
      expect(requirement.externalId).toBe('ADO-789');
    });
  });

  describe('source field', () => {
    it('should support JIRA source', () => {
      const requirement = new Requirement();
      requirement.source = RequirementSource.JIRA;

      expect(requirement.source).toBe(RequirementSource.JIRA);
    });

    it('should support GITHUB source', () => {
      const requirement = new Requirement();
      requirement.source = RequirementSource.GITHUB;

      expect(requirement.source).toBe(RequirementSource.GITHUB);
    });

    it('should support AZURE_DEVOPS source', () => {
      const requirement = new Requirement();
      requirement.source = RequirementSource.AZURE_DEVOPS;

      expect(requirement.source).toBe(RequirementSource.AZURE_DEVOPS);
    });

    it('should support MANUAL source', () => {
      const requirement = new Requirement();
      requirement.source = RequirementSource.MANUAL;

      expect(requirement.source).toBe(RequirementSource.MANUAL);
    });

    it('should support CONFLUENCE source', () => {
      const requirement = new Requirement();
      requirement.source = RequirementSource.CONFLUENCE;

      expect(requirement.source).toBe(RequirementSource.CONFLUENCE);
    });

    it('should support OTHER source', () => {
      const requirement = new Requirement();
      requirement.source = RequirementSource.OTHER;

      expect(requirement.source).toBe(RequirementSource.OTHER);
    });
  });

  describe('status field', () => {
    it('should support DRAFT status', () => {
      const requirement = new Requirement();
      requirement.status = RequirementStatus.DRAFT;

      expect(requirement.status).toBe(RequirementStatus.DRAFT);
    });

    it('should support APPROVED status', () => {
      const requirement = new Requirement();
      requirement.status = RequirementStatus.APPROVED;

      expect(requirement.status).toBe(RequirementStatus.APPROVED);
    });

    it('should support IN_PROGRESS status', () => {
      const requirement = new Requirement();
      requirement.status = RequirementStatus.IN_PROGRESS;

      expect(requirement.status).toBe(RequirementStatus.IN_PROGRESS);
    });

    it('should support COMPLETED status', () => {
      const requirement = new Requirement();
      requirement.status = RequirementStatus.COMPLETED;

      expect(requirement.status).toBe(RequirementStatus.COMPLETED);
    });

    it('should support DEPRECATED status', () => {
      const requirement = new Requirement();
      requirement.status = RequirementStatus.DEPRECATED;

      expect(requirement.status).toBe(RequirementStatus.DEPRECATED);
    });

    it('should transition through status values', () => {
      const requirement = new Requirement();

      requirement.status = RequirementStatus.DRAFT;
      expect(requirement.status).toBe(RequirementStatus.DRAFT);

      requirement.status = RequirementStatus.APPROVED;
      expect(requirement.status).toBe(RequirementStatus.APPROVED);

      requirement.status = RequirementStatus.IN_PROGRESS;
      expect(requirement.status).toBe(RequirementStatus.IN_PROGRESS);

      requirement.status = RequirementStatus.COMPLETED;
      expect(requirement.status).toBe(RequirementStatus.COMPLETED);
    });
  });

  describe('customFields field', () => {
    it('should support customFields object', () => {
      const requirement = new Requirement();
      requirement.customFields = {
        priority: 'high',
        component: 'authentication',
        labels: ['security', 'mvp'],
      };

      expect(requirement.customFields).toEqual({
        priority: 'high',
        component: 'authentication',
        labels: ['security', 'mvp'],
      });
    });

    it('should support null customFields', () => {
      const requirement = new Requirement();
      requirement.customFields = null;

      expect(requirement.customFields).toBeNull();
    });

    it('should support nested customFields objects', () => {
      const requirement = new Requirement();
      requirement.customFields = {
        metadata: {
          author: 'John Doe',
          version: '1.0',
        },
        tags: ['important'],
      };

      expect(requirement.customFields).toEqual({
        metadata: {
          author: 'John Doe',
          version: '1.0',
        },
        tags: ['important'],
      });
    });

    it('should support empty customFields object', () => {
      const requirement = new Requirement();
      requirement.customFields = {};

      expect(requirement.customFields).toEqual({});
    });
  });

  describe('createdBy field', () => {
    it('should support createdBy', () => {
      const requirement = new Requirement();
      requirement.createdBy = 'user-123';

      expect(requirement.createdBy).toBe('user-123');
    });

    it('should support null createdBy', () => {
      const requirement = new Requirement();
      requirement.createdBy = null;

      expect(requirement.createdBy).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      const requirement = new Requirement();
      requirement.createdAt = new Date('2024-01-01T10:00:00Z');

      expect(requirement.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should have updatedAt timestamp', () => {
      const requirement = new Requirement();
      requirement.updatedAt = new Date('2024-01-02T10:00:00Z');

      expect(requirement.updatedAt).toEqual(new Date('2024-01-02T10:00:00Z'));
    });

    it('should have deletedAt timestamp for soft delete', () => {
      const requirement = new Requirement();
      requirement.deletedAt = new Date('2024-01-03T10:00:00Z');

      expect(requirement.deletedAt).toEqual(new Date('2024-01-03T10:00:00Z'));
    });

    it('should have null deletedAt when not deleted', () => {
      const requirement = new Requirement();
      requirement.deletedAt = null;

      expect(requirement.deletedAt).toBeNull();
    });
  });

  describe('project relation', () => {
    it('should have project relation', () => {
      const requirement = new Requirement();
      const project = new Project();
      project.id = 'proj-123';
      project.name = 'Test Project';

      requirement.projectId = project.id;
      requirement.project = project;

      expect(requirement.project).toBe(project);
      expect(requirement.project.id).toBe('proj-123');
      expect(requirement.project.name).toBe('Test Project');
      expect(requirement.projectId).toBe(project.id);
    });
  });

  describe('coverages relation', () => {
    it('should have coverages relation', () => {
      const requirement = new Requirement();
      const coverage1 = new RequirementCoverage();
      const coverage2 = new RequirementCoverage();

      coverage1.id = 'coverage-1';
      coverage2.id = 'coverage-2';

      requirement.coverages = [coverage1, coverage2];

      expect(requirement.coverages).toHaveLength(2);
      expect(requirement.coverages[0].id).toBe('coverage-1');
      expect(requirement.coverages[1].id).toBe('coverage-2');
    });

    it('should support empty coverages array', () => {
      const requirement = new Requirement();
      requirement.coverages = [];

      expect(requirement.coverages).toHaveLength(0);
    });
  });

  describe('soft delete', () => {
    it('should support soft delete with deletedAt', () => {
      const requirement = new Requirement();
      requirement.id = 'req-123';
      requirement.title = 'Requirement to delete';
      requirement.deletedAt = null;

      expect(requirement.deletedAt).toBeNull();

      requirement.deletedAt = new Date('2024-06-01');

      expect(requirement.deletedAt).toEqual(new Date('2024-06-01'));
    });

    it('should handle active requirement (not deleted)', () => {
      const requirement = new Requirement();
      requirement.id = 'req-123';
      requirement.title = 'Active requirement';
      requirement.deletedAt = null;

      const isDeleted = requirement.deletedAt !== null;

      expect(isDeleted).toBe(false);
    });

    it('should identify deleted requirement', () => {
      const requirement = new Requirement();
      requirement.id = 'req-123';
      requirement.title = 'Deleted requirement';
      requirement.deletedAt = new Date('2024-06-01');

      const isDeleted = requirement.deletedAt !== null;

      expect(isDeleted).toBe(true);
    });
  });

  describe('complete requirement scenario', () => {
    it('should create a fully populated requirement', () => {
      const requirement = new Requirement();
      const project = new Project();

      project.id = 'proj-123';
      project.name = 'E-Commerce Project';

      requirement.id = 'req-789';
      requirement.title = 'User authentication requirement';
      requirement.description = 'Users must be able to login and logout securely';
      requirement.externalId = 'PROJ-001';
      requirement.source = RequirementSource.JIRA;
      requirement.status = RequirementStatus.APPROVED;
      requirement.customFields = { priority: 'critical', sprint: 'Sprint 1' };
      requirement.projectId = project.id;
      requirement.project = project;
      requirement.createdBy = 'user-001';
      requirement.createdAt = new Date('2024-01-01');
      requirement.updatedAt = new Date('2024-01-01');
      requirement.deletedAt = null;

      expect(requirement.id).toBe('req-789');
      expect(requirement.title).toBe('User authentication requirement');
      expect(requirement.description).toBe('Users must be able to login and logout securely');
      expect(requirement.externalId).toBe('PROJ-001');
      expect(requirement.source).toBe(RequirementSource.JIRA);
      expect(requirement.status).toBe(RequirementStatus.APPROVED);
      expect(requirement.customFields).toEqual({ priority: 'critical', sprint: 'Sprint 1' });
      expect(requirement.project.name).toBe('E-Commerce Project');
      expect(requirement.createdBy).toBe('user-001');
      expect(requirement.deletedAt).toBeNull();
    });

    it('should create a requirement without optional fields', () => {
      const requirement = new Requirement();

      requirement.id = 'req-minimal';
      requirement.title = 'Minimal Requirement';
      requirement.projectId = 'proj-123';
      requirement.source = RequirementSource.MANUAL;
      requirement.status = RequirementStatus.DRAFT;
      requirement.description = null;
      requirement.externalId = null;
      requirement.customFields = null;
      requirement.createdBy = null;

      expect(requirement.title).toBe('Minimal Requirement');
      expect(requirement.description).toBeNull();
      expect(requirement.externalId).toBeNull();
      expect(requirement.customFields).toBeNull();
      expect(requirement.createdBy).toBeNull();
    });

    it('should create a deprecated requirement', () => {
      const requirement = new Requirement();

      requirement.id = 'req-deprecated';
      requirement.title = 'Deprecated Feature';
      requirement.status = RequirementStatus.DEPRECATED;

      expect(requirement.status).toBe(RequirementStatus.DEPRECATED);
    });
  });
});

describe('RequirementStatus Enum', () => {
  it('should have DRAFT value', () => {
    expect(RequirementStatus.DRAFT).toBe('draft');
  });

  it('should have APPROVED value', () => {
    expect(RequirementStatus.APPROVED).toBe('approved');
  });

  it('should have IN_PROGRESS value', () => {
    expect(RequirementStatus.IN_PROGRESS).toBe('in_progress');
  });

  it('should have COMPLETED value', () => {
    expect(RequirementStatus.COMPLETED).toBe('completed');
  });

  it('should have DEPRECATED value', () => {
    expect(RequirementStatus.DEPRECATED).toBe('deprecated');
  });
});

describe('RequirementSource Enum', () => {
  it('should have JIRA value', () => {
    expect(RequirementSource.JIRA).toBe('jira');
  });

  it('should have GITHUB value', () => {
    expect(RequirementSource.GITHUB).toBe('github');
  });

  it('should have AZURE_DEVOPS value', () => {
    expect(RequirementSource.AZURE_DEVOPS).toBe('azure_devops');
  });

  it('should have MANUAL value', () => {
    expect(RequirementSource.MANUAL).toBe('manual');
  });

  it('should have CONFLUENCE value', () => {
    expect(RequirementSource.CONFLUENCE).toBe('confluence');
  });

  it('should have OTHER value', () => {
    expect(RequirementSource.OTHER).toBe('other');
  });
});
