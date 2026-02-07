import { type FC, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ReportMetricProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * Individual metric display for reports.
 * Shows a label, value, optional icon, and optional trend indicator.
 */
export const ReportMetric: FC<ReportMetricProps> = ({
  label,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border bg-card p-4',
        className
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
