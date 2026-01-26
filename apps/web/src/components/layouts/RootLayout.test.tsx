import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RootLayout } from './RootLayout';

// Mock the ErrorBoundary component
vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="error-boundary">{children}</div>
    ),
    Toaster: () => <div data-testid="toaster" />,
  };
});

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should wrap children with ErrorBoundary', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toContainElement(
      screen.getByText('Content')
    );
  });

  it('should render Toaster component', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should apply default layout classes', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const layoutContainer = screen.getByText('Content').parentElement;
    expect(layoutContainer).toHaveClass('min-h-screen');
    expect(layoutContainer).toHaveClass('bg-background');
    expect(layoutContainer).toHaveClass('text-foreground');
  });

  it('should apply custom className', () => {
    render(
      <RootLayout className="custom-layout-class">
        <div>Content</div>
      </RootLayout>
    );

    const layoutContainer = screen.getByText('Content').parentElement;
    expect(layoutContainer).toHaveClass('custom-layout-class');
  });

  it('should merge custom className with default classes', () => {
    render(
      <RootLayout className="custom-class">
        <div>Content</div>
      </RootLayout>
    );

    const layoutContainer = screen.getByText('Content').parentElement;
    expect(layoutContainer).toHaveClass('min-h-screen');
    expect(layoutContainer).toHaveClass('custom-class');
  });

  it('should render multiple children', () => {
    render(
      <RootLayout>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </RootLayout>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('should maintain correct component hierarchy', () => {
    render(
      <RootLayout>
        <div data-testid="child">Child</div>
      </RootLayout>
    );

    // ErrorBoundary should be the outermost, containing the layout div and Toaster
    const errorBoundary = screen.getByTestId('error-boundary');
    const layoutDiv = screen.getByTestId('child').parentElement;
    const toaster = screen.getByTestId('toaster');

    expect(errorBoundary).toContainElement(layoutDiv!);
    expect(errorBoundary).toContainElement(toaster);
  });
});
