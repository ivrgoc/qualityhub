import { Component, type ErrorInfo, type ReactNode, type FC } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, Home } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called when retry/reset is clicked */
  onReset?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Retry configuration */
  retry?: {
    /** Enable automatic retry (default: false) */
    auto?: boolean;
    /** Maximum retry attempts (default: 3) */
    maxAttempts?: number;
    /** Initial delay in ms (default: 1000) */
    initialDelay?: number;
  };
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in its child
 * component tree, logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0, isRetrying: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Auto retry if configured
    const { retry } = this.props;
    if (retry?.auto && this.state.retryCount < (retry.maxAttempts ?? 3)) {
      this.scheduleAutoRetry();
    }
  }

  override componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private scheduleAutoRetry = (): void => {
    const { retry } = this.props;
    const delay = (retry?.initialDelay ?? 1000) * Math.pow(2, this.state.retryCount);

    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.handleReset(true);
    }, delay);
  };

  handleReset = (isAutoRetry = false): void => {
    this.props.onReset?.();
    this.setState((state) => ({
      hasError: false,
      error: null,
      retryCount: isAutoRetry ? state.retryCount + 1 : 0,
      isRetrying: false,
    }));
  };

  override render(): ReactNode {
    const { hasError, error, retryCount, isRetrying } = this.state;
    const { children, fallback, className, retry } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const maxAttempts = retry?.maxAttempts ?? 3;
      const canRetry = !retry?.auto || retryCount < maxAttempts;

      return (
        <div
          role="alert"
          className={cn(
            'flex min-h-[400px] flex-col items-center justify-center p-8 text-center',
            className
          )}
        >
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
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
          {isRetrying && (
            <p className="mt-4 text-sm text-muted-foreground">
              Retrying automatically... (attempt {retryCount + 1}/{maxAttempts})
            </p>
          )}
          {canRetry && !isRetrying && (
            <Button onClick={() => this.handleReset(false)} className="mt-6" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * Props for QueryErrorBoundary
 */
export interface QueryErrorBoundaryProps {
  /** The error to display */
  error: unknown;
  /** Refetch function to retry the query */
  refetch?: () => void;
  /** Whether refetch is in progress */
  isRefetching?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode for inline errors */
  compact?: boolean;
}

/**
 * Error display component for RTK Query and API errors.
 * Shows appropriate UI based on error type (network, server, etc.)
 */
export const QueryErrorBoundary: FC<QueryErrorBoundaryProps> = ({
  error,
  refetch,
  isRefetching = false,
  className,
  compact = false,
}) => {
  // Determine error type and message
  const getErrorInfo = () => {
    if (!error) {
      return { type: 'unknown', message: 'An unknown error occurred', icon: AlertTriangle };
    }

    // RTK Query FetchBaseQueryError
    if (typeof error === 'object' && 'status' in error) {
      const fetchError = error as { status: number | string; data?: { message?: string } };
      const status = fetchError.status;

      // Network error
      if (status === 'FETCH_ERROR') {
        return {
          type: 'network',
          message: 'Network error. Please check your connection.',
          icon: WifiOff,
        };
      }

      // Server error (5xx)
      if (typeof status === 'number' && status >= 500) {
        return {
          type: 'server',
          message: fetchError.data?.message || 'Server error. Please try again later.',
          icon: ServerCrash,
        };
      }

      // Client error (4xx)
      if (typeof status === 'number' && status >= 400) {
        return {
          type: 'client',
          message: fetchError.data?.message || `Error ${status}. Please try again.`,
          icon: AlertTriangle,
        };
      }
    }

    // Standard Error object
    if (error instanceof Error) {
      return { type: 'error', message: error.message, icon: AlertTriangle };
    }

    return { type: 'unknown', message: 'An unexpected error occurred', icon: AlertTriangle };
  };

  const { message, icon: Icon } = getErrorInfo();

  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3',
          className
        )}
      >
        <Icon className="h-5 w-5 shrink-0 text-destructive" />
        <p className="flex-1 text-sm text-destructive">{message}</p>
        {refetch && (
          <Button
            size="sm"
            variant="outline"
            onClick={refetch}
            disabled={isRefetching}
            className="shrink-0"
          >
            {isRefetching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        <Icon className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        Unable to load data
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-3">
        {refetch && (
          <Button onClick={refetch} disabled={isRefetching} variant="outline">
            {isRefetching ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </>
            )}
          </Button>
        )}
        <Button variant="ghost" onClick={() => window.location.href = '/'}>
          <Home className="mr-2 h-4 w-4" />
          Go home
        </Button>
      </div>
    </div>
  );
};

/**
 * Props for PageErrorBoundary
 */
export interface PageErrorBoundaryProps {
  children: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Page-level error boundary with navigation options.
 */
export const PageErrorBoundary: FC<PageErrorBoundaryProps> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">
            Page Error
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            This page encountered an error and could not be displayed.
            Please try refreshing or navigate to another page.
          </p>
          <div className="mt-8 flex gap-4">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh page
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </div>
        </div>
      }
    />
  );
};
