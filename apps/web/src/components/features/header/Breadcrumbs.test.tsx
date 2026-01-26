import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

const renderWithRouter = (ui: React.ReactElement, initialEntries: string[] = ['/']) => {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
};

describe('Breadcrumbs', () => {
  it('should render nothing when at root path', () => {
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />, ['/']);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should render breadcrumb navigation with home icon', () => {
    renderWithRouter(<Breadcrumbs />, ['/dashboard']);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
  });

  it('should render breadcrumb items from URL path', () => {
    renderWithRouter(<Breadcrumbs />, ['/projects']);

    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('should render nested breadcrumb items', () => {
    renderWithRouter(<Breadcrumbs />, ['/projects/test-cases']);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Cases')).toBeInTheDocument();
  });

  it('should mark the last item as current page', () => {
    renderWithRouter(<Breadcrumbs />, ['/dashboard']);

    const currentPage = screen.getByText('Dashboard');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('should render links for non-current items', () => {
    renderWithRouter(<Breadcrumbs />, ['/projects/test-cases']);

    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink).toHaveAttribute('href', '/projects');
  });

  it('should handle unknown segments by capitalizing them', () => {
    renderWithRouter(<Breadcrumbs />, ['/custom-page']);

    expect(screen.getByText('Custom-page')).toBeInTheDocument();
  });

  it('should handle UUID-like segments', () => {
    renderWithRouter(<Breadcrumbs />, ['/projects/12345678-abcd-1234']);

    expect(screen.getByText('#12345678')).toBeInTheDocument();
  });

  it('should render custom items when provided', () => {
    const customItems = [
      { label: 'Home', href: '/' },
      { label: 'Custom', href: '/custom', isCurrentPage: true },
    ];

    renderWithRouter(<Breadcrumbs items={customItems} />, ['/other']);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    renderWithRouter(<Breadcrumbs className="custom-class" />, ['/dashboard']);

    expect(screen.getByRole('navigation')).toHaveClass('custom-class');
  });

  it('should hide home icon when showHomeIcon is false', () => {
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />, ['/dashboard']);

    expect(screen.queryByLabelText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render chevron separators between items', () => {
    renderWithRouter(<Breadcrumbs />, ['/projects/test-cases']);

    // Check that chevron separators are rendered (aria-hidden)
    const separators = screen.getAllByRole('listitem', { hidden: true });
    expect(separators.length).toBeGreaterThan(2); // Items + separators
  });

  it('should map known routes to proper labels', () => {
    renderWithRouter(<Breadcrumbs />, ['/test-runs']);

    expect(screen.getByText('Test Runs')).toBeInTheDocument();
  });

  it('should handle settings route', () => {
    renderWithRouter(<Breadcrumbs />, ['/settings']);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should handle reports route', () => {
    renderWithRouter(<Breadcrumbs />, ['/reports']);

    expect(screen.getByText('Reports')).toBeInTheDocument();
  });
});
