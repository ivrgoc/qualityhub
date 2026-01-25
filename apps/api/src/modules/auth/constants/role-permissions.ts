import { UserRole } from '../../users/entities/user.entity';
import { Permission } from '../enums/permission.enum';

/**
 * Mapping of user roles to their granted permissions.
 * Roles are hierarchical: higher roles include all permissions of lower roles.
 *
 * Role hierarchy (lowest to highest):
 * 1. VIEWER - Read-only access
 * 2. TESTER - Execute tests, add results
 * 3. LEAD - Create/edit tests, manage runs
 * 4. PROJECT_ADMIN - Manage project settings
 * 5. ORG_ADMIN - Full access
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [
    // View-only permissions
    Permission.VIEW_PROJECT,
    Permission.VIEW_TEST_CASE,
    Permission.VIEW_TEST_RUN,
    Permission.VIEW_TEST_PLAN,
    Permission.VIEW_MILESTONE,
    Permission.VIEW_REQUIREMENT,
    Permission.VIEW_USER,
    Permission.VIEW_REPORTS,
    Permission.VIEW_INTEGRATIONS,
  ],

  [UserRole.TESTER]: [
    // All VIEWER permissions
    Permission.VIEW_PROJECT,
    Permission.VIEW_TEST_CASE,
    Permission.VIEW_TEST_RUN,
    Permission.VIEW_TEST_PLAN,
    Permission.VIEW_MILESTONE,
    Permission.VIEW_REQUIREMENT,
    Permission.VIEW_USER,
    Permission.VIEW_REPORTS,
    Permission.VIEW_INTEGRATIONS,
    // TESTER-specific permissions
    Permission.EXECUTE_TEST_RUN,
    Permission.ADD_TEST_RESULT,
  ],

  [UserRole.LEAD]: [
    // All TESTER permissions
    Permission.VIEW_PROJECT,
    Permission.VIEW_TEST_CASE,
    Permission.VIEW_TEST_RUN,
    Permission.VIEW_TEST_PLAN,
    Permission.VIEW_MILESTONE,
    Permission.VIEW_REQUIREMENT,
    Permission.VIEW_USER,
    Permission.VIEW_REPORTS,
    Permission.VIEW_INTEGRATIONS,
    Permission.EXECUTE_TEST_RUN,
    Permission.ADD_TEST_RESULT,
    // LEAD-specific permissions
    Permission.CREATE_TEST_CASE,
    Permission.UPDATE_TEST_CASE,
    Permission.DELETE_TEST_CASE,
    Permission.CREATE_TEST_RUN,
    Permission.UPDATE_TEST_RUN,
    Permission.DELETE_TEST_RUN,
    Permission.CREATE_TEST_PLAN,
    Permission.UPDATE_TEST_PLAN,
    Permission.DELETE_TEST_PLAN,
    Permission.CREATE_MILESTONE,
    Permission.UPDATE_MILESTONE,
    Permission.DELETE_MILESTONE,
    Permission.CREATE_REQUIREMENT,
    Permission.UPDATE_REQUIREMENT,
    Permission.DELETE_REQUIREMENT,
    Permission.EXPORT_REPORTS,
  ],

  [UserRole.PROJECT_ADMIN]: [
    // All LEAD permissions
    Permission.VIEW_PROJECT,
    Permission.VIEW_TEST_CASE,
    Permission.VIEW_TEST_RUN,
    Permission.VIEW_TEST_PLAN,
    Permission.VIEW_MILESTONE,
    Permission.VIEW_REQUIREMENT,
    Permission.VIEW_USER,
    Permission.VIEW_REPORTS,
    Permission.VIEW_INTEGRATIONS,
    Permission.EXECUTE_TEST_RUN,
    Permission.ADD_TEST_RESULT,
    Permission.CREATE_TEST_CASE,
    Permission.UPDATE_TEST_CASE,
    Permission.DELETE_TEST_CASE,
    Permission.CREATE_TEST_RUN,
    Permission.UPDATE_TEST_RUN,
    Permission.DELETE_TEST_RUN,
    Permission.CREATE_TEST_PLAN,
    Permission.UPDATE_TEST_PLAN,
    Permission.DELETE_TEST_PLAN,
    Permission.CREATE_MILESTONE,
    Permission.UPDATE_MILESTONE,
    Permission.DELETE_MILESTONE,
    Permission.CREATE_REQUIREMENT,
    Permission.UPDATE_REQUIREMENT,
    Permission.DELETE_REQUIREMENT,
    Permission.EXPORT_REPORTS,
    // PROJECT_ADMIN-specific permissions
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.MANAGE_INTEGRATIONS,
  ],

  [UserRole.ORG_ADMIN]: [
    // Full access - all permissions
    Permission.VIEW_PROJECT,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.VIEW_TEST_CASE,
    Permission.CREATE_TEST_CASE,
    Permission.UPDATE_TEST_CASE,
    Permission.DELETE_TEST_CASE,
    Permission.VIEW_TEST_RUN,
    Permission.CREATE_TEST_RUN,
    Permission.UPDATE_TEST_RUN,
    Permission.DELETE_TEST_RUN,
    Permission.EXECUTE_TEST_RUN,
    Permission.ADD_TEST_RESULT,
    Permission.VIEW_TEST_PLAN,
    Permission.CREATE_TEST_PLAN,
    Permission.UPDATE_TEST_PLAN,
    Permission.DELETE_TEST_PLAN,
    Permission.VIEW_MILESTONE,
    Permission.CREATE_MILESTONE,
    Permission.UPDATE_MILESTONE,
    Permission.DELETE_MILESTONE,
    Permission.VIEW_REQUIREMENT,
    Permission.CREATE_REQUIREMENT,
    Permission.UPDATE_REQUIREMENT,
    Permission.DELETE_REQUIREMENT,
    Permission.VIEW_USER,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_USER_ROLES,
    Permission.MANAGE_ORGANIZATION,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_INTEGRATIONS,
    Permission.MANAGE_INTEGRATIONS,
  ],
};

/**
 * Check if a role has a specific permission.
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns true if the role has the permission
 */
export function roleHasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions.
 * @param role - The user's role
 * @param permissions - The permissions to check
 * @returns true if the role has all permissions
 */
export function roleHasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => roleHasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions.
 * @param role - The user's role
 * @param permissions - The permissions to check
 * @returns true if the role has at least one permission
 */
export function roleHasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => roleHasPermission(role, permission));
}
