export enum UserRole {
  VIEWER = 'viewer',
  TESTER = 'tester',
  LEAD = 'lead',
  ADMIN = 'admin',
}

export const USER_ROLE_VALUES = Object.values(UserRole);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLE_VALUES.includes(value as UserRole);
}
