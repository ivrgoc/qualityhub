import { UserRole } from '../../users/entities/user.entity';
import { Permission } from '../enums/permission.enum';
import {
  ROLE_PERMISSIONS,
  roleHasPermission,
  roleHasAllPermissions,
  roleHasAnyPermission,
} from './role-permissions';

describe('Role Permissions', () => {
  describe('ROLE_PERMISSIONS', () => {
    it('should define permissions for all roles', () => {
      expect(ROLE_PERMISSIONS[UserRole.VIEWER]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.TESTER]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.LEAD]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.PROJECT_ADMIN]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.ORG_ADMIN]).toBeDefined();
    });

    it('should give VIEWER read-only access', () => {
      const viewerPermissions = ROLE_PERMISSIONS[UserRole.VIEWER];

      // Should have view permissions
      expect(viewerPermissions).toContain(Permission.VIEW_PROJECT);
      expect(viewerPermissions).toContain(Permission.VIEW_TEST_CASE);
      expect(viewerPermissions).toContain(Permission.VIEW_TEST_RUN);

      // Should not have create/update/delete permissions
      expect(viewerPermissions).not.toContain(Permission.CREATE_PROJECT);
      expect(viewerPermissions).not.toContain(Permission.CREATE_TEST_CASE);
      expect(viewerPermissions).not.toContain(Permission.EXECUTE_TEST_RUN);
    });

    it('should give TESTER ability to execute tests', () => {
      const testerPermissions = ROLE_PERMISSIONS[UserRole.TESTER];

      expect(testerPermissions).toContain(Permission.VIEW_PROJECT);
      expect(testerPermissions).toContain(Permission.EXECUTE_TEST_RUN);
      expect(testerPermissions).toContain(Permission.ADD_TEST_RESULT);

      // Should not have create/edit test case permissions
      expect(testerPermissions).not.toContain(Permission.CREATE_TEST_CASE);
      expect(testerPermissions).not.toContain(Permission.UPDATE_TEST_CASE);
    });

    it('should give LEAD ability to create and manage tests', () => {
      const leadPermissions = ROLE_PERMISSIONS[UserRole.LEAD];

      expect(leadPermissions).toContain(Permission.CREATE_TEST_CASE);
      expect(leadPermissions).toContain(Permission.UPDATE_TEST_CASE);
      expect(leadPermissions).toContain(Permission.DELETE_TEST_CASE);
      expect(leadPermissions).toContain(Permission.CREATE_TEST_RUN);
      expect(leadPermissions).toContain(Permission.EXECUTE_TEST_RUN);

      // Should not have project management permissions
      expect(leadPermissions).not.toContain(Permission.CREATE_PROJECT);
      expect(leadPermissions).not.toContain(Permission.MANAGE_PROJECT_SETTINGS);
    });

    it('should give PROJECT_ADMIN project management permissions', () => {
      const projectAdminPermissions = ROLE_PERMISSIONS[UserRole.PROJECT_ADMIN];

      expect(projectAdminPermissions).toContain(Permission.CREATE_PROJECT);
      expect(projectAdminPermissions).toContain(Permission.UPDATE_PROJECT);
      expect(projectAdminPermissions).toContain(
        Permission.MANAGE_PROJECT_SETTINGS,
      );

      // Should not have org management permissions
      expect(projectAdminPermissions).not.toContain(
        Permission.MANAGE_ORGANIZATION,
      );
      expect(projectAdminPermissions).not.toContain(Permission.DELETE_USER);
    });

    it('should give ORG_ADMIN full access', () => {
      const orgAdminPermissions = ROLE_PERMISSIONS[UserRole.ORG_ADMIN];

      // Should have all critical permissions
      expect(orgAdminPermissions).toContain(Permission.MANAGE_ORGANIZATION);
      expect(orgAdminPermissions).toContain(Permission.MANAGE_USER_ROLES);
      expect(orgAdminPermissions).toContain(Permission.DELETE_PROJECT);
      expect(orgAdminPermissions).toContain(Permission.DELETE_USER);
    });
  });

  describe('roleHasPermission', () => {
    it('should return true when role has the permission', () => {
      expect(
        roleHasPermission(UserRole.VIEWER, Permission.VIEW_PROJECT),
      ).toBe(true);
    });

    it('should return false when role lacks the permission', () => {
      expect(
        roleHasPermission(UserRole.VIEWER, Permission.CREATE_PROJECT),
      ).toBe(false);
    });

    it('should work for all roles', () => {
      expect(
        roleHasPermission(UserRole.TESTER, Permission.EXECUTE_TEST_RUN),
      ).toBe(true);
      expect(
        roleHasPermission(UserRole.LEAD, Permission.CREATE_TEST_CASE),
      ).toBe(true);
      expect(
        roleHasPermission(UserRole.PROJECT_ADMIN, Permission.MANAGE_PROJECT_SETTINGS),
      ).toBe(true);
      expect(
        roleHasPermission(UserRole.ORG_ADMIN, Permission.MANAGE_ORGANIZATION),
      ).toBe(true);
    });
  });

  describe('roleHasAllPermissions', () => {
    it('should return true when role has all permissions', () => {
      expect(
        roleHasAllPermissions(UserRole.VIEWER, [
          Permission.VIEW_PROJECT,
          Permission.VIEW_TEST_CASE,
        ]),
      ).toBe(true);
    });

    it('should return false when role lacks any permission', () => {
      expect(
        roleHasAllPermissions(UserRole.VIEWER, [
          Permission.VIEW_PROJECT,
          Permission.CREATE_PROJECT,
        ]),
      ).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(roleHasAllPermissions(UserRole.VIEWER, [])).toBe(true);
    });
  });

  describe('roleHasAnyPermission', () => {
    it('should return true when role has at least one permission', () => {
      expect(
        roleHasAnyPermission(UserRole.VIEWER, [
          Permission.VIEW_PROJECT,
          Permission.CREATE_PROJECT,
        ]),
      ).toBe(true);
    });

    it('should return false when role has none of the permissions', () => {
      expect(
        roleHasAnyPermission(UserRole.VIEWER, [
          Permission.CREATE_PROJECT,
          Permission.DELETE_PROJECT,
        ]),
      ).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(roleHasAnyPermission(UserRole.VIEWER, [])).toBe(false);
    });
  });
});
