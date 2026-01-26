import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        default: 'py-12 px-6',
        sm: 'py-8 px-4',
        lg: 'py-16 px-8',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface EmptyStateProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground [&>svg]:h-12 [&>svg]:w-12">
          {icon}
        </div>
      )}
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {description && (
        <EmptyStateDescription>{description}</EmptyStateDescription>
      )}
      {action && <EmptyStateAction>{action}</EmptyStateAction>}
    </div>
  )
);

EmptyState.displayName = 'EmptyState';

export type EmptyStateTitleProps = HTMLAttributes<HTMLHeadingElement>;

const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
);

EmptyStateTitle.displayName = 'EmptyStateTitle';

export type EmptyStateDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

const EmptyStateDescription = forwardRef<
  HTMLParagraphElement,
  EmptyStateDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mt-2 text-sm text-muted-foreground max-w-md', className)}
    {...props}
  />
));

EmptyStateDescription.displayName = 'EmptyStateDescription';

export type EmptyStateActionProps = HTMLAttributes<HTMLDivElement>;

const EmptyStateAction = forwardRef<HTMLDivElement, EmptyStateActionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-6', className)} {...props} />
  )
);

EmptyStateAction.displayName = 'EmptyStateAction';

export {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
};
