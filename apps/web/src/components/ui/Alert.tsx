import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-600 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200 dark:[&>svg]:text-blue-400',
        success:
          'bg-green-50 border-green-200 text-green-800 [&>svg]:text-green-600 dark:bg-green-950 dark:border-green-800 dark:text-green-200 dark:[&>svg]:text-green-400',
        warning:
          'bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-600 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200 dark:[&>svg]:text-yellow-400',
        error:
          'bg-red-50 border-red-200 text-red-800 [&>svg]:text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-200 dark:[&>svg]:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
);

Alert.displayName = 'Alert';

export type AlertTitleProps = HTMLAttributes<HTMLHeadingElement>;

const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);

AlertTitle.displayName = 'AlertTitle';

export type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
