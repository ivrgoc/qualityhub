import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import authReducer from '@/store/slices/authSlice';
import { baseApi } from '@/store/api/baseApi';
import { useSessionInit } from './useSessionInit';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock the authApi endpoints
vi.mock('@/store/api/authApi', async () => {
  const actual = await vi.importActual('@/store/api/authApi');
  return {
    ...actual,
    useLazyGetMeQuery: vi.fn(),
  };
});

// Import the mocked module
import { useLazyGetMeQuery } from '@/store/api/authApi';

/**
 * Creates a test store for hook testing.
 */
function createTestStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(baseApi.middleware),
  });
}

/**
 * Wrapper component for testing hooks with Redux Provider.
 */
function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useSessionInit', () => {
  let mockGetMe: ReturnType<typeof vi.fn>;
  let mockUnwrap: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReset();
    localStorageMock.removeItem.mockReset();

    // Setup mock getMe function
    mockUnwrap = vi.fn();
    mockGetMe = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

    (useLazyGetMeQuery as ReturnType<typeof vi.fn>).mockReturnValue([
      mockGetMe,
      { isLoading: false, isUninitialized: false },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initialized immediately when no token exists', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const store = createTestStore();
    const { result } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(mockGetMe).not.toHaveBeenCalled();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
  });

  it('should attempt to fetch user when token exists', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    mockUnwrap.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const store = createTestStore();
    renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(mockGetMe).toHaveBeenCalled();
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
  });

  it('should handle getMe failure gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('expired-token');
    mockUnwrap.mockRejectedValue(new Error('Unauthorized'));

    const store = createTestStore();
    const { result } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    // Should have attempted to get user
    expect(mockGetMe).toHaveBeenCalled();
  });

  it('should only initialize once even if re-rendered', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    mockUnwrap.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const store = createTestStore();
    const { rerender } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(mockGetMe).toHaveBeenCalledTimes(1);
    });

    // Re-render the hook
    rerender();
    rerender();

    // Should still only have called getMe once
    expect(mockGetMe).toHaveBeenCalledTimes(1);
  });

  it('should return correct isInitializing state during loading', () => {
    localStorageMock.getItem.mockReturnValue('valid-token');

    (useLazyGetMeQuery as ReturnType<typeof vi.fn>).mockReturnValue([
      mockGetMe,
      { isLoading: true, isUninitialized: false },
    ]);

    const store = createTestStore();
    const { result } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.isInitialized).toBe(false);
  });

  it('should return isInitialized false when uninitialized', () => {
    localStorageMock.getItem.mockReturnValue(null);

    (useLazyGetMeQuery as ReturnType<typeof vi.fn>).mockReturnValue([
      mockGetMe,
      { isLoading: false, isUninitialized: true },
    ]);

    const store = createTestStore();
    const { result } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isInitialized).toBe(false);
  });
});

describe('useSessionInit return types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    const mockUnwrap = vi.fn();
    const mockGetMe = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

    (useLazyGetMeQuery as ReturnType<typeof vi.fn>).mockReturnValue([
      mockGetMe,
      { isLoading: false, isUninitialized: false },
    ]);
  });

  it('should return isInitialized boolean', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(typeof result.current.isInitialized).toBe('boolean');
    });
  });

  it('should return isInitializing boolean', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSessionInit(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(typeof result.current.isInitializing).toBe('boolean');
    });
  });
});
