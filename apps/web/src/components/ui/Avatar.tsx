import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/avatar';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type AvatarRootProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>;

const AvatarRoot = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  AvatarRootProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
));

AvatarRoot.displayName = 'AvatarRoot';

export type AvatarImageProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>;

const AvatarImage = forwardRef<
  ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));

AvatarImage.displayName = 'AvatarImage';

export type AvatarFallbackProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>;

const AvatarFallback = forwardRef<
  ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));

AvatarFallback.displayName = 'AvatarFallback';

export interface AvatarProps extends AvatarRootProps {
  /** URL of the avatar image */
  src?: string;
  /** Alt text for the avatar image */
  alt?: string;
  /** Name to generate fallback initials from */
  name?: string;
  /** Custom fallback content (overrides name-based initials) */
  fallback?: React.ReactNode;
  /** Delay in milliseconds before showing fallback (for loading states) */
  delayMs?: number;
}

/**
 * Avatar component with image and fallback initials support.
 * Uses Radix UI Avatar primitive for accessible avatar rendering.
 */
const Avatar = forwardRef<ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ src, alt, name, fallback, delayMs, size, className, ...props }, ref) => {
    const initials = name ? getInitials(name) : '';
    const fallbackContent = fallback ?? initials;

    return (
      <AvatarRoot ref={ref} size={size} className={className} {...props}>
        {src && <AvatarImage src={src} alt={alt || name || 'Avatar'} />}
        <AvatarFallback delayMs={delayMs}>{fallbackContent}</AvatarFallback>
      </AvatarRoot>
    );
  }
);

Avatar.displayName = 'Avatar';

export {
  Avatar,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
};
