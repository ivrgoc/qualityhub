import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  describe('rendering', () => {
    it('should render progress bar element', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render with default value of 0', () => {
      render(<Progress />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should render with provided value', () => {
      render(<Progress value={75} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should render with label', () => {
      render(<Progress value={50} label="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with value display when showValue is true', () => {
      render(<Progress value={50} showValue />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render with both label and value', () => {
      render(<Progress value={75} label="Progress" showValue />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('value calculation', () => {
    it('should handle custom max value', () => {
      render(<Progress value={5} max={10} showValue />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should clamp percentage to 0 for negative values', () => {
      render(<Progress value={-10} showValue />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should clamp percentage to 100 for values exceeding max', () => {
      render(<Progress value={150} max={100} showValue />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should use custom formatValue function', () => {
      const formatValue = (value: number, max: number) => `${value}/${max} completed`;
      render(<Progress value={3} max={10} showValue formatValue={formatValue} />);
      expect(screen.getByText('3/10 completed')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply default size classes', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-4');
    });

    it('should apply small size classes', () => {
      render(<Progress value={50} size="sm" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-2');
    });

    it('should apply large size classes', () => {
      render(<Progress value={50} size="lg" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-6');
    });
  });

  describe('variants', () => {
    it('should apply default variant to indicator', () => {
      const { container } = render(<Progress value={50} />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveClass('bg-primary');
    });

    it('should apply success variant to indicator', () => {
      const { container } = render(<Progress value={50} variant="success" />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('should apply warning variant to indicator', () => {
      const { container } = render(<Progress value={50} variant="warning" />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('should apply error variant to indicator', () => {
      const { container } = render(<Progress value={50} variant="error" />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('should apply info variant to indicator', () => {
      const { container } = render(<Progress value={50} variant="info" />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveClass('bg-blue-500');
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<Progress value={75} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have correct ARIA attributes with custom max', () => {
      render(<Progress value={5} max={10} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    });
  });

  describe('custom className', () => {
    it('should apply custom className to progress bar', () => {
      render(<Progress value={50} className="custom-class" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('custom-class');
    });

    it('should apply indicatorClassName to indicator', () => {
      const { container } = render(
        <Progress value={50} indicatorClassName="custom-indicator" />
      );
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveClass('custom-indicator');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Progress ref={ref} value={50} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('additional HTML attributes', () => {
    it('should pass through data-testid attribute', () => {
      render(<Progress value={50} data-testid="upload-progress" />);
      expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
    });

    it('should accept id attribute', () => {
      render(<Progress value={50} id="my-progress" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('id', 'my-progress');
    });
  });

  describe('indicator transform', () => {
    it('should transform indicator based on percentage', () => {
      const { container } = render(<Progress value={50} />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should transform indicator to 0% for complete progress', () => {
      const { container } = render(<Progress value={100} />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('should transform indicator to -100% for zero progress', () => {
      const { container } = render(<Progress value={0} />);
      const progressbar = container.querySelector('[role="progressbar"]');
      const indicator = progressbar?.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });
  });
});
