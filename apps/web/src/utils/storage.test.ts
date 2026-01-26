import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenStorage, jsonStorage, STORAGE_KEYS } from './storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('STORAGE_KEYS', () => {
    it('should have expected keys defined', () => {
      expect(STORAGE_KEYS.ACCESS_TOKEN).toBe('accessToken');
      expect(STORAGE_KEYS.REFRESH_TOKEN).toBe('refreshToken');
      expect(STORAGE_KEYS.USER).toBe('user');
      expect(STORAGE_KEYS.THEME).toBe('theme');
    });
  });

  describe('tokenStorage', () => {
    describe('getAccessToken', () => {
      it('should return the access token when it exists', () => {
        localStorageMock.setItem('accessToken', 'test-token');

        const result = tokenStorage.getAccessToken();

        expect(result).toBe('test-token');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
      });

      it('should return null when no token exists', () => {
        const result = tokenStorage.getAccessToken();

        expect(result).toBeNull();
      });
    });

    describe('setAccessToken', () => {
      it('should store the access token', () => {
        tokenStorage.setAccessToken('new-token');

        expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-token');
      });
    });

    describe('removeAccessToken', () => {
      it('should remove the access token', () => {
        localStorageMock.setItem('accessToken', 'test-token');

        tokenStorage.removeAccessToken();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      });
    });

    describe('getRefreshToken', () => {
      it('should return the refresh token when it exists', () => {
        localStorageMock.setItem('refreshToken', 'refresh-token');

        const result = tokenStorage.getRefreshToken();

        expect(result).toBe('refresh-token');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('refreshToken');
      });

      it('should return null when no refresh token exists', () => {
        const result = tokenStorage.getRefreshToken();

        expect(result).toBeNull();
      });
    });

    describe('setRefreshToken', () => {
      it('should store the refresh token', () => {
        tokenStorage.setRefreshToken('new-refresh-token');

        expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      });
    });

    describe('removeRefreshToken', () => {
      it('should remove the refresh token', () => {
        localStorageMock.setItem('refreshToken', 'refresh-token');

        tokenStorage.removeRefreshToken();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      });
    });

    describe('setTokens', () => {
      it('should store both access and refresh tokens', () => {
        tokenStorage.setTokens('access-token', 'refresh-token');

        expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
      });

      it('should store only access token when refresh token is not provided', () => {
        tokenStorage.setTokens('access-token');

        expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('clearTokens', () => {
      it('should remove both access and refresh tokens', () => {
        localStorageMock.setItem('accessToken', 'access-token');
        localStorageMock.setItem('refreshToken', 'refresh-token');

        tokenStorage.clearTokens();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      });
    });

    describe('hasAccessToken', () => {
      it('should return true when access token exists', () => {
        localStorageMock.setItem('accessToken', 'test-token');

        expect(tokenStorage.hasAccessToken()).toBe(true);
      });

      it('should return false when access token does not exist', () => {
        expect(tokenStorage.hasAccessToken()).toBe(false);
      });
    });
  });

  describe('jsonStorage', () => {
    describe('get', () => {
      it('should parse and return stored JSON value', () => {
        const data = { name: 'John', age: 30 };
        localStorageMock.setItem('userData', JSON.stringify(data));

        const result = jsonStorage.get<{ name: string; age: number }>('userData');

        expect(result).toEqual(data);
      });

      it('should return null when key does not exist', () => {
        const result = jsonStorage.get('nonexistent');

        expect(result).toBeNull();
      });

      it('should return null for invalid JSON', () => {
        localStorageMock.setItem('invalidJson', 'not-valid-json{');

        const result = jsonStorage.get('invalidJson');

        expect(result).toBeNull();
      });

      it('should handle arrays', () => {
        const data = [1, 2, 3, 4, 5];
        localStorageMock.setItem('arrayData', JSON.stringify(data));

        const result = jsonStorage.get<number[]>('arrayData');

        expect(result).toEqual(data);
      });

      it('should handle nested objects', () => {
        const data = {
          user: { id: '1', name: 'John' },
          settings: { theme: 'dark', notifications: true },
        };
        localStorageMock.setItem('nestedData', JSON.stringify(data));

        const result = jsonStorage.get<typeof data>('nestedData');

        expect(result).toEqual(data);
      });
    });

    describe('set', () => {
      it('should serialize and store value', () => {
        const data = { name: 'Jane', active: true };

        jsonStorage.set('userData', data);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(data));
      });

      it('should handle primitive values', () => {
        jsonStorage.set('count', 42);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('count', '42');
      });

      it('should handle null values', () => {
        jsonStorage.set('nullValue', null);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('nullValue', 'null');
      });

      it('should handle boolean values', () => {
        jsonStorage.set('flag', true);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('flag', 'true');
      });
    });

    describe('remove', () => {
      it('should remove the stored value', () => {
        localStorageMock.setItem('toRemove', 'value');

        jsonStorage.remove('toRemove');

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('toRemove');
      });
    });
  });

  describe('localStorage unavailable', () => {
    it('should handle localStorage errors gracefully for getItem', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });

      const result = tokenStorage.getAccessToken();

      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully for setItem', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage full');
      });

      // Should not throw
      expect(() => tokenStorage.setAccessToken('token')).not.toThrow();
    });

    it('should handle localStorage errors gracefully for removeItem', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });

      // Should not throw
      expect(() => tokenStorage.removeAccessToken()).not.toThrow();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json {{{');

      const result = jsonStorage.get('key');

      expect(result).toBeNull();
    });
  });
});
