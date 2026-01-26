import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { UserRole } from '@/types';
import { Header } from './Header';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createTestStore(user: { name: string; email: string } | null = null) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
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
  store = createTestStore({ name: 'Test User', email: 'test@example.com' }),
  initialEntries: string[] = ['/dashboard']
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header', () => {
    const { container } = renderWithProviders(<Header />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render the breadcrumbs', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('should render the search input', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search tests, projects...')).toBeInTheDocument();
  });

  it('should render the notifications button', () => {
    renderWithProviders(<Header />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    expect(notificationButton).toBeInTheDocument();
  });

  it('should render the user avatar trigger button', () => {
    renderWithProviders(<Header />);

    // Find the button with aria-haspopup="menu" (the dropdown trigger)
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    expect(avatarButton).toBeInTheDocument();
  });

  it('should show user dropdown menu when avatar is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    await user.click(avatarButton!);

    // Check dropdown content is visible
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should show profile link in dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    await user.click(avatarButton!);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    });
  });

  it('should show settings link in dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    await user.click(avatarButton!);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
    });
  });

  it('should show log out option in dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    await user.click(avatarButton!);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
    });
  });

  it('should call clearCredentials and navigate to login on logout', async () => {
    const user = userEvent.setup();
    const store = createTestStore({ name: 'Test User', email: 'test@example.com' });
    renderWithProviders(<Header />, store);

    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    await user.click(avatarButton!);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('menuitem', { name: /log out/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(<Header className="custom-header" />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-header');
  });

  it('should apply default header classes', () => {
    const { container } = renderWithProviders(<Header />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('h-16');
    expect(header).toHaveClass('items-center');
    expect(header).toHaveClass('justify-between');
    expect(header).toHaveClass('border-b');
  });

  it('should show fallback user info when user is null', async () => {
    const user = userEvent.setup();
    const store = createTestStore(null);
    renderWithProviders(<Header />, store);

    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) => btn.getAttribute('aria-haspopup') === 'menu');
    await user.click(avatarButton!);

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });

  // New tests for search functionality
  it('should navigate to search results when searching', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test query');
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
  });

  // New tests for notifications
  it('should show unread notification count badge', () => {
    renderWithProviders(<Header />);

    // The mock notifications in Header have 2 unread
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should open notifications popover when clicking notifications button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('should display mock notifications in popover', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Test run completed')).toBeInTheDocument();
      expect(screen.getByText('New defect assigned')).toBeInTheDocument();
    });
  });

  it('should mark notification as read when clicking on it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Test run completed')).toBeInTheDocument();
    });

    // Click the notification
    const notificationLink = screen.getByRole('link', { name: /test run completed/i });
    await user.click(notificationLink);

    // Re-open the popover to check the count decreased
    await user.click(notificationButton);

    await waitFor(() => {
      // Should have 1 unread now - check via the badge's aria label on the button
      const button = screen.getByRole('button', { name: /notifications \(1 unread\)/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('should mark all notifications as read', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Mark all read'));

    // Badge should no longer be visible (all read)
    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });
  });

  it('should dismiss notification when clicking dismiss button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Test run completed')).toBeInTheDocument();
    });

    // Click dismiss on first notification
    const dismissButtons = screen.getAllByLabelText('Dismiss notification');
    expect(dismissButtons.length).toBeGreaterThan(0);
    await user.click(dismissButtons[0]!);

    await waitFor(() => {
      expect(screen.queryByText('Test run completed')).not.toBeInTheDocument();
    });
  });

  // New tests for breadcrumbs
  it('should display breadcrumbs based on current route', () => {
    renderWithProviders(<Header />, undefined, ['/dashboard']);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should show nested breadcrumbs for nested routes', () => {
    renderWithProviders(<Header />, undefined, ['/projects/test-cases']);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Cases')).toBeInTheDocument();
  });
});
