import { type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { router } from './router';
import { RootLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui';
import { useSessionInit } from '@/hooks/useSessionInit';

/**
 * Loading screen displayed during session initialization.
 */
const SessionLoadingScreen: FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <Spinner size="xl" label="Loading QualityHub..." />
      <p className="mt-4 text-sm text-gray-500">Initializing your session...</p>
    </div>
  </div>
);

/**
 * App content component that handles session initialization.
 * This is separated from App to allow hooks to work within the Provider.
 */
const AppContent: FC = () => {
  const { isInitialized } = useSessionInit();

  // Show loading screen while initializing session
  if (!isInitialized) {
    return <SessionLoadingScreen />;
  }

  return (
    <RootLayout>
      <RouterProvider router={router} />
    </RootLayout>
  );
};

export const App: FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};
