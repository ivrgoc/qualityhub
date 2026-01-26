/**
 * Storage keys used by the application.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Retrieves a value from localStorage.
 * Returns null if the key doesn't exist or localStorage is unavailable.
 */
function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // localStorage may be unavailable (e.g., in SSR or private browsing)
    return null;
  }
}

/**
 * Stores a value in localStorage.
 * Silently fails if localStorage is unavailable.
 */
function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage may be unavailable or full
  }
}

/**
 * Removes a value from localStorage.
 * Silently fails if localStorage is unavailable.
 */
function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Token storage utilities.
 * Provides type-safe methods for managing authentication tokens.
 */
export const tokenStorage = {
  /**
   * Retrieves the access token from localStorage.
   * @returns The access token or null if not found.
   */
  getAccessToken(): string | null {
    return getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Stores the access token in localStorage.
   * @param token - The access token to store.
   */
  setAccessToken(token: string): void {
    setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Removes the access token from localStorage.
   */
  removeAccessToken(): void {
    removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Retrieves the refresh token from localStorage.
   * @returns The refresh token or null if not found.
   */
  getRefreshToken(): string | null {
    return getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Stores the refresh token in localStorage.
   * @param token - The refresh token to store.
   */
  setRefreshToken(token: string): void {
    setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Removes the refresh token from localStorage.
   */
  removeRefreshToken(): void {
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Stores both access and refresh tokens.
   * Useful after login/token refresh operations.
   * @param accessToken - The access token to store.
   * @param refreshToken - Optional refresh token to store.
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  /**
   * Removes all authentication tokens from localStorage.
   * Useful during logout operations.
   */
  clearTokens(): void {
    removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Checks if an access token exists in localStorage.
   * @returns True if an access token is stored.
   */
  hasAccessToken(): boolean {
    return getItem(STORAGE_KEYS.ACCESS_TOKEN) !== null;
  },
};

/**
 * Generic storage utilities for JSON data.
 * Provides type-safe methods for storing and retrieving serialized objects.
 */
export const jsonStorage = {
  /**
   * Retrieves and parses a JSON value from localStorage.
   * @param key - The storage key.
   * @returns The parsed value or null if not found or invalid.
   */
  get<T>(key: string): T | null {
    const value = getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Serializes and stores a value in localStorage.
   * @param key - The storage key.
   * @param value - The value to store.
   */
  set<T>(key: string, value: T): void {
    try {
      setItem(key, JSON.stringify(value));
    } catch {
      // JSON.stringify may fail for circular references
    }
  },

  /**
   * Removes a value from localStorage.
   * @param key - The storage key.
   */
  remove(key: string): void {
    removeItem(key);
  },
};
