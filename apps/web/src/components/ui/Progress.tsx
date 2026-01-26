import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        default: 'h-4',
        sm: 'h-2',
        lg: 'h-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const indicatorVariants = cva(
  'h-full w-full flex-1 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-500 dark:bg-green-600',
        warning: 'bg-yellow-500 dark:bg-yellow-600',
        error: 'bg-red-500 dark:bg-red-600',
        info: 'bg-blue-500 dark:bg-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  /** The current progress value (0-100 or custom max) */
  value?: number;
  /** The maximum value for the progress bar (default: 100) */
  max?: number;
  /** Whether to show the progress value as text */
  showValue?: boolean;
  /** Custom format function for the progress value display */
  formatValue?: (value: number, max: number) => string;
  /** Label text to display above the progress bar */
  label?: string;
  /** Additional className for the indicator element */
  indicatorClassName?: string;
}

export const Progress = forwardRef<
  ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      variant,
      showValue = false,
      formatValue,
      label,
      indicatorClassName,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const displayValue = formatValue
      ? formatValue(value, max)
      : `${Math.round(percentage)}%`;

    const progressBar = (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, className }))}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(indicatorVariants({ variant }), indicatorClassName)}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    );

    if (!label && !showValue) {
      return progressBar;
    }

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="mb-2 flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-foreground">{label}</span>
            )}
            {showValue && (
              <span className="text-muted-foreground">{displayValue}</span>
            )}
          </div>
        )}
        {progressBar}
      </div>
    );
  }
);

Progress.displayName = 'Progress';
