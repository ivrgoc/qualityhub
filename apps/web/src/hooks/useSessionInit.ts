import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useLazyGetMeQuery } from '@/store/api/authApi';
import { setAuthLoading, clearCredentials } from '@/store/slices/authSlice';

/**
 * Return type for the useSessionInit hook.
 */
export interface UseSessionInitReturn {
  /** Whether the session initialization is complete */
  isInitialized: boolean;
  /** Whether the session initialization is in progress */
  isInitializing: boolean;
}

/**
 * Hook that initializes the user session on app mount.
 *
 * This hook checks for a stored access token in localStorage and attempts to
 * restore the user session by fetching the current user's data. It manages
 * the auth loading state during this process to prevent flash of
 * unauthenticated content.
 *
 * Features:
 * - Checks localStorage for existing access token
 * - Fetches user data via getMe endpoint if token exists
 * - Sets loading state during initialization to prevent redirect flicker
 * - Clears credentials if token is invalid/expired
 * - Only runs once on mount
 *
 * @example
 * // In App.tsx or a top-level component
 * function App() {
 *   const { isInitialized } = useSessionInit();
 *
 *   if (!isInitialized) {
 *     return <LoadingScreen />;
 *   }
 *
 *   return <RouterProvider router={router} />;
 * }
 */
export function useSessionInit(): UseSessionInitReturn {
  const dispatch = useAppDispatch();
  const [getMe, { isLoading }] = useLazyGetMeQuery();
  const initAttempted = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only attempt initialization once
    if (initAttempted.current) {
      return;
    }
    initAttempted.current = true;

    const initSession = async (): Promise<void> => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        // No token stored, user is not authenticated
        // Ensure loading state is cleared
        dispatch(setAuthLoading(false));
        setIsInitialized(true);
        return;
      }

      // Token exists, attempt to restore session
      dispatch(setAuthLoading(true));

      try {
        // getMe will automatically update auth state on success via onQueryStarted
        await getMe().unwrap();
      } catch {
        // Token is invalid or expired, clear credentials
        // getMe already handles this in onQueryStarted, but ensure state is clean
        dispatch(clearCredentials());
      } finally {
        dispatch(setAuthLoading(false));
        setIsInitialized(true);
      }
    };

    initSession();
  }, [dispatch, getMe]);

  return {
    isInitialized,
    isInitializing: isLoading,
  };
}
