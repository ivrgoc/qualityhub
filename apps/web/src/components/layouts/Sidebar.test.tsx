import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import { baseApi } from '@/store/api/baseApi';
import { UserRole } from '@/types';
import { Sidebar } from './Sidebar';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the projects API query
vi.mock('@/store/api/projectsApi', () => ({
  useGetProjectsQuery: vi.fn(() => ({
    data: {
      items: [
        { id: 'p1', name: 'Project Alpha', description: 'Test project 1', orgId: 'org-1', createdAt: '2024-01-01' },
        { id: 'p2', name: 'Project Beta', description: 'Test project 2', orgId: 'org-1', createdAt: '2024-01-02' },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    },
    isLoading: false,
  })),
}));

function createTestStore(user: { name: string; email: string } | null = { name: 'Test User', email: 'test@example.com' }) {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        user: user
          ? {
              id: '1',
              email: user.email,
              name: user.name,
              role: UserRole.TESTER,
              orgId: 'org-1',
              createdAt: '2024-01-01T00:00:00Z',
            }
          : null,
        isAuthenticated: !!user,
        accessToken: user ? 'test-token' : null,
        isLoading: false,
        error: null,
      },
    },
  });
}

const renderWithProviders = (
  ui: React.ReactElement,
  {
    store = createTestStore(),
    initialEntries = ['/dashboard'],
  }: { store?: ReturnType<typeof createTestStore>; initialEntries?: string[] } = {}
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Brand/Logo', () => {
    it('should render the QualityHub brand link', () => {
      renderWithProviders(<Sidebar />);

      const brandLink = screen.getByRole('link', { name: 'QualityHub' });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Navigation Items', () => {
    it('should render main navigation items', () => {
      renderWithProviders(<Sidebar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /test cases/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /test runs/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
    });

    it('should render settings link in bottom navigation', () => {
      renderWithProviders(<Sidebar />);

      const settingsLinks = screen.getAllByRole('link', { name: /settings/i });
      // One in bottom nav, one in user dropdown (not visible until clicked)
      expect(settingsLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should have correct href for navigation items', () => {
      renderWithProviders(<Sidebar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
      expect(screen.getByRole('link', { name: /test cases/i })).toHaveAttribute('href', '/test-cases');
      expect(screen.getByRole('link', { name: /test runs/i })).toHaveAttribute('href', '/test-runs');
      expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute('href', '/reports');
    });

    it('should apply active styles to current route', () => {
      renderWithProviders(<Sidebar />, { initialEntries: ['/dashboard'] });

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-sidebar-accent');
    });

    it('should highlight different active routes correctly', () => {
      renderWithProviders(<Sidebar />, { initialEntries: ['/projects'] });

      const projectsLink = screen.getByRole('link', { name: /projects/i });
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

      expect(projectsLink).toHaveClass('bg-sidebar-accent');
      expect(dashboardLink).not.toHaveClass('bg-sidebar-accent');
    });
  });

  describe('Project Switcher', () => {
    it('should render the project switcher button', () => {
      renderWithProviders(<Sidebar />);

      // Find the project switcher trigger (it shows the first project name)
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('2 projects')).toBeInTheDocument();
    });

    it('should show project dropdown when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Sidebar />);

      // Find and click the project switcher button
      const projectSwitcher = screen.getByText('Project Alpha').closest('button');
      await user.click(projectSwitcher!);

      await waitFor(() => {
        // Check for Project Beta in the dropdown (unique to dropdown content)
        expect(screen.getByText('Project Beta')).toBeInTheDocument();
        // The dropdown should have a menu role
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('should show create project option in dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Sidebar />);

      const projectSwitcher = screen.getByText('Project Alpha').closest('button');
      await user.click(projectSwitcher!);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /create project/i })).toBeInTheDocument();
      });
    });

    it('should link to individual project pages', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Sidebar />);

      const projectSwitcher = screen.getByText('Project Alpha').closest('button');
      await user.click(projectSwitcher!);

      await waitFor(() => {
        const projectLink = screen.getByRole('menuitem', { name: /project beta/i });
        expect(projectLink).toBeInTheDocument();
        expect(projectLink.closest('a')).toHaveAttribute('href', '/projects/p2');
      });
    });
  });

  describe('User Avatar Section', () => {
    it('should render user information', () => {
      renderWithProviders(<Sidebar />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show user dropdown menu when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Sidebar />);

      // Find the user avatar trigger button (at bottom of sidebar)
      const userButtons = screen.getAllByRole('button');
      const userAvatarButton = userButtons.find((btn) =>
        btn.textContent?.includes('Test User')
      );
      await user.click(userAvatarButton!);

      await waitFor(() => {
        // The dropdown shows user info again in the label
        const userLabels = screen.getAllByText('Test User');
        expect(userLabels.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should show settings link in user dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Sidebar />);

      const userButtons = screen.getAllByRole('button');
      const userAvatarButton = userButtons.find((btn) =>
        btn.textContent?.includes('Test User')
      );
      await user.click(userAvatarButton!);

      await waitFor(() => {
        const settingsMenuItem = screen.getByRole('menuitem', { name: /settings/i });
        expect(settingsMenuItem).toBeInTheDocument();
      });
    });

    it('should show log out option in user dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Sidebar />);

      const userButtons = screen.getAllByRole('button');
      const userAvatarButton = userButtons.find((btn) =>
        btn.textContent?.includes('Test User')
      );
      await user.click(userAvatarButton!);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
      });
    });

    it('should call clearCredentials and navigate to login on logout', async () => {
      const user = userEvent.setup();
      const store = createTestStore({ name: 'Test User', email: 'test@example.com' });
      renderWithProviders(<Sidebar />, { store });

      const userButtons = screen.getAllByRole('button');
      const userAvatarButton = userButtons.find((btn) =>
        btn.textContent?.includes('Test User')
      );
      await user.click(userAvatarButton!);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('menuitem', { name: /log out/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });

    it('should show fallback user info when user is null', () => {
      const store = createTestStore(null);
      renderWithProviders(<Sidebar />, { store });

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProviders(<Sidebar className="custom-sidebar" />);

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('custom-sidebar');
    });

    it('should apply default sidebar classes', () => {
      const { container } = renderWithProviders(<Sidebar />);

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('flex');
      expect(sidebar).toHaveClass('h-full');
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).toHaveClass('flex-col');
      expect(sidebar).toHaveClass('border-r');
      expect(sidebar).toHaveClass('bg-sidebar');
    });

    it('should render navigation sections with proper structure', () => {
      const { container } = renderWithProviders(<Sidebar />);

      // Should have nav element for main navigation
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when projects are loading', async () => {
      // Override the mock for this specific test
      const { useGetProjectsQuery } = await import('@/store/api/projectsApi');
      vi.mocked(useGetProjectsQuery).mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
        isSuccess: false,
        isFetching: true,
        isUninitialized: false,
      } as ReturnType<typeof useGetProjectsQuery>);

      const { container } = renderWithProviders(<Sidebar />);

      // Look for skeleton element
      const skeleton = container.querySelector('[class*="animate-pulse"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show "Select Project" when no projects exist', async () => {
      const { useGetProjectsQuery } = await import('@/store/api/projectsApi');
      vi.mocked(useGetProjectsQuery).mockReturnValueOnce({
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
        isSuccess: true,
        isFetching: false,
        isUninitialized: false,
      } as ReturnType<typeof useGetProjectsQuery>);

      renderWithProviders(<Sidebar />);

      expect(screen.getByText('Select Project')).toBeInTheDocument();
      expect(screen.getByText('0 projects')).toBeInTheDocument();
    });

    it('should show "No projects yet" message in dropdown when empty', async () => {
      const user = userEvent.setup();
      const { useGetProjectsQuery } = await import('@/store/api/projectsApi');
      vi.mocked(useGetProjectsQuery).mockReturnValueOnce({
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
        isSuccess: true,
        isFetching: false,
        isUninitialized: false,
      } as ReturnType<typeof useGetProjectsQuery>);

      renderWithProviders(<Sidebar />);

      const projectSwitcher = screen.getByText('Select Project').closest('button');
      await user.click(projectSwitcher!);

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
      });
    });
  });
});
