import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';

// Mock the Card components
vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="card" className={className}>
        {children}
      </div>
    ),
    CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="card-header" className={className}>
        {children}
      </div>
    ),
    CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <h3 data-testid="card-title" className={className}>
        {children}
      </h3>
    ),
    CardDescription: ({ children }: { children: React.ReactNode }) => (
      <p data-testid="card-description">{children}</p>
    ),
    CardContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-content">{children}</div>
    ),
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('AuthLayout', () => {
  it('should render the title', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should render the description when provided', () => {
    renderWithRouter(
      <AuthLayout title="Sign In" description="Enter your credentials">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Enter your credentials')).toBeInTheDocument();
  });

  it('should not render description element when not provided', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.queryByTestId('card-description')).not.toBeInTheDocument();
  });

  it('should render children content', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <form>
          <input type="email" placeholder="Email" />
          <button type="submit">Submit</button>
        </form>
      </AuthLayout>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should render footer when provided', () => {
    renderWithRouter(
      <AuthLayout
        title="Sign In"
        footer={<span>Don't have an account? Sign up</span>}
      >
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
  });

  it('should not render footer when not provided', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    // Check that there's no extra text container after the card
    const cardContainer = screen.getByTestId('card').parentElement;
    expect(cardContainer?.children.length).toBe(2); // Logo + Card, no footer
  });

  it('should render the QualityHub brand link', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    const brandLink = screen.getByRole('link', { name: 'QualityHub' });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('should apply custom className to outer container', () => {
    const { container } = renderWithRouter(
      <AuthLayout title="Sign In" className="custom-auth-class">
        <div>Content</div>
      </AuthLayout>
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('custom-auth-class');
    expect(outerDiv).toHaveClass('min-h-screen');
  });

  it('should apply default layout classes', () => {
    const { container } = renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('min-h-screen');
    expect(outerDiv).toHaveClass('flex-col');
    expect(outerDiv).toHaveClass('items-center');
    expect(outerDiv).toHaveClass('justify-center');
    expect(outerDiv).toHaveClass('bg-background');
  });

  it('should render Card component with shadow', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-lg');
  });

  it('should center the title', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div>Content</div>
      </AuthLayout>
    );

    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('text-center');
  });

  it('should render with complex footer content', () => {
    renderWithRouter(
      <AuthLayout
        title="Sign In"
        footer={
          <>
            Don't have an account?{' '}
            <a href="/register">Sign up</a>
          </>
        }
      >
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('should render multiple children elements', () => {
    renderWithRouter(
      <AuthLayout title="Sign In">
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
