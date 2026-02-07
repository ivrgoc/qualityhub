import { type ReactNode, forwardRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogContentProps,
} from './Dialog';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface ConfirmDialogProps extends Omit<DialogContentProps, 'children'> {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description explaining the action */
  description: ReactNode;
  /** Text for the confirm button */
  confirmLabel?: string;
  /** Alias for confirmLabel */
  confirmText?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /** Callback when confirm button is clicked */
  onConfirm: () => void;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
  /** Whether the confirm button is disabled */
  confirmDisabled?: boolean;
  /** Custom icon to display (defaults to AlertTriangle for destructive variant) */
  icon?: ReactNode;
  /** Visual variant of the dialog */
  variant?: 'destructive' | 'default';
}

export const ConfirmDialog = forwardRef<
  HTMLDivElement,
  ConfirmDialogProps
>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      confirmLabel,
      confirmText,
      cancelLabel = 'Cancel',
      onConfirm,
      onCancel,
      isLoading = false,
      confirmDisabled = false,
      icon,
      variant = 'destructive',
      className,
      ...props
    },
    ref
  ) => {
    const finalConfirmLabel = confirmLabel ?? confirmText ?? 'Confirm';
    const handleCancel = (): void => {
      onCancel?.();
      onOpenChange(false);
    };

    const handleConfirm = (): void => {
      onConfirm();
    };

    const defaultIcon =
      variant === 'destructive' ? (
        <AlertTriangle className="h-6 w-6 text-destructive" />
      ) : null;

    const displayIcon = icon !== undefined ? icon : defaultIcon;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          showCloseButton={false}
          className={cn('sm:max-w-[425px]', className)}
          {...props}
        >
          <DialogHeader>
            {displayIcon && (
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                {displayIcon}
              </div>
            )}
            <DialogTitle className="text-center">{title}</DialogTitle>
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isLoading || confirmDisabled}
            >
              {isLoading ? 'Loading...' : finalConfirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';
