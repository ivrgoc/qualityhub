import { RefreshToken } from './refresh-token.entity';
import { User, UserRole } from './user.entity';

describe('RefreshToken Entity', () => {
  it('should create a refresh token instance', () => {
    const refreshToken = new RefreshToken();

    refreshToken.id = 'token-123';
    refreshToken.userId = 'user-456';
    refreshToken.token = 'jwt-refresh-token-string';
    refreshToken.expiresAt = new Date('2024-02-01');
    refreshToken.revokedAt = null;
    refreshToken.createdAt = new Date('2024-01-01');

    expect(refreshToken.id).toBe('token-123');
    expect(refreshToken.userId).toBe('user-456');
    expect(refreshToken.token).toBe('jwt-refresh-token-string');
    expect(refreshToken.expiresAt).toEqual(new Date('2024-02-01'));
    expect(refreshToken.revokedAt).toBeNull();
    expect(refreshToken.createdAt).toEqual(new Date('2024-01-01'));
  });

  it('should have a user relation', () => {
    const refreshToken = new RefreshToken();
    const user = new User();
    user.id = 'user-456';
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.role = UserRole.TESTER;

    refreshToken.user = user;

    expect(refreshToken.user).toBe(user);
    expect(refreshToken.user.id).toBe('user-456');
  });

  it('should allow setting revokedAt date', () => {
    const refreshToken = new RefreshToken();
    const revokedDate = new Date('2024-01-15');

    refreshToken.revokedAt = revokedDate;

    expect(refreshToken.revokedAt).toEqual(revokedDate);
  });
});
