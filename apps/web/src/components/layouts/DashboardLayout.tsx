import { type FC, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/utils/cn';

export interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Dashboard layout component with sidebar, header, and main content area.
 * Used for all authenticated pages in the application.
 */
export const DashboardLayout: FC<DashboardLayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className={cn('flex-1 overflow-auto p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
