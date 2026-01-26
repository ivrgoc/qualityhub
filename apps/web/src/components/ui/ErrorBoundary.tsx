import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in its child
 * component tree, logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, className } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div
          role="alert"
          className={cn(
            'flex min-h-[400px] flex-col items-center justify-center p-8 text-center',
            className
          )}
        >
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if the
            problem persists.
          </p>
          {import.meta.env.DEV && error && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} className="mt-6" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return children;
  }
}
