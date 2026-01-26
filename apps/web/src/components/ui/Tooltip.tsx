import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/cn';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

export type TooltipContentProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /** Whether to render inside a portal */
  portal?: boolean;
};

const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      portal = true,
      children,
      ...props
    },
    ref
  ) => {
    const content = (
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    );

    if (portal) {
      return <TooltipPortal>{content}</TooltipPortal>;
    }

    return content;
  }
);

TooltipContent.displayName = 'TooltipContent';

export type TooltipArrowProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Arrow
>;

const TooltipArrow = forwardRef<
  ElementRef<typeof TooltipPrimitive.Arrow>,
  TooltipArrowProps
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn('fill-popover', className)}
    {...props}
  />
));

TooltipArrow.displayName = 'TooltipArrow';

export interface SimpleTooltipProps {
  /** The content to display in the tooltip */
  content: ReactNode;
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** The preferred side of the trigger to render against when open */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** The preferred alignment against the trigger */
  align?: 'start' | 'center' | 'end';
  /** The distance in pixels from the trigger */
  sideOffset?: number;
  /** The delay duration in milliseconds before the tooltip opens */
  delayDuration?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Additional className for the tooltip content */
  className?: string;
}

const SimpleTooltip = forwardRef<HTMLButtonElement, SimpleTooltipProps>(
  (
    {
      content,
      children,
      side = 'top',
      align = 'center',
      sideOffset = 4,
      delayDuration,
      disabled = false,
      className,
    },
    ref
  ) => {
    if (disabled || !content) {
      return <>{children}</>;
    }

    return (
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger ref={ref} asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={className}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }
);

SimpleTooltip.displayName = 'SimpleTooltip';

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipArrow,
  SimpleTooltip,
};
