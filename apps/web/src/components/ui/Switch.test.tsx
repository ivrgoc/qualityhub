import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  describe('rendering', () => {
    it('should render switch element', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Switch id="notifications" label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Switch id="dark-mode" label="Dark mode" description="Toggle dark mode theme" />);
      expect(screen.getByText('Toggle dark mode theme')).toBeInTheDocument();
    });

    it('should associate label with switch via htmlFor', () => {
      render(<Switch id="notifications" label="Enable notifications" />);
      const label = screen.getByText('Enable notifications');
      expect(label).toHaveAttribute('for', 'notifications');
    });
  });

  describe('interaction', () => {
    it('should toggle checked state when clicked', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('data-state', 'unchecked');

      await user.click(switchEl);
      expect(switchEl).toHaveAttribute('data-state', 'checked');

      await user.click(switchEl);
      expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    });

    it('should call onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      render(<Switch onCheckedChange={handleCheckedChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle when clicking on label', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      render(<Switch id="notifications" label="Enable notifications" onCheckedChange={handleCheckedChange} />);

      await user.click(screen.getByText('Enable notifications'));
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();

      const { rerender } = render(
        <Switch checked={false} onCheckedChange={handleCheckedChange} />
      );

      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('data-state', 'unchecked');

      await user.click(switchEl);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      rerender(<Switch checked={true} onCheckedChange={handleCheckedChange} />);
      expect(switchEl).toHaveAttribute('data-state', 'checked');
    });

    it('should support defaultChecked for uncontrolled mode', () => {
      render(<Switch defaultChecked />);
      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Switch />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('focus-visible:ring-ring');
    });

    it('should apply error variant styles', () => {
      render(<Switch variant="error" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('focus-visible:ring-destructive');
    });

    it('should apply error variant when error prop is provided', () => {
      render(<Switch error="This field is required" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('focus-visible:ring-destructive');
    });
  });

  describe('sizes', () => {
    it('should apply default size classes', () => {
      render(<Switch />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('h-6');
      expect(switchEl).toHaveClass('w-11');
    });

    it('should apply small size classes', () => {
      render(<Switch size="sm" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('h-5');
      expect(switchEl).toHaveClass('w-9');
    });

    it('should apply large size classes', () => {
      render(<Switch size="lg" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('h-7');
      expect(switchEl).toHaveClass('w-14');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      render(<Switch error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('should set aria-invalid when error is present', () => {
      render(<Switch error="Error message" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error and id are provided', () => {
      render(<Switch id="notifications" error="Must enable notifications" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-describedby', 'notifications-error');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'notifications-error');
    });

    it('should set aria-describedby for description when no error', () => {
      render(<Switch id="dark-mode" description="Toggle theme" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-describedby', 'dark-mode-description');
    });

    it('should prioritize error over description in aria-describedby', () => {
      render(<Switch id="notifications" description="Description" error="Error" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-describedby', 'notifications-error');
    });

    it('should apply error color to label when error is present', () => {
      render(<Switch id="notifications" label="Enable notifications" error="Required" />);
      const label = screen.getByText('Enable notifications');
      expect(label).toHaveClass('text-destructive');
    });

    it('should hide description when error is present', () => {
      render(<Switch id="notifications" label="Enable" description="Description" error="Error" />);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Switch disabled />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toBeDisabled();
    });

    it('should not toggle when disabled', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleCheckedChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should apply custom className to switch', () => {
      render(<Switch className="custom-class" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('custom-class');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Switch ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('additional HTML attributes', () => {
    it('should pass through data-testid attribute', () => {
      render(<Switch data-testid="notifications-switch" />);
      const switchEl = screen.getByTestId('notifications-switch');
      expect(switchEl).toBeInTheDocument();
    });

    it('should accept id attribute', () => {
      render(<Switch id="my-switch" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('id', 'my-switch');
    });

    it('should accept required attribute', () => {
      render(<Switch required />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-required', 'true');
    });

    it('should accept value attribute', () => {
      render(<Switch value="on" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('value', 'on');
    });
  });
});
