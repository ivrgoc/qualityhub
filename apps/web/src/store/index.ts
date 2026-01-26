import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { baseApi } from './api/baseApi';
import { authReducer } from './slices';

// Configure the Redux store with RTK Query middleware
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query action paths for serializable check
        ignoredActions: ['api/executeMutation', 'api/executeQuery'],
      },
    }).concat(baseApi.middleware as Middleware),
  devTools: import.meta.env.DEV,
});

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export API and slices for convenience
export * from './api';
export * from './slices';
