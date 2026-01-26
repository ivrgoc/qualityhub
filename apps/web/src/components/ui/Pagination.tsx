import { forwardRef, type HTMLAttributes, type ReactNode, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const paginationVariants = cva('flex items-center gap-1', {
  variants: {
    size: {
      default: '',
      sm: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const paginationItemVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'hover:bg-accent hover:text-accent-foreground',
        active:
          'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 w-10 text-sm',
        sm: 'h-8 w-8 text-xs',
        lg: 'h-12 w-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'>,
    VariantProps<typeof paginationVariants> {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of page numbers to show on each side of current page */
  siblingCount?: number;
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean;
  /** Whether to show previous/next buttons */
  showPrevNext?: boolean;
  /** Custom label for previous button */
  previousLabel?: ReactNode;
  /** Custom label for next button */
  nextLabel?: ReactNode;
  /** Custom label for first page button */
  firstLabel?: ReactNode;
  /** Custom label for last page button */
  lastLabel?: ReactNode;
  /** Whether the pagination is disabled */
  disabled?: boolean;
}

/**
 * Generates an array of page numbers to display in pagination
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

  // If total pages is less than what we'd show, just return all pages
  if (totalPages <= totalPageNumbers - 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    // Show more pages on the left
    const leftItemCount = 3 + siblingCount * 2;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis-end', totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    // Show more pages on the right
    const rightItemCount = 3 + siblingCount * 2;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis-start', ...rightRange];
  }

  // Show ellipsis on both sides
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis-start', ...middleRange, 'ellipsis-end', totalPages];
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      size,
      siblingCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      previousLabel,
      nextLabel,
      firstLabel,
      lastLabel,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const pageNumbers = useMemo(
      () => generatePageNumbers(currentPage, totalPages, siblingCount),
      [currentPage, totalPages, siblingCount]
    );

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    const handlePageChange = (page: number): void => {
      if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
        onPageChange(page);
      }
    };

    if (totalPages <= 0) {
      return null;
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn(paginationVariants({ size, className }))}
        {...props}
      >
        {showFirstLast && (
          <PaginationButton
            onClick={() => handlePageChange(1)}
            disabled={disabled || isFirstPage}
            size={size}
            aria-label="Go to first page"
          >
            {firstLabel ?? <ChevronsLeft className="h-4 w-4" />}
          </PaginationButton>
        )}

        {showPrevNext && (
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || isFirstPage}
            size={size}
            aria-label="Go to previous page"
          >
            {previousLabel ?? <ChevronLeft className="h-4 w-4" />}
          </PaginationButton>
        )}

        {pageNumbers.map((pageNumber) => {
          if (pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end') {
            return (
              <PaginationEllipsis
                key={pageNumber}
                size={size}
                aria-hidden="true"
              />
            );
          }

          const isActive = pageNumber === currentPage;
          return (
            <PaginationButton
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              disabled={disabled}
              variant={isActive ? 'active' : 'default'}
              size={size}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </PaginationButton>
          );
        })}

        {showPrevNext && (
          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || isLastPage}
            size={size}
            aria-label="Go to next page"
          >
            {nextLabel ?? <ChevronRight className="h-4 w-4" />}
          </PaginationButton>
        )}

        {showFirstLast && (
          <PaginationButton
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || isLastPage}
            size={size}
            aria-label="Go to last page"
          >
            {lastLabel ?? <ChevronsRight className="h-4 w-4" />}
          </PaginationButton>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

// Sub-components

export interface PaginationButtonProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paginationItemVariants> {
  disabled?: boolean;
}

export const PaginationButton = forwardRef<
  HTMLButtonElement,
  PaginationButtonProps
>(({ className, variant, size, disabled, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(paginationItemVariants({ variant, size, className }))}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

PaginationButton.displayName = 'PaginationButton';

export interface PaginationEllipsisProps
  extends HTMLAttributes<HTMLSpanElement>,
    Pick<VariantProps<typeof paginationItemVariants>, 'size'> {}

export const PaginationEllipsis = forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(({ className, size, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'flex items-center justify-center text-muted-foreground',
        size === 'sm' && 'h-8 w-8',
        size === 'lg' && 'h-12 w-12',
        (!size || size === 'default') && 'h-10 w-10',
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
    </span>
  );
});

PaginationEllipsis.displayName = 'PaginationEllipsis';
