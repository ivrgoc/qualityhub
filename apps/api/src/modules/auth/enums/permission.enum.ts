/**
 * Permission enum defining all available permissions in the system.
 * These permissions are checked against user roles using the PermissionsGuard.
 */
export enum Permission {
  // Project permissions
  VIEW_PROJECT = 'view_project',
  CREATE_PROJECT = 'create_project',
  UPDATE_PROJECT = 'update_project',
  DELETE_PROJECT = 'delete_project',
  MANAGE_PROJECT_SETTINGS = 'manage_project_settings',

  // Test case permissions
  VIEW_TEST_CASE = 'view_test_case',
  CREATE_TEST_CASE = 'create_test_case',
  UPDATE_TEST_CASE = 'update_test_case',
  DELETE_TEST_CASE = 'delete_test_case',

  // Test run permissions
  VIEW_TEST_RUN = 'view_test_run',
  CREATE_TEST_RUN = 'create_test_run',
  UPDATE_TEST_RUN = 'update_test_run',
  DELETE_TEST_RUN = 'delete_test_run',
  EXECUTE_TEST_RUN = 'execute_test_run',
  ADD_TEST_RESULT = 'add_test_result',

  // Test plan permissions
  VIEW_TEST_PLAN = 'view_test_plan',
  CREATE_TEST_PLAN = 'create_test_plan',
  UPDATE_TEST_PLAN = 'update_test_plan',
  DELETE_TEST_PLAN = 'delete_test_plan',

  // Milestone permissions
  VIEW_MILESTONE = 'view_milestone',
  CREATE_MILESTONE = 'create_milestone',
  UPDATE_MILESTONE = 'update_milestone',
  DELETE_MILESTONE = 'delete_milestone',

  // Requirements permissions
  VIEW_REQUIREMENT = 'view_requirement',
  CREATE_REQUIREMENT = 'create_requirement',
  UPDATE_REQUIREMENT = 'update_requirement',
  DELETE_REQUIREMENT = 'delete_requirement',

  // User management permissions
  VIEW_USER = 'view_user',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  MANAGE_USER_ROLES = 'manage_user_roles',

  // Organization permissions
  MANAGE_ORGANIZATION = 'manage_organization',

  // Report permissions
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',

  // Integration permissions
  VIEW_INTEGRATIONS = 'view_integrations',
  MANAGE_INTEGRATIONS = 'manage_integrations',
}
