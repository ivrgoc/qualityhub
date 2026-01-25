import { describe, it, expect } from 'vitest';
import authReducer, { setUser, clearUser } from './authSlice';
import { UserRole } from '@/types';

describe('authSlice', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.TESTER,
    orgId: 'org-1',
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      user: null,
      isAuthenticated: false,
    });
  });

  it('should handle setUser', () => {
    const state = authReducer(undefined, setUser(mockUser));
    expect(state).toEqual({
      user: mockUser,
      isAuthenticated: true,
    });
  });

  it('should handle clearUser', () => {
    const previousState = {
      user: mockUser,
      isAuthenticated: true,
    };
    const state = authReducer(previousState, clearUser());
    expect(state).toEqual({
      user: null,
      isAuthenticated: false,
    });
  });
});
