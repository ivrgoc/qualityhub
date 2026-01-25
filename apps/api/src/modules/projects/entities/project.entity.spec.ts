import { Project } from './project.entity';
import { ProjectMember, ProjectRole } from './project-member.entity';
import {
  Organization,
  OrganizationPlan,
} from '../../organizations/entities/organization.entity';

describe('Project Entity', () => {
  it('should create a project instance', () => {
    const project = new Project();

    project.id = 'proj-123';
    project.organizationId = 'org-456';
    project.name = 'Test Project';
    project.description = 'A test project description';
    project.settings = null;
    project.createdAt = new Date('2024-01-01');
    project.updatedAt = new Date('2024-01-02');
    project.deletedAt = null;

    expect(project.id).toBe('proj-123');
    expect(project.organizationId).toBe('org-456');
    expect(project.name).toBe('Test Project');
    expect(project.description).toBe('A test project description');
    expect(project.settings).toBeNull();
    expect(project.createdAt).toEqual(new Date('2024-01-01'));
    expect(project.updatedAt).toEqual(new Date('2024-01-02'));
    expect(project.deletedAt).toBeNull();
  });

  it('should support optional description', () => {
    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Project Without Description';

    expect(project.description).toBeUndefined();
  });

  it('should support settings as a JSON object', () => {
    const project = new Project();
    const settings = {
      defaultPriority: 'medium',
      enableNotifications: true,
      customFields: ['field1', 'field2'],
      integrations: { jira: { enabled: true } },
    };

    project.settings = settings;

    expect(project.settings).toEqual(settings);
    expect(project.settings.defaultPriority).toBe('medium');
    expect(project.settings.enableNotifications).toBe(true);
    expect(project.settings.customFields).toHaveLength(2);
  });

  it('should support soft delete with deletedAt', () => {
    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Project to Delete';
    project.deletedAt = null;

    expect(project.deletedAt).toBeNull();

    project.deletedAt = new Date('2024-06-01');

    expect(project.deletedAt).toEqual(new Date('2024-06-01'));
  });

  it('should have organization relation', () => {
    const project = new Project();
    const organization = new Organization();
    organization.id = 'org-123';
    organization.name = 'Test Organization';
    organization.slug = 'test-org';
    organization.plan = OrganizationPlan.PROFESSIONAL;

    project.organizationId = organization.id;
    project.organization = organization;

    expect(project.organization).toBe(organization);
    expect(project.organization.id).toBe('org-123');
    expect(project.organization.name).toBe('Test Organization');
    expect(project.organizationId).toBe(organization.id);
  });

  it('should have members relation', () => {
    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Project with Members';

    const member1 = new ProjectMember();
    member1.id = 'member-1';
    member1.projectId = project.id;
    member1.userId = 'user-1';
    member1.role = ProjectRole.ADMIN;

    const member2 = new ProjectMember();
    member2.id = 'member-2';
    member2.projectId = project.id;
    member2.userId = 'user-2';
    member2.role = ProjectRole.TESTER;

    project.members = [member1, member2];

    expect(project.members).toHaveLength(2);
    expect(project.members[0].id).toBe('member-1');
    expect(project.members[0].role).toBe(ProjectRole.ADMIN);
    expect(project.members[1].id).toBe('member-2');
    expect(project.members[1].role).toBe(ProjectRole.TESTER);
  });

  it('should handle empty members array', () => {
    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Empty Project';
    project.members = [];

    expect(project.members).toHaveLength(0);
    expect(project.members).toEqual([]);
  });
});
