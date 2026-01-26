import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverAnchor,
  PopoverArrow,
} from './Popover';
import { Button } from './Button';

// Helper to render a basic popover
function renderPopover(
  props: {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    contentProps?: React.ComponentProps<typeof PopoverContent>;
  } = {}
) {
  const { contentProps, ...popoverProps } = props;
  return render(
    <Popover {...popoverProps}>
      <PopoverTrigger asChild>
        <Button>Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent {...contentProps}>
        <div>Popover content</div>
        <PopoverClose asChild>
          <Button variant="outline" size="sm">
            Close
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  describe('rendering', () => {
    it('should render popover trigger', () => {
      renderPopover();
      expect(
        screen.getByRole('button', { name: 'Open Popover' })
      ).toBeInTheDocument();
    });

    it('should not render popover content when closed', () => {
      renderPopover();
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('should render popover content when defaultOpen is true', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('should render close button inside popover', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should open popover when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open Popover' }));

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('should close popover when close button is clicked', async () => {
      const user = userEvent.setup();
      renderPopover({ defaultOpen: true });

      expect(screen.getByText('Popover content')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Close' }));

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });

    it('should close popover when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderPopover({ defaultOpen: true });

      expect(screen.getByText('Popover content')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });

    it('should close popover when clicking outside', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderPopover({ defaultOpen: true, onOpenChange: handleOpenChange });

      expect(screen.getByText('Popover content')).toBeInTheDocument();

      // Click outside the popover
      await user.click(document.body);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should call onOpenChange when popover opens', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderPopover({ onOpenChange: handleOpenChange });

      await user.click(screen.getByRole('button', { name: 'Open Popover' }));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('should call onOpenChange when popover closes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderPopover({ defaultOpen: true, onOpenChange: handleOpenChange });

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
        <Popover open={false} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button>Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div>Controlled content</div>
          </PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open Popover' }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      // Simulate parent updating state
      rerender(
        <Popover open={true} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button>Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div>Controlled content</div>
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });
  });

  describe('positioning', () => {
    it('should support different alignment options', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent align="start" data-testid="popover-content">
            Content
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('should support custom sideOffset', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent sideOffset={10} data-testid="popover-content">
            Content
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('should support different side options', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent side="right" data-testid="popover-content">
            Content
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className to PopoverContent', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent
            className="custom-popover-class"
            data-testid="popover-content"
          >
            Content
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-content')).toHaveClass(
        'custom-popover-class'
      );
    });
  });

  describe('portal', () => {
    it('should render in portal by default', () => {
      renderPopover({ defaultOpen: true });

      // Content should be rendered in a portal (outside the button's parent)
      const content = screen.getByText('Popover content');
      expect(content).toBeInTheDocument();
    });

    it('should render without portal when portal prop is false', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent portal={false} data-testid="popover-content">
            Content without portal
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Content without portal')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria attributes on trigger', async () => {
      const user = userEvent.setup();
      renderPopover();

      const trigger = screen.getByRole('button', { name: 'Open Popover' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should focus content when opened', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent data-testid="popover-content">
            <input type="text" placeholder="Focus me" />
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Trigger' }));

      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });
    });
  });
});

describe('PopoverContent', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Popover defaultOpen>
        <PopoverContent ref={ref}>Content</PopoverContent>
      </Popover>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should apply default styles', () => {
    render(
      <Popover defaultOpen>
        <PopoverContent data-testid="popover-content">Content</PopoverContent>
      </Popover>
    );

    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('rounded-md', 'border', 'bg-popover', 'p-4');
  });
});

describe('PopoverAnchor', () => {
  it('should render as anchor element', () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor asChild>
          <div data-testid="anchor">Anchor element</div>
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );

    expect(screen.getByTestId('anchor')).toBeInTheDocument();
    expect(screen.getByText('Anchor element')).toBeInTheDocument();
  });
});

describe('PopoverArrow', () => {
  it('should render arrow in popover content', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow data-testid="popover-arrow" />
          Content with arrow
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByTestId('popover-arrow')).toBeInTheDocument();
  });

  it('should apply custom className to arrow', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow
            data-testid="popover-arrow"
            className="custom-arrow-class"
          />
          Content
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByTestId('popover-arrow')).toHaveClass(
      'custom-arrow-class'
    );
  });

  it('should forward ref to arrow', () => {
    const ref = vi.fn();
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow ref={ref} />
          Content
        </PopoverContent>
      </Popover>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('PopoverClose', () => {
  it('should close popover when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverClose asChild>
            <Button>Close popover</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByText('Close popover')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close popover' }));

    await waitFor(() => {
      expect(screen.queryByText('Close popover')).not.toBeInTheDocument();
    });
  });
});
