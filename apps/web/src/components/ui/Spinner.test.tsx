import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('should render with default styles', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('h-6');
    expect(spinner).toHaveClass('w-6');
  });

  it('should have accessible label by default', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should apply custom accessible label', () => {
    render(<Spinner label="Saving data" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Saving data');
  });

  it('should apply sm size variant', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
  });

  it('should apply lg size variant', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
  });

  it('should apply xl size variant', () => {
    render(<Spinner size="xl" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });

  it('should apply custom className', () => {
    render(<Spinner className="text-primary" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-primary');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Spinner ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional SVG props', () => {
    render(<Spinner data-testid="custom-spinner" />);
    const spinner = screen.getByTestId('custom-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should have proper SVG structure', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('stroke', 'currentColor');

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', 'currentColor');
  });

  it('should allow custom text color via className', () => {
    render(<Spinner className="text-red-500" />);
    const spinner = screen.getByRole('status');
    // Custom color should override the default text-current
    expect(spinner).toHaveClass('text-red-500');
  });

  it('should use currentColor by default for inherited color', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-current');
  });
});
