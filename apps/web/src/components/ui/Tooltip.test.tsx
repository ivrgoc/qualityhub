import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  SimpleTooltip,
} from './Tooltip';
import { Button } from './Button';

// Helper to render a basic tooltip within provider
function renderTooltip(
  props: {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
    contentProps?: React.ComponentProps<typeof TooltipContent>;
  } = {}
) {
  const { contentProps, delayDuration, ...tooltipProps } = props;
  return render(
    <TooltipProvider delayDuration={delayDuration ?? 0}>
      <Tooltip {...tooltipProps}>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent {...contentProps}>
          <span>Tooltip content</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe('Tooltip', () => {
  describe('rendering', () => {
    it('should render tooltip trigger', () => {
      renderTooltip();
      expect(
        screen.getByRole('button', { name: 'Hover me' })
      ).toBeInTheDocument();
    });

    it('should not render tooltip content when closed', () => {
      renderTooltip();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should render tooltip content when defaultOpen is true', () => {
      renderTooltip({ defaultOpen: true });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should open tooltip on hover', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should open tooltip on focus', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Hover me' })).toHaveFocus();
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should close tooltip when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderTooltip({ defaultOpen: true });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when tooltip opens', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderTooltip({ onOpenChange: handleOpenChange });

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <TooltipProvider delayDuration={0}>
          <Tooltip open={false} onOpenChange={handleOpenChange}>
            <TooltipTrigger asChild>
              <Button>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Controlled content</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      // Simulate parent updating state
      rerender(
        <TooltipProvider delayDuration={0}>
          <Tooltip open={true} onOpenChange={handleOpenChange}>
            <TooltipTrigger asChild>
              <Button>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Controlled content</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('positioning', () => {
    it('should support different side options', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <Button>Trigger</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" data-testid="tooltip-content">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    it('should support different alignment options', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <Button>Trigger</Button>
            </TooltipTrigger>
            <TooltipContent align="start" data-testid="tooltip-content">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    it('should support custom sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <Button>Trigger</Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} data-testid="tooltip-content">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className to TooltipContent', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <Button>Trigger</Button>
            </TooltipTrigger>
            <TooltipContent
              className="custom-tooltip-class"
              data-testid="tooltip-content"
            >
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-content')).toHaveClass(
        'custom-tooltip-class'
      );
    });
  });

  describe('portal', () => {
    it('should render in portal by default', () => {
      renderTooltip({ defaultOpen: true });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should render without portal when portal prop is false', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <Button>Trigger</Button>
            </TooltipTrigger>
            <TooltipContent portal={false} data-testid="tooltip-content">
              Content without portal
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper role on tooltip content', () => {
      renderTooltip({ defaultOpen: true });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});

describe('TooltipContent', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipContent ref={ref}>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should apply default styles', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipContent data-testid="tooltip-content">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId('tooltip-content');
    expect(content).toHaveClass('rounded-md', 'border', 'bg-popover', 'px-3', 'py-1.5');
  });
});

describe('TooltipArrow', () => {
  it('should render arrow in tooltip content', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipArrow data-testid="tooltip-arrow" />
            Content with arrow
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('tooltip-arrow')).toBeInTheDocument();
  });

  it('should apply custom className to arrow', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipArrow
              data-testid="tooltip-arrow"
              className="custom-arrow-class"
            />
            Content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('tooltip-arrow')).toHaveClass(
      'custom-arrow-class'
    );
  });

  it('should forward ref to arrow', () => {
    const ref = vi.fn();
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipArrow ref={ref} />
            Content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('SimpleTooltip', () => {
  it('should render children', () => {
    render(
      <TooltipProvider>
        <SimpleTooltip content="Simple tooltip">
          <Button>Simple trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    expect(screen.getByRole('button', { name: 'Simple trigger' })).toBeInTheDocument();
  });

  it('should show tooltip on hover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content="Simple tooltip content">
          <Button>Simple trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Simple trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should render just children when disabled', () => {
    render(
      <TooltipProvider>
        <SimpleTooltip content="Tooltip" disabled>
          <Button>Disabled trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    expect(screen.getByRole('button', { name: 'Disabled trigger' })).toBeInTheDocument();
  });

  it('should not show tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content="Should not show" disabled>
          <Button>Disabled trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Disabled trigger' }));

    // Wait a bit to ensure tooltip doesn't show
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should render just children when content is empty', () => {
    render(
      <TooltipProvider>
        <SimpleTooltip content="">
          <Button>Empty content trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    expect(screen.getByRole('button', { name: 'Empty content trigger' })).toBeInTheDocument();
  });

  it('should support custom side and align', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content="Positioned tooltip" side="bottom" align="start">
          <Button>Positioned trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Positioned trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should support custom sideOffset', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content="Offset tooltip" sideOffset={20}>
          <Button>Offset trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Offset trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should support custom className', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content="Styled tooltip" className="custom-simple-tooltip">
          <Button>Styled trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Styled trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should forward ref to trigger', () => {
    const ref = vi.fn();
    render(
      <TooltipProvider>
        <SimpleTooltip content="With ref" ref={ref}>
          <Button>Ref trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('should support custom delayDuration', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <SimpleTooltip content="Delayed tooltip" delayDuration={0}>
          <Button>Delayed trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Delayed trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should support React nodes as content', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content={<span data-testid="rich-content">Rich content</span>}>
          <Button>Rich trigger</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button', { name: 'Rich trigger' }));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});
