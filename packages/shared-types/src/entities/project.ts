export enum ProjectRole {
  VIEWER = 'viewer',
  TESTER = 'tester',
  LEAD = 'lead',
  ADMIN = 'admin',
}

export const PROJECT_ROLE_VALUES = Object.values(ProjectRole);

export function isProjectRole(value: unknown): value is ProjectRole {
  return typeof value === 'string' && PROJECT_ROLE_VALUES.includes(value as ProjectRole);
}

export interface ProjectSettings {
  defaultPriority?: string;
  allowedStatuses?: string[];
  customFields?: Record<string, unknown>;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string;
  settings?: ProjectSettings;
  createdAt: string;
  deletedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  settings?: ProjectSettings;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  settings?: ProjectSettings;
}

export interface AddProjectMemberDto {
  userId: string;
  role: ProjectRole;
}

export interface UpdateProjectMemberDto {
  role: ProjectRole;
}
