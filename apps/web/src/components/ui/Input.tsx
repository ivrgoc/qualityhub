import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  'flex w-full rounded-md border bg-background text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        error:
          'border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/60',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-3 py-1 text-xs',
        lg: 'h-11 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Icon to display on the left side of the input */
  leftIcon?: ReactNode;
  /** Icon to display on the right side of the input */
  rightIcon?: ReactNode;
  /** Error message to display below the input */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, size, leftIcon, rightIcon, error, type = 'text', ...props },
    ref
  ) => {
    const hasError = !!error || variant === 'error';
    const inputVariant = hasError ? 'error' : variant;

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: inputVariant, size }),
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        ref={ref}
        aria-invalid={hasError}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
    );

    if (!leftIcon && !rightIcon && !error) {
      return inputElement;
    }

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
                hasError ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {leftIcon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
                hasError ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={props.id ? `${props.id}-error` : undefined}
            className="mt-1.5 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
