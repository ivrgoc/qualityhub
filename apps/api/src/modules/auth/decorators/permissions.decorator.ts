import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route.
 * Used in conjunction with PermissionsGuard to enforce role-based access control.
 *
 * @param permissions - One or more permissions required to access the route
 *
 * @example
 * // Require a single permission
 * @Permissions(Permission.CREATE_TEST_CASE)
 * @Post()
 * createTestCase() { }
 *
 * @example
 * // Require multiple permissions (user must have ALL of them)
 * @Permissions(Permission.UPDATE_PROJECT, Permission.MANAGE_PROJECT_SETTINGS)
 * @Put('settings')
 * updateProjectSettings() { }
 *
 * @example
 * // Use with guards at controller or method level
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions(Permission.VIEW_TEST_CASE)
 * @Get()
 * getTestCases() { }
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
