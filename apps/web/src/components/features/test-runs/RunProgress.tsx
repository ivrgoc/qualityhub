import { type FC } from 'react';
import { cn } from '@/utils/cn';
import type { TestRunStats } from '@/store/api/testRunsApi';

/**
 * Status colors for the progress bar segments.
 */
const STATUS_COLORS = {
  passed: 'bg-green-500',
  failed: 'bg-red-500',
  blocked: 'bg-orange-500',
  retest: 'bg-yellow-500',
  skipped: 'bg-gray-400',
  untested: 'bg-gray-200 dark:bg-gray-700',
} as const;

/**
 * Status labels for the legend.
 */
const STATUS_LABELS = {
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  retest: 'Retest',
  skipped: 'Skipped',
  untested: 'Untested',
} as const;

/**
 * Props for the RunProgress component.
 */
export interface RunProgressProps {
  stats: TestRunStats;
  showLegend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Progress bar showing test run status distribution.
 * Displays colored segments for each status type with optional legend.
 */
export const RunProgress: FC<RunProgressProps> = ({
  stats,
  showLegend = false,
  size = 'md',
  className,
}) => {
  const { total, passed, failed, blocked, retest, skipped, untested } = stats;

  // Calculate percentages
  const segments = [
    { key: 'passed', value: passed, color: STATUS_COLORS.passed },
    { key: 'failed', value: failed, color: STATUS_COLORS.failed },
    { key: 'blocked', value: blocked, color: STATUS_COLORS.blocked },
    { key: 'retest', value: retest, color: STATUS_COLORS.retest },
    { key: 'skipped', value: skipped, color: STATUS_COLORS.skipped },
    { key: 'untested', value: untested, color: STATUS_COLORS.untested },
  ].filter((s) => s.value > 0);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div
        className={cn(
          'flex w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          sizeClasses[size]
        )}
      >
        {segments.map((segment) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div
              key={segment.key}
              className={cn('transition-all', segment.color)}
              style={{ width: `${percentage}%` }}
              title={`${STATUS_LABELS[segment.key as keyof typeof STATUS_LABELS]}: ${segment.value}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {segments.map((segment) => (
            <div key={segment.key} className="flex items-center gap-1.5">
              <div className={cn('h-2.5 w-2.5 rounded-full', segment.color)} />
              <span className="text-muted-foreground">
                {STATUS_LABELS[segment.key as keyof typeof STATUS_LABELS]}:{' '}
                <span className="font-medium text-foreground">{segment.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
