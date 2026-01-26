import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

const checkboxVariants = cva(
  'peer shrink-0 rounded-sm border ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        error: 'border-destructive focus-visible:ring-destructive',
      },
      size: {
        default: 'h-4 w-4',
        sm: 'h-3.5 w-3.5',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface CheckboxProps
  extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /** Label text to display next to the checkbox */
  label?: ReactNode;
  /** Description text to display below the label */
  description?: string;
  /** Error message to display below the checkbox */
  error?: string;
}

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, variant, size, label, description, error, id, ...props }, ref) => {
    const hasError = !!error || variant === 'error';
    const checkboxVariant = hasError ? 'error' : variant;

    const checkboxElement = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        className={cn(checkboxVariants({ variant: checkboxVariant, size }), className)}
        aria-invalid={hasError}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {props.checked === 'indeterminate' ? (
            <Minus className={cn(size === 'sm' ? 'h-2.5 w-2.5' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3')} />
          ) : (
            <Check className={cn(size === 'sm' ? 'h-2.5 w-2.5' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3')} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label && !description && !error) {
      return checkboxElement;
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-start gap-2">
          {checkboxElement}
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
            className="mt-1 pl-6 text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            id={id ? `${id}-error` : undefined}
            className="mt-1 pl-6 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
