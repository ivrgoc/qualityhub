import { type FC, type ReactNode } from 'react';
import { ErrorBoundary, Toaster } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface RootLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Root layout component that wraps the entire application.
 * Provides global error boundary and toast notifications.
 */
export const RootLayout: FC<RootLayoutProps> = ({ children, className }) => {
  return (
    <ErrorBoundary>
      <div className={cn('min-h-screen bg-background text-foreground', className)}>
        {children}
      </div>
      <Toaster />
    </ErrorBoundary>
  );
};
