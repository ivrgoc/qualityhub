import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { Permission } from '../enums/permission.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../../users/entities/user.entity';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const createMockExecutionContext = (user?: {
    id: string;
    role: UserRole;
  }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no permissions are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockExecutionContext({ id: '1', role: UserRole.VIEWER });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when empty permissions array', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = createMockExecutionContext({ id: '1', role: UserRole.VIEWER });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.VIEW_PROJECT]);
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied: User not authenticated',
      );
    });

    it('should allow access when user role has required permission', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.VIEW_PROJECT]);
      const context = createMockExecutionContext({
        id: '1',
        role: UserRole.VIEWER,
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user role lacks permission', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.CREATE_TEST_CASE]);
      const context = createMockExecutionContext({
        id: '1',
        role: UserRole.VIEWER,
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied: Insufficient permissions',
      );
    });

    it('should allow access when user has all required permissions', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([
          Permission.VIEW_PROJECT,
          Permission.VIEW_TEST_CASE,
          Permission.VIEW_TEST_RUN,
        ]);
      const context = createMockExecutionContext({
        id: '1',
        role: UserRole.VIEWER,
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user lacks one of multiple permissions', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.VIEW_PROJECT, Permission.CREATE_PROJECT]);
      const context = createMockExecutionContext({
        id: '1',
        role: UserRole.VIEWER,
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should check metadata from both handler and class', () => {
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.VIEW_PROJECT]);
      const context = createMockExecutionContext({
        id: '1',
        role: UserRole.VIEWER,
      });

      guard.canActivate(context);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    describe('role hierarchy', () => {
      it('should allow TESTER to execute tests', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([Permission.EXECUTE_TEST_RUN]);
        const context = createMockExecutionContext({
          id: '1',
          role: UserRole.TESTER,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should not allow TESTER to create test cases', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([Permission.CREATE_TEST_CASE]);
        const context = createMockExecutionContext({
          id: '1',
          role: UserRole.TESTER,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('should allow LEAD to create test cases', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([Permission.CREATE_TEST_CASE]);
        const context = createMockExecutionContext({
          id: '1',
          role: UserRole.LEAD,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should allow PROJECT_ADMIN to manage project settings', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([Permission.MANAGE_PROJECT_SETTINGS]);
        const context = createMockExecutionContext({
          id: '1',
          role: UserRole.PROJECT_ADMIN,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should allow ORG_ADMIN to manage organization', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([Permission.MANAGE_ORGANIZATION]);
        const context = createMockExecutionContext({
          id: '1',
          role: UserRole.ORG_ADMIN,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should not allow PROJECT_ADMIN to manage organization', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([Permission.MANAGE_ORGANIZATION]);
        const context = createMockExecutionContext({
          id: '1',
          role: UserRole.PROJECT_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });
    });
  });
});
