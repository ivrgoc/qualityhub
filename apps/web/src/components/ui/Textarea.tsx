import {
  type TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const textareaVariants = cva(
  'flex w-full rounded-md border bg-background text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        error:
          'border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/60',
      },
      size: {
        default: 'min-h-[80px] px-3 py-2',
        sm: 'min-h-[60px] px-3 py-1.5 text-xs',
        lg: 'min-h-[120px] px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  /** Error message to display below the textarea */
  error?: string;
  /** Enable auto-resize based on content */
  autoResize?: boolean;
  /** Minimum number of rows when auto-resize is enabled */
  minRows?: number;
  /** Maximum number of rows when auto-resize is enabled (0 for unlimited) */
  maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      error,
      autoResize = false,
      minRows = 3,
      maxRows = 0,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const hasError = !!error || variant === 'error';
    const textareaVariant = hasError ? 'error' : variant;

    const setRef = useCallback(
      (element: HTMLTextAreaElement | null) => {
        internalRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref]
    );

    const adjustHeight = useCallback(() => {
      const textarea = internalRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate line height from computed styles
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
      const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

      const minHeight = minRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
      const maxHeight =
        maxRows > 0
          ? maxRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom
          : Infinity;

      // Calculate new height
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;

      // Enable scrolling if content exceeds max height
      textarea.style.overflowY = newHeight >= maxHeight && maxHeight !== Infinity ? 'auto' : 'hidden';
    }, [autoResize, minRows, maxRows]);

    useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [autoResize, adjustHeight, props.value, props.defaultValue]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) {
          adjustHeight();
        }
        onChange?.(event);
      },
      [autoResize, adjustHeight, onChange]
    );

    const textareaElement = (
      <textarea
        className={cn(
          textareaVariants({ variant: textareaVariant, size }),
          autoResize && 'resize-none overflow-hidden',
          className
        )}
        ref={setRef}
        aria-invalid={hasError}
        aria-describedby={error ? `${props.id}-error` : undefined}
        onChange={handleChange}
        {...props}
      />
    );

    if (!error) {
      return textareaElement;
    }

    return (
      <div className="w-full">
        {textareaElement}
        <p
          id={props.id ? `${props.id}-error` : undefined}
          className="mt-1.5 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
