/**
 * Typed Redux hooks for QualityHub
 *
 * These hooks provide type-safe access to the Redux store throughout the app.
 * Use these instead of the plain `useDispatch` and `useSelector` hooks from react-redux.
 *
 * @example
 * ```tsx
 * import { useAppDispatch, useAppSelector } from '@/store/hooks';
 *
 * function MyComponent() {
 *   const dispatch = useAppDispatch();
 *   const user = useAppSelector((state) => state.auth.user);
 *
 *   const handleLogout = () => {
 *     dispatch(clearUser());
 *   };
 * }
 * ```
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { store } from './index';

// Infer types from the store for proper type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed version of `useDispatch` hook from react-redux.
 * Returns a properly typed dispatch function that understands thunks and RTK Query actions.
 *
 * @returns The typed dispatch function
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Typed version of `useSelector` hook from react-redux.
 * Provides autocomplete and type checking for the entire RootState.
 *
 * @param selector - A selector function that receives RootState and returns a selected value
 * @returns The selected value from the store
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
