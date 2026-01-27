import { type FC, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface StatsCardProps {
  /** Icon to display */
  icon: ReactNode;
  /** Label text */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional trend percentage (positive = up, negative = down) */
  trend?: number;
  /** Optional trend label (e.g., "vs last week") */
  trendLabel?: string;
  /** Icon background color class */
  iconBgColor?: string;
  /** Icon color class */
  iconColor?: string;
  /** Whether the card is in loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Stats card component for displaying a metric with optional trend indicator.
 */
/**
 * Loading skeleton for stats card.
 */
const StatsCardSkeleton: FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('overflow-hidden', className)}>
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const StatsCard: FC<StatsCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendLabel = 'vs last period',
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary',
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <StatsCardSkeleton className={className} />;
  }

  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
              iconBgColor
            )}
          >
            <div className={cn('h-6 w-6', iconColor)}>{icon}</div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              {hasTrend && (
                <span
                  className={cn(
                    'inline-flex items-center text-xs font-medium',
                    isPositive && 'text-green-600 dark:text-green-500',
                    isNegative && 'text-red-600 dark:text-red-500',
                    !isPositive && !isNegative && 'text-muted-foreground'
                  )}
                >
                  {isPositive && <TrendingUp className="mr-0.5 h-3 w-3" />}
                  {isNegative && <TrendingDown className="mr-0.5 h-3 w-3" />}
                  {!isPositive && !isNegative && <Minus className="mr-0.5 h-3 w-3" />}
                  {isPositive && '+'}
                  {trend}%
                </span>
              )}
            </div>
            {hasTrend && trendLabel && (
              <p className="mt-0.5 text-xs text-muted-foreground">{trendLabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
