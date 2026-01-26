import { configureStore, type Middleware } from '@reduxjs/toolkit';
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

// Re-export typed hooks from hooks.ts
export { useAppDispatch, useAppSelector } from './hooks';

// Re-export API and slices for convenience
export * from './api';
export * from './slices';
