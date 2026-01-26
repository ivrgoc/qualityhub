import { type HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    variant: {
      default: 'rounded-md',
      circular: 'rounded-full',
      text: 'rounded',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Width of the skeleton (can be any valid CSS value) */
  width?: string | number;
  /** Height of the skeleton (can be any valid CSS value) */
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, style, ...props }, ref) => {
    const skeletonStyle = {
      ...style,
      width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      height:
        height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        style={skeletonStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/** Pre-configured skeleton for text lines */
export const SkeletonText = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant' | 'height'> & { lines?: number }
>(({ className, lines = 1, width = '100%', ...props }, ref) => {
  if (lines === 1) {
    return (
      <Skeleton
        ref={ref}
        variant="text"
        width={width}
        height={16}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : width}
          height={16}
        />
      ))}
    </div>
  );
});

SkeletonText.displayName = 'SkeletonText';

/** Pre-configured skeleton for avatars/profile images */
export const SkeletonAvatar = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, width = 40, height = 40, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

/** Pre-configured skeleton for buttons */
export const SkeletonButton = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, width = 100, height = 40, ...props }, ref) => {
    return (
      <Skeleton ref={ref} width={width} height={height} className={className} {...props} />
    );
  }
);

SkeletonButton.displayName = 'SkeletonButton';

/** Pre-configured skeleton for cards */
export const SkeletonCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('rounded-lg border p-6', className)} {...props}>
        <div className="flex items-center space-x-4">
          <SkeletonAvatar />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="50%" height={16} />
            <Skeleton variant="text" width="30%" height={14} />
          </div>
        </div>
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';
