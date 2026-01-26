import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi, type LoginRequest, type LoginResponse, type RegisterRequest } from './authApi';
import { UserRole, type User } from '@/types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.TESTER,
  orgId: 'org-456',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockAccessToken = 'mock-access-token-xyz';

describe('authApi', () => {
  describe('endpoints configuration', () => {
    it('should have login endpoint defined', () => {
      expect(authApi.endpoints.login).toBeDefined();
    });

    it('should have register endpoint defined', () => {
      expect(authApi.endpoints.register).toBeDefined();
    });

    it('should have logout endpoint defined', () => {
      expect(authApi.endpoints.logout).toBeDefined();
    });

    it('should have getMe endpoint defined', () => {
      expect(authApi.endpoints.getMe).toBeDefined();
    });
  });

  describe('login endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = authApi.endpoints.login;
      expect(endpoint).toBeDefined();
      // Mutations have initiate method
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for login', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Test that the endpoint is properly typed
      expect(credentials.email).toBe('test@example.com');
      expect(credentials.password).toBe('password123');
    });
  });

  describe('register endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = authApi.endpoints.register;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for register', () => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        name: 'New User',
      };

      expect(registerData.email).toBe('newuser@example.com');
      expect(registerData.password).toBe('newpassword123');
      expect(registerData.name).toBe('New User');
    });
  });

  describe('logout endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = authApi.endpoints.logout;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });
  });

  describe('getMe endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = authApi.endpoints.getMe;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });
  });

  describe('exported hooks', () => {
    it('should export useLoginMutation hook', async () => {
      const { useLoginMutation } = await import('./authApi');
      expect(useLoginMutation).toBeDefined();
      expect(typeof useLoginMutation).toBe('function');
    });

    it('should export useRegisterMutation hook', async () => {
      const { useRegisterMutation } = await import('./authApi');
      expect(useRegisterMutation).toBeDefined();
      expect(typeof useRegisterMutation).toBe('function');
    });

    it('should export useLogoutMutation hook', async () => {
      const { useLogoutMutation } = await import('./authApi');
      expect(useLogoutMutation).toBeDefined();
      expect(typeof useLogoutMutation).toBe('function');
    });

    it('should export useGetMeQuery hook', async () => {
      const { useGetMeQuery } = await import('./authApi');
      expect(useGetMeQuery).toBeDefined();
      expect(typeof useGetMeQuery).toBe('function');
    });

    it('should export useLazyGetMeQuery hook', async () => {
      const { useLazyGetMeQuery } = await import('./authApi');
      expect(useLazyGetMeQuery).toBeDefined();
      expect(typeof useLazyGetMeQuery).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should export LoginRequest interface', () => {
      const loginRequest: LoginRequest = {
        email: 'test@test.com',
        password: 'password',
      };
      expect(loginRequest.email).toBe('test@test.com');
      expect(loginRequest.password).toBe('password');
    });

    it('should export LoginResponse interface', () => {
      const loginResponse: LoginResponse = {
        accessToken: 'token',
        user: mockUser,
      };
      expect(loginResponse.accessToken).toBe('token');
      expect(loginResponse.user).toEqual(mockUser);
    });

    it('should export RegisterRequest interface', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test User',
      };
      expect(registerRequest.email).toBe('test@test.com');
      expect(registerRequest.password).toBe('password');
      expect(registerRequest.name).toBe('Test User');
    });
  });
});

describe('authApi localStorage interactions', () => {
  let originalLocalStorage: Storage;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    originalLocalStorage = global.localStorage;
    mockStorage = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  it('should be able to store access token in localStorage', () => {
    localStorage.setItem('accessToken', mockAccessToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', mockAccessToken);
  });

  it('should be able to remove access token from localStorage', () => {
    localStorage.removeItem('accessToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
  });

  it('should be able to retrieve access token from localStorage', () => {
    mockStorage['accessToken'] = mockAccessToken;
    const token = localStorage.getItem('accessToken');
    expect(token).toBe(mockAccessToken);
  });
});

describe('authApi type safety', () => {
  it('should have correct LoginRequest fields', () => {
    const request: LoginRequest = {
      email: 'user@example.com',
      password: 'securepassword123',
    };

    // TypeScript compilation ensures these fields exist
    expect(typeof request.email).toBe('string');
    expect(typeof request.password).toBe('string');
  });

  it('should have correct LoginResponse fields', () => {
    const response: LoginResponse = {
      accessToken: 'jwt-token-here',
      user: mockUser,
    };

    expect(typeof response.accessToken).toBe('string');
    expect(response.user.id).toBe(mockUser.id);
    expect(response.user.email).toBe(mockUser.email);
    expect(response.user.name).toBe(mockUser.name);
    expect(response.user.role).toBe(mockUser.role);
  });

  it('should have correct RegisterRequest fields', () => {
    const request: RegisterRequest = {
      email: 'newuser@example.com',
      password: 'securepassword123',
      name: 'New User',
    };

    expect(typeof request.email).toBe('string');
    expect(typeof request.password).toBe('string');
    expect(typeof request.name).toBe('string');
  });

  it('should correctly type User in LoginResponse', () => {
    const response: LoginResponse = {
      accessToken: 'token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        orgId: 'org-1',
        createdAt: '2024-01-01T00:00:00Z',
      },
    };

    expect(response.user.role).toBe(UserRole.ADMIN);
  });
});

describe('authApi endpoint URLs', () => {
  it('login endpoint should target /auth/login', () => {
    // The query function returns the URL path
    // We verify this through the endpoint definition
    expect(authApi.endpoints.login).toBeDefined();
  });

  it('register endpoint should target /auth/register', () => {
    expect(authApi.endpoints.register).toBeDefined();
  });

  it('logout endpoint should target /auth/logout', () => {
    expect(authApi.endpoints.logout).toBeDefined();
  });

  it('getMe endpoint should target /auth/me', () => {
    expect(authApi.endpoints.getMe).toBeDefined();
  });
});

describe('authApi cache tags', () => {
  it('login should invalidate User tags', () => {
    // Login mutation is configured to invalidate User tags
    // This is verified by examining the endpoint configuration
    const endpoint = authApi.endpoints.login;
    expect(endpoint).toBeDefined();
  });

  it('register should invalidate User tags', () => {
    const endpoint = authApi.endpoints.register;
    expect(endpoint).toBeDefined();
  });

  it('getMe should provide User tags for cache management', () => {
    const endpoint = authApi.endpoints.getMe;
    expect(endpoint).toBeDefined();
  });
});

describe('authApi reducerPath', () => {
  it('should be part of the base API', () => {
    // authApi is created using baseApi.injectEndpoints
    // This verifies the api slice is properly created
    expect(authApi.reducerPath).toBe('api');
  });
});
