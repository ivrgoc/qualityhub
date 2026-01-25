import { createBrowserRouter } from 'react-router-dom';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  NotFoundPage,
} from '@/pages';

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
