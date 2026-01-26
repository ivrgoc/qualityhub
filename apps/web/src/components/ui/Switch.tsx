import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      variant: {
        default: 'focus-visible:ring-ring',
        error: 'focus-visible:ring-destructive data-[state=unchecked]:bg-destructive/20',
      },
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        default: 'h-5 w-5 data-[state=checked]:translate-x-5',
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-7',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface SwitchProps
  extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  /** Label text to display next to the switch */
  label?: ReactNode;
  /** Description text to display below the label */
  description?: string;
  /** Error message to display below the switch */
  error?: string;
}

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, variant, size, label, description, error, id, ...props }, ref) => {
    const hasError = !!error || variant === 'error';
    const switchVariant = hasError ? 'error' : variant;

    const switchElement = (
      <SwitchPrimitive.Root
        ref={ref}
        id={id}
        className={cn(switchVariants({ variant: switchVariant, size }), className)}
        aria-invalid={hasError}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        {...props}
      >
        <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }))} />
      </SwitchPrimitive.Root>
    );

    if (!label && !description && !error) {
      return switchElement;
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {switchElement}
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                hasError && 'text-destructive'
              )}
            >
              {label}
            </label>
          )}
        </div>
        {description && !error && (
          <p
            id={id ? `${id}-description` : undefined}
            className="mt-1 pl-13 text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            id={id ? `${id}-error` : undefined}
            className="mt-1 pl-13 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
