import { ProjectMember, ProjectRole } from './project-member.entity';
import { Project } from './project.entity';
import { User, UserRole } from '../../users/entities/user.entity';

describe('ProjectMember Entity', () => {
  it('should create a project member instance', () => {
    const projectMember = new ProjectMember();

    projectMember.id = 'member-123';
    projectMember.projectId = 'proj-456';
    projectMember.userId = 'user-789';
    projectMember.role = ProjectRole.TESTER;
    projectMember.createdAt = new Date('2024-01-01');

    expect(projectMember.id).toBe('member-123');
    expect(projectMember.projectId).toBe('proj-456');
    expect(projectMember.userId).toBe('user-789');
    expect(projectMember.role).toBe(ProjectRole.TESTER);
    expect(projectMember.createdAt).toEqual(new Date('2024-01-01'));
  });

  describe('ProjectRole enum', () => {
    it('should have all expected roles', () => {
      expect(ProjectRole.VIEWER).toBe('viewer');
      expect(ProjectRole.TESTER).toBe('tester');
      expect(ProjectRole.LEAD).toBe('lead');
      expect(ProjectRole.ADMIN).toBe('admin');
    });
  });

  it('should have project relation', () => {
    const projectMember = new ProjectMember();
    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Test Project';
    project.organizationId = 'org-456';

    projectMember.projectId = project.id;
    projectMember.project = project;

    expect(projectMember.project).toBe(project);
    expect(projectMember.project.id).toBe('proj-123');
    expect(projectMember.project.name).toBe('Test Project');
    expect(projectMember.projectId).toBe(project.id);
  });

  it('should have user relation', () => {
    const projectMember = new ProjectMember();
    const user = new User();
    user.id = 'user-123';
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.role = UserRole.TESTER;
    user.organizationId = 'org-456';

    projectMember.userId = user.id;
    projectMember.user = user;

    expect(projectMember.user).toBe(user);
    expect(projectMember.user.id).toBe('user-123');
    expect(projectMember.user.email).toBe('test@example.com');
    expect(projectMember.userId).toBe(user.id);
  });

  it('should support different project roles', () => {
    const viewerMember = new ProjectMember();
    viewerMember.role = ProjectRole.VIEWER;
    expect(viewerMember.role).toBe('viewer');

    const testerMember = new ProjectMember();
    testerMember.role = ProjectRole.TESTER;
    expect(testerMember.role).toBe('tester');

    const leadMember = new ProjectMember();
    leadMember.role = ProjectRole.LEAD;
    expect(leadMember.role).toBe('lead');

    const adminMember = new ProjectMember();
    adminMember.role = ProjectRole.ADMIN;
    expect(adminMember.role).toBe('admin');
  });

  it('should have both project and user relations together', () => {
    const projectMember = new ProjectMember();

    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Team Project';

    const user = new User();
    user.id = 'user-456';
    user.email = 'team.member@example.com';
    user.name = 'Team Member';

    projectMember.id = 'member-789';
    projectMember.projectId = project.id;
    projectMember.project = project;
    projectMember.userId = user.id;
    projectMember.user = user;
    projectMember.role = ProjectRole.LEAD;
    projectMember.createdAt = new Date('2024-03-15');

    expect(projectMember.project.name).toBe('Team Project');
    expect(projectMember.user.name).toBe('Team Member');
    expect(projectMember.role).toBe(ProjectRole.LEAD);
  });
});
