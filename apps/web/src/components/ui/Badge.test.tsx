import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render children', () => {
    render(<Badge>Test Label</Badge>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('should apply secondary variant styles', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
  });

  it('should apply outline variant styles', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('border');
    expect(badge).toHaveClass('bg-background');
  });

  it('should apply passed status variant styles', () => {
    render(<Badge variant="passed">Passed</Badge>);
    const badge = screen.getByText('Passed');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('should apply failed status variant styles', () => {
    render(<Badge variant="failed">Failed</Badge>);
    const badge = screen.getByText('Failed');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  it('should apply blocked status variant styles', () => {
    render(<Badge variant="blocked">Blocked</Badge>);
    const badge = screen.getByText('Blocked');
    expect(badge).toHaveClass('bg-orange-100');
    expect(badge).toHaveClass('text-orange-800');
  });

  it('should apply skipped status variant styles', () => {
    render(<Badge variant="skipped">Skipped</Badge>);
    const badge = screen.getByText('Skipped');
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('should apply untested status variant styles', () => {
    render(<Badge variant="untested">Untested</Badge>);
    const badge = screen.getByText('Untested');
    expect(badge).toHaveClass('bg-slate-100');
    expect(badge).toHaveClass('text-slate-600');
  });

  it('should apply retest status variant styles', () => {
    render(<Badge variant="retest">Retest</Badge>);
    const badge = screen.getByText('Retest');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  it('should apply default size', () => {
    render(<Badge>Default Size</Badge>);
    const badge = screen.getByText('Default Size');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
  });

  it('should apply sm size', () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small');
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('text-[10px]');
  });

  it('should apply lg size', () => {
    render(<Badge size="lg">Large</Badge>);
    const badge = screen.getByText('Large');
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('text-sm');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Badge ref={ref}>With ref</Badge>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<Badge data-testid="test-badge">Props</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<Badge>Base</Badge>);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('justify-center');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });
});
