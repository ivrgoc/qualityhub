import { AuthResponseDto, AuthUserDto, TokensDto } from './auth-response.dto';
import { UserRole } from '../../users/entities/user.entity';

describe('AuthResponseDto', () => {
  describe('AuthUserDto', () => {
    it('should create an instance with all properties', () => {
      const userDto = new AuthUserDto();
      userDto.id = '123e4567-e89b-12d3-a456-426614174000';
      userDto.email = 'user@example.com';
      userDto.name = 'John Doe';
      userDto.role = UserRole.TESTER;
      userDto.orgId = '123e4567-e89b-12d3-a456-426614174001';

      expect(userDto.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(userDto.email).toBe('user@example.com');
      expect(userDto.name).toBe('John Doe');
      expect(userDto.role).toBe(UserRole.TESTER);
      expect(userDto.orgId).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should accept all UserRole values', () => {
      const userDto = new AuthUserDto();

      Object.values(UserRole).forEach((role) => {
        userDto.role = role;
        expect(userDto.role).toBe(role);
      });
    });
  });

  describe('TokensDto', () => {
    it('should create an instance with token properties', () => {
      const tokensDto = new TokensDto();
      tokensDto.accessToken = 'access-token-value';
      tokensDto.refreshToken = 'refresh-token-value';

      expect(tokensDto.accessToken).toBe('access-token-value');
      expect(tokensDto.refreshToken).toBe('refresh-token-value');
    });
  });

  describe('AuthResponseDto', () => {
    it('should create an instance with tokens and user', () => {
      const responseDto = new AuthResponseDto();
      responseDto.accessToken = 'access-token-value';
      responseDto.refreshToken = 'refresh-token-value';
      responseDto.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'John Doe',
        role: UserRole.TESTER,
        orgId: '123e4567-e89b-12d3-a456-426614174001',
      };

      expect(responseDto.accessToken).toBe('access-token-value');
      expect(responseDto.refreshToken).toBe('refresh-token-value');
      expect(responseDto.user).toBeDefined();
      expect(responseDto.user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(responseDto.user.email).toBe('user@example.com');
      expect(responseDto.user.name).toBe('John Doe');
      expect(responseDto.user.role).toBe(UserRole.TESTER);
      expect(responseDto.user.orgId).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should match the login response structure', () => {
      const loginResponse = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'user-uuid',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.LEAD,
          orgId: 'org-uuid',
        },
      };

      const responseDto = new AuthResponseDto();
      responseDto.accessToken = loginResponse.accessToken;
      responseDto.refreshToken = loginResponse.refreshToken;
      responseDto.user = loginResponse.user;

      expect(responseDto).toEqual(loginResponse);
    });

    it('should handle all user roles correctly', () => {
      const roles = [
        UserRole.VIEWER,
        UserRole.TESTER,
        UserRole.LEAD,
        UserRole.PROJECT_ADMIN,
        UserRole.ORG_ADMIN,
      ];

      roles.forEach((role) => {
        const responseDto = new AuthResponseDto();
        responseDto.accessToken = 'token';
        responseDto.refreshToken = 'refresh';
        responseDto.user = {
          id: 'id',
          email: 'email@test.com',
          name: 'Name',
          role,
          orgId: 'org-id',
        };

        expect(responseDto.user.role).toBe(role);
      });
    });
  });
});
