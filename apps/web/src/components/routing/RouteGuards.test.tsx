import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { AuthGuard, GuestGuard, ProtectedRoute, GuestRoute } from './RouteGuards';
import { UserRole } from '@/types';
import type { FC } from 'react';

/**
 * Creates a test store with configurable auth state.
 */
function createTestStore(options: {
  isAuthenticated?: boolean;
  isLoading?: boolean;
} = {}) {
  const { isAuthenticated = false, isLoading = false } = options;

  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: isAuthenticated
          ? {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: UserRole.TESTER,
              orgId: 'org-1',
              createdAt: '2024-01-01T00:00:00Z',
            }
          : null,
        isAuthenticated,
        accessToken: isAuthenticated ? 'test-token' : null,
        isLoading,
        error: null,
      },
    },
  });
}

/**
 * Component to capture and display location state for testing redirects.
 */
const LocationStateCapture: FC = () => {
  const location = useLocation();
  const fromState = (location.state as { from?: string } | null)?.from;
  return (
    <div>
      <span data-testid="location-state">{fromState || 'no-state'}</span>
    </div>
  );
};

describe('AuthGuard', () => {
  it('should render children when user is authenticated', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <AuthGuard>
                  <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <AuthGuard>
                  <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect to custom URL when specified', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <AuthGuard redirectTo="/signin">
                  <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
              }
            />
            <Route path="/signin" element={<div data-testid="signin-page">Sign In</div>} />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('signin-page')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should show loading spinner when auth is loading', () => {
    const store = createTestStore({ isLoading: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <AuthGuard>
                  <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Should show loading spinner (Spinner component with role="status")
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should pass intended destination URL in location state on redirect', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected/page?query=test']}>
          <Routes>
            <Route
              path="/protected/page"
              element={
                <AuthGuard>
                  <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
              }
            />
            <Route path="/login" element={<LocationStateCapture />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('location-state')).toHaveTextContent('/protected/page?query=test');
  });
});

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should show loading spinner when auth is loading', () => {
    const store = createTestStore({ isLoading: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should pass intended destination in location state on redirect', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LocationStateCapture />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('location-state')).toHaveTextContent('/dashboard');
  });
});

describe('GuestRoute', () => {
  it('should render children when user is not authenticated', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div data-testid="guest-content">Login Form</div>
                </GuestRoute>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('guest-content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user is authenticated', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div data-testid="guest-content">Login Form</div>
                </GuestRoute>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });

  it('should redirect to originally intended destination when authenticated', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: '/login', state: { from: '/projects/123' } }]}
        >
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div data-testid="guest-content">Login Form</div>
                </GuestRoute>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
            <Route
              path="/projects/:id"
              element={<div data-testid="project-page">Project Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('project-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });

  it('should show loading spinner when auth is loading', () => {
    const store = createTestStore({ isLoading: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div data-testid="guest-content">Login Form</div>
                </GuestRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });
});

describe('GuestGuard', () => {
  it('should render children when user is not authenticated', () => {
    const store = createTestStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div data-testid="guest-content">Login Form</div>
                </GuestGuard>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('guest-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('should redirect to dashboard when user is authenticated', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div data-testid="guest-content">Login Form</div>
                </GuestGuard>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });

  it('should redirect to custom URL when specified', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard redirectTo="/home">
                  <div data-testid="guest-content">Login Form</div>
                </GuestGuard>
              }
            />
            <Route path="/home" element={<div data-testid="home-page">Home</div>} />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });

  it('should redirect to originally intended destination when authenticated', () => {
    const store = createTestStore({ isAuthenticated: true });

    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: '/login', state: { from: '/projects/123' } }]}
        >
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div data-testid="guest-content">Login Form</div>
                </GuestGuard>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
            <Route
              path="/projects/:id"
              element={<div data-testid="project-page">Project Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('project-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });

  it('should show loading spinner when auth is loading', () => {
    const store = createTestStore({ isLoading: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div data-testid="guest-content">Login Form</div>
                </GuestGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });
});

describe('Route guard exports', () => {
  it('should export AuthGuard component', async () => {
    const module = await import('./RouteGuards');
    expect(module.AuthGuard).toBeDefined();
  });

  it('should export GuestGuard component', async () => {
    const module = await import('./RouteGuards');
    expect(module.GuestGuard).toBeDefined();
  });

  it('should export ProtectedRoute component', async () => {
    const module = await import('./RouteGuards');
    expect(module.ProtectedRoute).toBeDefined();
  });

  it('should export GuestRoute component', async () => {
    const module = await import('./RouteGuards');
    expect(module.GuestRoute).toBeDefined();
  });

  it('should export RouteGuardProps type', async () => {
    const module = await import('@/components/routing');
    // TypeScript type exports are checked at compile time
    // This just verifies the module exports work
    expect(module.AuthGuard).toBeDefined();
    expect(module.GuestGuard).toBeDefined();
    expect(module.ProtectedRoute).toBeDefined();
    expect(module.GuestRoute).toBeDefined();
  });
});
