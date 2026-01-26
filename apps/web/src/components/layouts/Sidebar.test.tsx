import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const renderWithRouter = (ui: React.ReactElement, initialEntries: string[] = ['/dashboard']) => {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
};

describe('Sidebar', () => {
  it('should render the QualityHub brand link', () => {
    renderWithRouter(<Sidebar />);

    const brandLink = screen.getByRole('link', { name: 'QualityHub' });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/dashboard');
  });

  it('should render main navigation items', () => {
    renderWithRouter(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /test cases/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /test runs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
  });

  it('should render settings link in bottom navigation', () => {
    renderWithRouter(<Sidebar />);

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('should have correct href for navigation items', () => {
    renderWithRouter(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /test cases/i })).toHaveAttribute('href', '/test-cases');
    expect(screen.getByRole('link', { name: /test runs/i })).toHaveAttribute('href', '/test-runs');
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute('href', '/reports');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });

  it('should apply active styles to current route', () => {
    renderWithRouter(<Sidebar />, ['/dashboard']);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('bg-sidebar-accent');
  });

  it('should apply custom className', () => {
    const { container } = renderWithRouter(<Sidebar className="custom-sidebar" />);

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('custom-sidebar');
  });

  it('should apply default sidebar classes', () => {
    const { container } = renderWithRouter(<Sidebar />);

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('flex');
    expect(sidebar).toHaveClass('h-full');
    expect(sidebar).toHaveClass('w-64');
    expect(sidebar).toHaveClass('flex-col');
    expect(sidebar).toHaveClass('border-r');
    expect(sidebar).toHaveClass('bg-sidebar');
  });

  it('should render navigation sections with proper structure', () => {
    const { container } = renderWithRouter(<Sidebar />);

    // Should have nav element for main navigation
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('should highlight different active routes correctly', () => {
    renderWithRouter(<Sidebar />, ['/projects']);

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

    expect(projectsLink).toHaveClass('bg-sidebar-accent');
    expect(dashboardLink).not.toHaveClass('bg-sidebar-accent');
  });
});
