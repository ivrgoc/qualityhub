import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './Dialog';
import { Button } from './Button';

// Helper to render a basic dialog
function renderDialog(
  props: {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showCloseButton?: boolean;
  } = {}
) {
  const { showCloseButton, ...dialogProps } = props;
  return render(
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description text</DialogDescription>
        </DialogHeader>
        <div>Dialog body content</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  describe('rendering', () => {
    it('should render dialog trigger', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument();
    });

    it('should not render dialog content when closed', () => {
      renderDialog();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog content when defaultOpen is true', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render dialog title', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByText('Dialog description text')).toBeInTheDocument();
    });

    it('should render dialog body content', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByText('Dialog body content')).toBeInTheDocument();
    });

    it('should render footer buttons', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should render close button by default', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should not render close button when showCloseButton is false', () => {
      renderDialog({ defaultOpen: true, showCloseButton: false });
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Close' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when clicking overlay', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange: handleOpenChange });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click on the overlay (the dark background behind the dialog)
      // The overlay has inset-0 which covers the entire viewport
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/80');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should call onOpenChange when dialog opens', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderDialog({ onOpenChange: handleOpenChange });

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('should call onOpenChange when dialog closes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange: handleOpenChange });

      await user.click(screen.getByRole('button', { name: 'Close' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <Dialog open={false} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      // Simulate parent updating state
      rerender(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible name from title', () => {
      renderDialog({ defaultOpen: true });
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName('Dialog Title');
    });

    it('should have accessible description', () => {
      renderDialog({ defaultOpen: true });
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleDescription('Dialog description text');
    });

    it('should trap focus within dialog', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      // Focus should be within the dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      // Tab through focusable elements
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });

    it('should have sr-only text for close button', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByText('Close')).toHaveClass('sr-only');
    });
  });

  describe('custom className', () => {
    it('should apply custom className to DialogContent', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent className="custom-content-class">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-content-class');
    });

    it('should apply custom className to DialogHeader', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader className="custom-header-class" data-testid="dialog-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-header')).toHaveClass('custom-header-class');
    });

    it('should apply custom className to DialogFooter', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter className="custom-footer-class" data-testid="dialog-footer">
              <Button>Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-footer')).toHaveClass('custom-footer-class');
    });

    it('should apply custom className to DialogTitle', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle className="custom-title-class">Custom Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Custom Title')).toHaveClass('custom-title-class');
    });

    it('should apply custom className to DialogDescription', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription className="custom-description-class">
              Custom Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Custom Description')).toHaveClass('custom-description-class');
    });
  });
});

describe('DialogOverlay', () => {
  it('should render with default styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    // The overlay should have the background color class
    const overlay = document.querySelector('[data-state="open"].fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });
});

describe('DialogHeader', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader ref={ref}>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('DialogFooter', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter ref={ref}>
            <Button>Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should render children', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <Button>Primary Action</Button>
            <Button variant="outline">Secondary Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
  });
});

describe('DialogTitle', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle ref={ref}>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should render with heading styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>My Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const title = screen.getByText('My Title');
    expect(title).toHaveClass('text-lg', 'font-semibold');
  });
});

describe('DialogDescription', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription ref={ref}>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should render with muted text styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>My Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const description = screen.getByText('My Description');
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });
});

describe('DialogContent', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Dialog defaultOpen>
        <DialogContent ref={ref}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('DialogClose', () => {
  it('should close dialog when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <Button>Close Me</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close Me' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
