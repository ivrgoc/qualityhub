import { type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { router } from './router';
import { RootLayout } from '@/components/layouts';

export const App: FC = () => {
  return (
    <Provider store={store}>
      <RootLayout>
        <RouterProvider router={router} />
      </RootLayout>
    </Provider>
  );
};
