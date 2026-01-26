import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastProvider = ToastPrimitive.Provider;

export type ToastViewportProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>;

const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));

ToastViewport.displayName = 'ToastViewport';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success:
          'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
        error:
          'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
        info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = forwardRef<ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
);

Toast.displayName = 'Toast';

export interface ToastActionProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitive.Action> {
  altText: string;
}

const ToastAction = forwardRef<
  ElementRef<typeof ToastPrimitive.Action>,
  ToastActionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.success]:border-green-300 group-[.success]:hover:border-green-400 group-[.success]:hover:bg-green-100 group-[.error]:border-red-300 group-[.error]:hover:border-red-400 group-[.error]:hover:bg-red-100 group-[.warning]:border-yellow-300 group-[.warning]:hover:border-yellow-400 group-[.warning]:hover:bg-yellow-100 group-[.info]:border-blue-300 group-[.info]:hover:border-blue-400 group-[.info]:hover:bg-blue-100',
      className
    )}
    {...props}
  />
));

ToastAction.displayName = 'ToastAction';

export type ToastCloseProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Close>;

const ToastClose = forwardRef<
  ElementRef<typeof ToastPrimitive.Close>,
  ToastCloseProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.success]:text-green-600 group-[.success]:hover:text-green-800 group-[.error]:text-red-600 group-[.error]:hover:text-red-800 group-[.warning]:text-yellow-600 group-[.warning]:hover:text-yellow-800 group-[.info]:text-blue-600 group-[.info]:hover:text-blue-800',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));

ToastClose.displayName = 'ToastClose';

export type ToastTitleProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Title>;

const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitive.Title>,
  ToastTitleProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));

ToastTitle.displayName = 'ToastTitle';

export type ToastDescriptionProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Description>;

const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitive.Description>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));

ToastDescription.displayName = 'ToastDescription';

export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export interface ToasterToast extends ToastProps {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastActionElement;
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
