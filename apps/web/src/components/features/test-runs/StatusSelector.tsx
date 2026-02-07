import { type FC, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SkipForward,
  MinusCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui';
import type { TestStatus } from '@/types';

/**
 * Status configuration with colors, icons, and shortcuts.
 */
const STATUS_CONFIG: Record<
  Exclude<TestStatus, 'untested'>,
  {
    label: string;
    shortcut: string;
    icon: typeof CheckCircle2;
    className: string;
    activeClassName: string;
  }
> = {
  passed: {
    label: 'Passed',
    shortcut: 'P',
    icon: CheckCircle2,
    className: 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950',
    activeClassName: 'bg-green-500 text-white border-green-500 hover:bg-green-600 dark:bg-green-600',
  },
  failed: {
    label: 'Failed',
    shortcut: 'F',
    icon: XCircle,
    className: 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950',
    activeClassName: 'bg-red-500 text-white border-red-500 hover:bg-red-600 dark:bg-red-600',
  },
  blocked: {
    label: 'Blocked',
    shortcut: 'B',
    icon: AlertTriangle,
    className: 'border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950',
    activeClassName: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 dark:bg-orange-600',
  },
  retest: {
    label: 'Retest',
    shortcut: 'R',
    icon: RefreshCw,
    className: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-950',
    activeClassName: 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600',
  },
  skipped: {
    label: 'Skipped',
    shortcut: 'S',
    icon: SkipForward,
    className: 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800',
    activeClassName: 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600 dark:bg-gray-600',
  },
};

const STATUSES: Array<Exclude<TestStatus, 'untested'>> = [
  'passed',
  'failed',
  'blocked',
  'retest',
  'skipped',
];

/**
 * Props for the StatusSelector component.
 */
export interface StatusSelectorProps {
  selectedStatus?: TestStatus;
  onSelect: (status: TestStatus) => void;
  disabled?: boolean;
  showShortcuts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Status selection component with keyboard shortcut hints.
 * Allows selecting test result status with visual feedback.
 */
export const StatusSelector: FC<StatusSelectorProps> = ({
  selectedStatus,
  onSelect,
  disabled,
  showShortcuts = true,
  size = 'md',
  className,
}) => {
  const handleSelect = useCallback(
    (status: TestStatus) => {
      if (!disabled) {
        onSelect(status);
      }
    },
    [disabled, onSelect]
  );

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs gap-1',
    md: 'h-10 px-3 text-sm gap-2',
    lg: 'h-12 px-4 text-base gap-2',
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const isActive = selectedStatus === status;

        return (
          <Button
            key={status}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => handleSelect(status)}
            className={cn(
              'border-2 transition-all',
              sizeClasses[size],
              isActive ? config.activeClassName : config.className
            )}
          >
            <Icon className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            <span>{config.label}</span>
            {showShortcuts && (
              <kbd
                className={cn(
                  'ml-1 rounded px-1.5 font-mono text-[10px]',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {config.shortcut}
              </kbd>
            )}
          </Button>
        );
      })}
    </div>
  );
};
