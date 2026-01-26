import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton, SkeletonCard } from './Skeleton';

describe('Skeleton', () => {
  it('should render with default styles', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-muted');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('should apply circular variant', () => {
    render(<Skeleton variant="circular" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('should apply text variant', () => {
    render(<Skeleton variant="text" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded');
  });

  it('should apply width as number (pixels)', () => {
    render(<Skeleton width={100} data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100px' });
  });

  it('should apply width as string', () => {
    render(<Skeleton width="50%" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '50%' });
  });

  it('should apply height as number (pixels)', () => {
    render(<Skeleton height={50} data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('should apply height as string', () => {
    render(<Skeleton height="2rem" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ height: '2rem' });
  });

  it('should apply custom className', () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have aria-hidden attribute', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Skeleton ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should merge custom style with width/height', () => {
    render(
      <Skeleton width={100} height={50} style={{ opacity: 0.5 }} data-testid="skeleton" />
    );
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px', opacity: '0.5' });
  });
});

describe('SkeletonText', () => {
  it('should render single line by default', () => {
    render(<SkeletonText data-testid="skeleton-text" />);
    const skeleton = screen.getByTestId('skeleton-text');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('rounded');
    expect(skeleton).toHaveStyle({ width: '100%', height: '16px' });
  });

  it('should render multiple lines', () => {
    const { container } = render(<SkeletonText lines={3} data-testid="skeleton-text" />);
    const wrapper = screen.getByTestId('skeleton-text');
    expect(wrapper).toHaveClass('space-y-2');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons).toHaveLength(3);
  });

  it('should make last line shorter when multiple lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    // Last line should be 80% width
    expect(skeletons[2]).toHaveStyle({ width: '80%' });
    // Other lines should be 100% width
    expect(skeletons[0]).toHaveStyle({ width: '100%' });
    expect(skeletons[1]).toHaveStyle({ width: '100%' });
  });

  it('should apply custom width', () => {
    render(<SkeletonText width="200px" data-testid="skeleton-text" />);
    const skeleton = screen.getByTestId('skeleton-text');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<SkeletonText ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('SkeletonAvatar', () => {
  it('should render with circular shape and default size', () => {
    render(<SkeletonAvatar data-testid="skeleton-avatar" />);
    const skeleton = screen.getByTestId('skeleton-avatar');
    expect(skeleton).toHaveClass('rounded-full');
    expect(skeleton).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should apply custom size', () => {
    render(<SkeletonAvatar width={60} height={60} data-testid="skeleton-avatar" />);
    const skeleton = screen.getByTestId('skeleton-avatar');
    expect(skeleton).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<SkeletonAvatar ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('SkeletonButton', () => {
  it('should render with default size', () => {
    render(<SkeletonButton data-testid="skeleton-button" />);
    const skeleton = screen.getByTestId('skeleton-button');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveStyle({ width: '100px', height: '40px' });
  });

  it('should apply custom size', () => {
    render(<SkeletonButton width={150} height={48} data-testid="skeleton-button" />);
    const skeleton = screen.getByTestId('skeleton-button');
    expect(skeleton).toHaveStyle({ width: '150px', height: '48px' });
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<SkeletonButton ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('SkeletonCard', () => {
  it('should render card layout with avatar and text', () => {
    const { container } = render(<SkeletonCard data-testid="skeleton-card" />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('p-6');

    // Should contain multiple skeleton elements
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('should apply custom className', () => {
    render(<SkeletonCard className="custom-class" data-testid="skeleton-card" />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<SkeletonCard ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
