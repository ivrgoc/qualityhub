import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';
import { User, UserRole } from '../../users/entities/user.entity';

describe('CurrentUser Decorator', () => {
  const mockUser: User = {
    id: 'user-123',
    orgId: 'org-456',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: UserRole.TESTER,
    createdAt: new Date('2024-01-01'),
  };

  const createMockExecutionContext = (user: User | undefined): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  const getParamDecoratorFactory = () => {
    class TestClass {
      testMethod(@CurrentUser() _user: User) {}
    }
    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestClass,
      'testMethod',
    );
    const key = Object.keys(metadata)[0];
    return metadata[key].factory;
  };

  describe('when user exists in request', () => {
    it('should return the entire user object when no property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory(undefined, ctx);

      expect(result).toEqual(mockUser);
    });

    it('should return user id when "id" property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory('id', ctx);

      expect(result).toBe('user-123');
    });

    it('should return user email when "email" property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory('email', ctx);

      expect(result).toBe('test@example.com');
    });

    it('should return user name when "name" property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory('name', ctx);

      expect(result).toBe('Test User');
    });

    it('should return user role when "role" property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory('role', ctx);

      expect(result).toBe(UserRole.TESTER);
    });

    it('should return user orgId when "orgId" property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory('orgId', ctx);

      expect(result).toBe('org-456');
    });

    it('should return user createdAt when "createdAt" property is specified', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(mockUser);

      const result = factory('createdAt', ctx);

      expect(result).toEqual(new Date('2024-01-01'));
    });
  });

  describe('when user does not exist in request', () => {
    it('should return undefined when no user in request', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(undefined);

      const result = factory(undefined, ctx);

      expect(result).toBeUndefined();
    });

    it('should return undefined when property is specified but no user', () => {
      const factory = getParamDecoratorFactory();
      const ctx = createMockExecutionContext(undefined);

      const result = factory('id', ctx);

      expect(result).toBeUndefined();
    });
  });
});
