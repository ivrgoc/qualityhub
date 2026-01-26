import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';
import { Trash2 } from 'lucide-react';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Delete item',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dialog when open', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render title', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Delete item')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(
        screen.getByText('Are you sure you want to delete this item? This action cannot be undone.')
      ).toBeInTheDocument();
    });

    it('should render default confirm button label', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should render default cancel button label', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should render custom confirm button label', () => {
      render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" />);
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('should render custom cancel button label', () => {
      render(<ConfirmDialog {...defaultProps} cancelLabel="Keep" />);
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });

    it('should render warning icon for destructive variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="destructive" />);
      // The icon container should be present
      const iconContainer = document.querySelector('.bg-destructive\\/10');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should not render icon for default variant without custom icon', () => {
      render(<ConfirmDialog {...defaultProps} variant="default" />);
      const iconContainer = document.querySelector('.bg-destructive\\/10');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should render custom icon', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          icon={<Trash2 data-testid="custom-icon" className="h-6 w-6" />}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should not show close button in header', () => {
      render(<ConfirmDialog {...defaultProps} />);
      // The X close button should not be present (only Cancel and Confirm buttons)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent('Cancel');
      expect(buttons[1]).toHaveTextContent('Confirm');
    });
  });

  describe('interaction', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel and onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <ConfirmDialog
          {...defaultProps}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onOpenChange(false) when cancel button is clicked without onCancel', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should close dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should close dialog when clicking overlay', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/80');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('loading state', () => {
    it('should show loading text when isLoading is true', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });

    it('should disable confirm button when isLoading is true', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });

    it('should disable cancel button when isLoading is true', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    it('should not call onConfirm when confirm button is clicked during loading', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} isLoading />);

      await user.click(screen.getByRole('button', { name: 'Loading...' }));

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('should use destructive button style for destructive variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="destructive" />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-destructive');
    });

    it('should use default button style for default variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="default" />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-primary');
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible name from title', () => {
      render(<ConfirmDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName('Delete item');
    });

    it('should have accessible description', () => {
      render(<ConfirmDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleDescription(
        'Are you sure you want to delete this item? This action cannot be undone.'
      );
    });

    it('should trap focus within dialog', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });
  });

  describe('custom className', () => {
    it('should apply custom className to DialogContent', () => {
      render(<ConfirmDialog {...defaultProps} className="custom-dialog-class" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-dialog-class');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to DialogContent', () => {
      const ref = vi.fn();
      render(<ConfirmDialog {...defaultProps} ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
