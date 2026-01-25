import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../enums/permission.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { roleHasAllPermissions } from '../constants/role-permissions';
import { User } from '../../users/entities/user.entity';

/**
 * Guard that checks if the authenticated user has the required permissions.
 * Uses role-based permission mapping to determine access.
 *
 * This guard should be used after JwtAuthGuard to ensure the user is authenticated.
 *
 * @example
 * // Apply to a specific route
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions(Permission.CREATE_TEST_CASE)
 * @Post()
 * createTestCase() { }
 *
 * @example
 * // Apply to an entire controller
 * @Controller('test-cases')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class TestCasesController {
 *   @Permissions(Permission.VIEW_TEST_CASE)
 *   @Get()
 *   findAll() { }
 *
 *   @Permissions(Permission.CREATE_TEST_CASE)
 *   @Post()
 *   create() { }
 * }
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are specified, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User | undefined = request.user;

    // If no user is present, deny access
    if (!user) {
      throw new ForbiddenException('Access denied: User not authenticated');
    }

    // Check if the user's role has all required permissions
    const hasPermission = roleHasAllPermissions(user.role, requiredPermissions);

    if (!hasPermission) {
      throw new ForbiddenException(
        'Access denied: Insufficient permissions',
      );
    }

    return true;
  }
}
