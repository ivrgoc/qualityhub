import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { DashboardLayout } from './DashboardLayout';

// Mock Sidebar and Header to simplify tests
vi.mock('./Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

vi.mock('./Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'tester' as const,
          orgId: 'org-1',
          createdAt: '2024-01-01T00:00:00Z',
        },
        isAuthenticated: true,
        accessToken: 'test-token',
        isLoading: false,
        error: null,
      },
    },
  });
}

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('DashboardLayout', () => {
  it('should render children', () => {
    renderWithProviders(
      <DashboardLayout>
        <div data-testid="page-content">Page Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should render Sidebar component', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render Header component', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should apply custom className to main content area', () => {
    renderWithProviders(
      <DashboardLayout className="custom-content-class">
        <div data-testid="content">Content</div>
      </DashboardLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('custom-content-class');
  });

  it('should apply default layout classes', () => {
    const { container } = renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('h-screen');
    expect(outerDiv).toHaveClass('overflow-hidden');
    expect(outerDiv).toHaveClass('bg-background');
  });

  it('should render main element with correct classes', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-1');
    expect(main).toHaveClass('overflow-auto');
    expect(main).toHaveClass('p-6');
  });

  it('should render multiple children', () => {
    renderWithProviders(
      <DashboardLayout>
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should have correct DOM structure', () => {
    const { container } = renderWithProviders(
      <DashboardLayout>
        <div data-testid="content">Content</div>
      </DashboardLayout>
    );

    // Outer container should have sidebar and content area as children
    const outerDiv = container.firstChild as HTMLElement;
    const sidebar = screen.getByTestId('sidebar');
    const header = screen.getByTestId('header');
    const main = screen.getByRole('main');
    const content = screen.getByTestId('content');

    expect(outerDiv).toContainElement(sidebar);
    expect(outerDiv).toContainElement(header);
    expect(outerDiv).toContainElement(main);
    expect(main).toContainElement(content);
  });

  it('should maintain flex-1 on content wrapper for proper layout', () => {
    const { container } = renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // The content area (containing header and main) should be flex-1
    const contentWrapper = container.querySelector('.flex-1.flex-col');
    expect(contentWrapper).toBeInTheDocument();
    expect(contentWrapper).toHaveClass('overflow-hidden');
  });
});
