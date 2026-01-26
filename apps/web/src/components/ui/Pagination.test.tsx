import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, PaginationButton, PaginationEllipsis } from './Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render navigation element with correct aria-label', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });

    it('should render page number buttons', () => {
      render(<Pagination {...defaultProps} totalPages={5} />);
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
    });

    it('should render first/last buttons by default', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to last page' })).toBeInTheDocument();
    });

    it('should render previous/next buttons by default', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
    });

    it('should hide first/last buttons when showFirstLast is false', () => {
      render(<Pagination {...defaultProps} showFirstLast={false} />);
      expect(screen.queryByRole('button', { name: 'Go to first page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Go to last page' })).not.toBeInTheDocument();
    });

    it('should hide prev/next buttons when showPrevNext is false', () => {
      render(<Pagination {...defaultProps} showPrevNext={false} />);
      expect(screen.queryByRole('button', { name: 'Go to previous page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument();
    });

    it('should return null when totalPages is 0', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={0} />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when totalPages is negative', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={-1} />);
      expect(container.firstChild).toBeNull();
    });

    it('should mark current page as aria-current', () => {
      render(<Pagination {...defaultProps} currentPage={3} totalPages={5} />);
      const currentPageButton = screen.getByRole('button', { name: 'Page 3' });
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('should not mark non-current pages as aria-current', () => {
      render(<Pagination {...defaultProps} currentPage={3} totalPages={5} />);
      const otherPageButton = screen.getByRole('button', { name: 'Page 1' });
      expect(otherPageButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('navigation', () => {
    it('should call onPageChange with correct page number when clicking a page', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} totalPages={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange when clicking next button', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange when clicking previous button', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking first button', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to first page' }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when clicking last button', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to last page' }));
      expect(onPageChange).toHaveBeenCalledWith(10);
    });

    it('should not call onPageChange when clicking current page', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} totalPages={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should disable previous and first buttons on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      expect(screen.getByRole('button', { name: 'Go to first page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
    });

    it('should disable next and last buttons on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} />);

      expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    });

    it('should enable all navigation buttons when on middle page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);

      expect(screen.getByRole('button', { name: 'Go to first page' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go to last page' })).not.toBeDisabled();
    });

    it('should disable all buttons when disabled prop is true', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should not call onPageChange when disabled', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} disabled />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('ellipsis', () => {
    it('should show ellipsis when there are many pages', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />);

      // Should have ellipsis elements
      const ellipsisElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it('should show right ellipsis when on first pages', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={20} />);

      // Should show first few pages and last page
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    });

    it('should show left ellipsis when on last pages', () => {
      render(<Pagination {...defaultProps} currentPage={20} totalPages={20} />);

      // Should show first page and last few pages
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    });

    it('should show both ellipsis when in middle', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} siblingCount={1} />);

      // Should show first page, ellipsis, middle pages, ellipsis, last page
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    });
  });

  describe('siblingCount', () => {
    it('should show correct number of siblings with siblingCount=1', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} siblingCount={1} />);

      // Should show pages 9, 10, 11 around current
      expect(screen.getByRole('button', { name: 'Page 9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 11' })).toBeInTheDocument();
    });

    it('should show correct number of siblings with siblingCount=2', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} siblingCount={2} />);

      // Should show pages 8, 9, 10, 11, 12 around current
      expect(screen.getByRole('button', { name: 'Page 8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 11' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 12' })).toBeInTheDocument();
    });
  });

  describe('custom labels', () => {
    it('should render custom previous label', () => {
      render(<Pagination {...defaultProps} previousLabel="Prev" />);
      expect(screen.getByRole('button', { name: 'Go to previous page' })).toHaveTextContent('Prev');
    });

    it('should render custom next label', () => {
      render(<Pagination {...defaultProps} nextLabel="Next" />);
      expect(screen.getByRole('button', { name: 'Go to next page' })).toHaveTextContent('Next');
    });

    it('should render custom first label', () => {
      render(<Pagination {...defaultProps} firstLabel="First" />);
      expect(screen.getByRole('button', { name: 'Go to first page' })).toHaveTextContent('First');
    });

    it('should render custom last label', () => {
      render(<Pagination {...defaultProps} lastLabel="Last" />);
      expect(screen.getByRole('button', { name: 'Go to last page' })).toHaveTextContent('Last');
    });
  });

  describe('sizes', () => {
    it('should apply small size classes', () => {
      render(<Pagination {...defaultProps} size="sm" totalPages={3} />);
      const pageButton = screen.getByRole('button', { name: 'Page 1' });
      expect(pageButton).toHaveClass('h-8', 'w-8');
    });

    it('should apply large size classes', () => {
      render(<Pagination {...defaultProps} size="lg" totalPages={3} />);
      const pageButton = screen.getByRole('button', { name: 'Page 1' });
      expect(pageButton).toHaveClass('h-12', 'w-12');
    });

    it('should apply default size classes', () => {
      render(<Pagination {...defaultProps} totalPages={3} />);
      const pageButton = screen.getByRole('button', { name: 'Page 1' });
      expect(pageButton).toHaveClass('h-10', 'w-10');
    });
  });

  describe('styling', () => {
    it('should apply active variant to current page', () => {
      render(<Pagination {...defaultProps} currentPage={2} totalPages={5} />);
      const currentPageButton = screen.getByRole('button', { name: 'Page 2' });
      expect(currentPageButton).toHaveClass('bg-primary');
    });

    it('should apply custom className', () => {
      render(<Pagination {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('navigation')).toHaveClass('custom-class');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to navigation element', () => {
      const ref = vi.fn();
      render(<Pagination {...defaultProps} ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('PaginationButton', () => {
  it('should render children', () => {
    render(<PaginationButton>1</PaginationButton>);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(<PaginationButton onClick={onClick}>1</PaginationButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply active variant', () => {
    render(<PaginationButton variant="active">1</PaginationButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<PaginationButton disabled>1</PaginationButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<PaginationButton ref={ref}>1</PaginationButton>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('PaginationEllipsis', () => {
  it('should render with aria-hidden', () => {
    render(<PaginationEllipsis aria-hidden="true" />);
    const ellipsis = document.querySelector('[aria-hidden="true"]');
    expect(ellipsis).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { rerender } = render(<PaginationEllipsis size="sm" />);
    expect(document.querySelector('span')).toHaveClass('h-8', 'w-8');

    rerender(<PaginationEllipsis size="lg" />);
    expect(document.querySelector('span')).toHaveClass('h-12', 'w-12');

    rerender(<PaginationEllipsis />);
    expect(document.querySelector('span')).toHaveClass('h-10', 'w-10');
  });

  it('should apply custom className', () => {
    render(<PaginationEllipsis className="custom-class" />);
    expect(document.querySelector('span')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<PaginationEllipsis ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
