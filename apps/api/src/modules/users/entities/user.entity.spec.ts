import { User, UserRole } from './user.entity';
import { RefreshToken } from './refresh-token.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();

    user.id = 'user-123';
    user.orgId = 'org-456';
    user.email = 'test@example.com';
    user.passwordHash = 'hashed-password';
    user.name = 'Test User';
    user.role = UserRole.TESTER;
    user.settings = null;
    user.createdAt = new Date('2024-01-01');

    expect(user.id).toBe('user-123');
    expect(user.orgId).toBe('org-456');
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBe('hashed-password');
    expect(user.name).toBe('Test User');
    expect(user.role).toBe(UserRole.TESTER);
    expect(user.settings).toBeNull();
    expect(user.createdAt).toEqual(new Date('2024-01-01'));
  });

  describe('UserRole enum', () => {
    it('should have all expected roles', () => {
      expect(UserRole.VIEWER).toBe('viewer');
      expect(UserRole.TESTER).toBe('tester');
      expect(UserRole.LEAD).toBe('lead');
      expect(UserRole.PROJECT_ADMIN).toBe('project_admin');
      expect(UserRole.ORG_ADMIN).toBe('org_admin');
    });
  });

  it('should support settings as a JSON object', () => {
    const user = new User();
    const settings = {
      theme: 'dark',
      notifications: true,
      language: 'en',
    };

    user.settings = settings;

    expect(user.settings).toEqual(settings);
    expect(user.settings.theme).toBe('dark');
  });

  it('should have refreshTokens relation', () => {
    const user = new User();
    const refreshToken1 = new RefreshToken();
    refreshToken1.id = 'token-1';
    refreshToken1.token = 'token-string-1';

    const refreshToken2 = new RefreshToken();
    refreshToken2.id = 'token-2';
    refreshToken2.token = 'token-string-2';

    user.refreshTokens = [refreshToken1, refreshToken2];

    expect(user.refreshTokens).toHaveLength(2);
    expect(user.refreshTokens[0].id).toBe('token-1');
    expect(user.refreshTokens[1].id).toBe('token-2');
  });
});
