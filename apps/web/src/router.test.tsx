import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { ProtectedRoute, GuestRoute } from '@/components/routing';
import { ROUTES } from '@/constants/routes';

// Mock the page components to avoid lazy loading complexity in tests
vi.mock('@/pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('@/pages/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('@/pages/RegisterPage', () => ({
  RegisterPage: () => <div data-testid="register-page">Register Page</div>,
}));

vi.mock('@/pages/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('@/pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

/**
 * Creates a test store with optional initial auth state.
 */
function createTestStore(isAuthenticated = false) {
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
              role: 'tester' as const,
              orgId: 'org-1',
              createdAt: '2024-01-01T00:00:00Z',
            }
          : null,
        isAuthenticated,
        accessToken: isAuthenticated ? 'test-token' : null,
        isLoading: false,
        error: null,
      },
    },
  });
}

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    const store = createTestStore(true);

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
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    const store = createTestStore(false);

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
            <Route path="/login" element={<div data-testid="login-redirect">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('login-redirect')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('GuestRoute', () => {
  it('should render children when user is not authenticated', () => {
    const store = createTestStore(false);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div data-testid="guest-content">Guest Content</div>
                </GuestRoute>
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
    const store = createTestStore(true);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div data-testid="guest-content">Login Page</div>
                </GuestRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard-redirect">Dashboard Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument();
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
  });
});

describe('ROUTES constants', () => {
  it('should have correct route paths', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.REGISTER).toBe('/register');
    expect(ROUTES.DASHBOARD).toBe('/dashboard');
  });

  it('should contain all expected routes', () => {
    const expectedRoutes = ['HOME', 'LOGIN', 'REGISTER', 'DASHBOARD'];
    const actualRoutes = Object.keys(ROUTES);
    expect(actualRoutes).toEqual(expectedRoutes);
  });
});

describe('Router configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export router instance', async () => {
    // Dynamic import to test the actual router export
    const routerModule = await import('./router');
    expect(routerModule.router).toBeDefined();
    expect(typeof routerModule.router.navigate).toBe('function');
  });

  it('should export ProtectedRoute component from routing module', async () => {
    const routingModule = await import('@/components/routing');
    expect(routingModule.ProtectedRoute).toBeDefined();
  });

  it('should export GuestRoute component from routing module', async () => {
    const routingModule = await import('@/components/routing');
    expect(routingModule.GuestRoute).toBeDefined();
  });

  it('should have ROUTES constant available from constants module', async () => {
    const routesModule = await import('@/constants/routes');
    expect(routesModule.ROUTES).toBeDefined();
  });
});

describe('Route guard edge cases', () => {
  it('should preserve children structure in ProtectedRoute when authenticated', () => {
    const store = createTestStore(true);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <div data-testid="wrapper">
                    <span data-testid="nested">Nested</span>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });

  it('should preserve children structure in GuestRoute when not authenticated', () => {
    const store = createTestStore(false);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route
              path="/test"
              element={
                <GuestRoute>
                  <div data-testid="wrapper">
                    <span data-testid="nested">Nested</span>
                  </div>
                </GuestRoute>
              }
            />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });
});
