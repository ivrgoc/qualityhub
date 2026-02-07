import { type HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-input bg-background text-foreground',
        destructive: 'bg-red-500 text-white dark:bg-red-600',
        success: 'bg-green-500 text-white dark:bg-green-600',
        warning: 'bg-yellow-500 text-white dark:bg-yellow-600',
        // Test status variants
        passed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        blocked: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
        skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
        untested: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        retest: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      },
      size: {
        default: 'px-2.5 py-0.5',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
