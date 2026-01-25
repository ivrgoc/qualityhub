export enum UserRole {
  VIEWER = 'viewer',
  TESTER = 'tester',
  LEAD = 'lead',
  PROJECT_ADMIN = 'project_admin',
  ORG_ADMIN = 'org_admin',
}

export const USER_ROLE_VALUES = Object.values(UserRole);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLE_VALUES.includes(value as UserRole);
}
