import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('should render checkbox element', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Checkbox id="terms" label="Accept terms" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Checkbox id="newsletter" label="Subscribe" description="Get weekly updates" />);
      expect(screen.getByText('Get weekly updates')).toBeInTheDocument();
    });

    it('should associate label with checkbox via htmlFor', () => {
      render(<Checkbox id="terms" label="Accept terms" />);
      const label = screen.getByText('Accept terms');
      expect(label).toHaveAttribute('for', 'terms');
    });
  });

  describe('interaction', () => {
    it('should toggle checked state when clicked', async () => {
      const user = userEvent.setup();
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should call onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={handleCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle when clicking on label', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      render(<Checkbox id="terms" label="Accept terms" onCheckedChange={handleCheckedChange} />);

      await user.click(screen.getByText('Accept terms'));
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();

      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={handleCheckedChange} />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      rerender(<Checkbox checked={true} onCheckedChange={handleCheckedChange} />);
      expect(checkbox).toBeChecked();
    });

    it('should support defaultChecked for uncontrolled mode', () => {
      render(<Checkbox defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('indeterminate state', () => {
    it('should render indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('border-input');
    });

    it('should apply error variant styles', () => {
      render(<Checkbox variant="error" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('border-destructive');
    });

    it('should apply error variant when error prop is provided', () => {
      render(<Checkbox error="This field is required" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('border-destructive');
    });
  });

  describe('sizes', () => {
    it('should apply default size classes', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
    });

    it('should apply small size classes', () => {
      render(<Checkbox size="sm" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-3.5');
      expect(checkbox).toHaveClass('w-3.5');
    });

    it('should apply large size classes', () => {
      render(<Checkbox size="lg" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-5');
      expect(checkbox).toHaveClass('w-5');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      render(<Checkbox error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('should set aria-invalid when error is present', () => {
      render(<Checkbox error="Error message" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error and id are provided', () => {
      render(<Checkbox id="terms" error="Must accept terms" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'terms-error');
    });

    it('should set aria-describedby for description when no error', () => {
      render(<Checkbox id="newsletter" description="Get updates" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'newsletter-description');
    });

    it('should prioritize error over description in aria-describedby', () => {
      render(<Checkbox id="terms" description="Description" error="Error" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error');
    });

    it('should apply error color to label when error is present', () => {
      render(<Checkbox id="terms" label="Accept terms" error="Required" />);
      const label = screen.getByText('Accept terms');
      expect(label).toHaveClass('text-destructive');
    });

    it('should hide description when error is present', () => {
      render(<Checkbox id="terms" label="Accept" description="Description" error="Error" />);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should not toggle when disabled', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should apply custom className to checkbox', () => {
      render(<Checkbox className="custom-class" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-class');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('additional HTML attributes', () => {
    it('should pass through data-testid attribute', () => {
      render(<Checkbox data-testid="terms-checkbox" />);
      const checkbox = screen.getByTestId('terms-checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should accept id attribute', () => {
      render(<Checkbox id="my-checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'my-checkbox');
    });

    it('should accept value attribute', () => {
      render(<Checkbox value="agree" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('value', 'agree');
    });
  });
});
