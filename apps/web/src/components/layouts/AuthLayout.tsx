import { type FC, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface AuthLayoutProps {
  /** Page title displayed in the card header */
  title: string;
  /** Optional description displayed below the title */
  description?: string;
  /** Main content (form) to render inside the card */
  children: ReactNode;
  /** Footer content displayed below the card (e.g., link to login/register) */
  footer?: ReactNode;
  /** Additional CSS classes for the outer container */
  className?: string;
}

/**
 * Layout component for authentication pages (login, register, forgot password).
 * Provides a centered card design with consistent styling.
 */
export const AuthLayout: FC<AuthLayoutProps> = ({
  title,
  description,
  children,
  footer,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8',
        className
      )}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            QualityHub
          </Link>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {title}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {/* Footer (optional) */}
        {footer && (
          <div className="text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
