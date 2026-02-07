import { type FC, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SkipForward,
  MinusCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
} from '@/components/ui';
import type { TestCase, TestResult, TestStatus } from '@/types';

/**
 * Get icon for test status.
 */
function getStatusIcon(status: TestStatus) {
  switch (status) {
    case 'passed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'blocked':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'retest':
      return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    case 'skipped':
      return <SkipForward className="h-4 w-4 text-gray-500" />;
    case 'untested':
    default:
      return <MinusCircle className="h-4 w-4 text-gray-400" />;
  }
}

/**
 * Props for the ExecutionTestList component.
 */
export interface ExecutionTestListProps {
  testCases: TestCase[];
  results: Map<string, TestResult>;
  currentIndex: number;
  statusFilter?: TestStatus | 'all';
  isLoading?: boolean;
  onSelectTest: (index: number) => void;
  onStatusFilterChange?: (status: TestStatus | 'all') => void;
  className?: string;
}

const STATUS_FILTER_OPTIONS: Array<{ value: TestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'untested', label: 'Untested' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'retest', label: 'Retest' },
  { value: 'skipped', label: 'Skipped' },
];

/**
 * List component showing test cases during execution.
 * Displays status icons and supports filtering by status.
 */
export const ExecutionTestList: FC<ExecutionTestListProps> = ({
  testCases,
  results,
  currentIndex,
  statusFilter = 'all',
  isLoading,
  onSelectTest,
  onStatusFilterChange,
  className,
}) => {
  // Filter test cases by status
  const filteredTestCases = useMemo(() => {
    if (statusFilter === 'all') return testCases;

    return testCases.filter((tc) => {
      const result = results.get(tc.id);
      const status = result?.status ?? 'untested';
      return status === statusFilter;
    });
  }, [testCases, results, statusFilter]);

  // Get original index for filtered items
  const getOriginalIndex = (tc: TestCase) => {
    return testCases.findIndex((t) => t.id === tc.id);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2 p-2', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filter header */}
      {onStatusFilterChange && (
        <div className="border-b p-2">
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as TestStatus | 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Test list */}
      <div className="flex-1 overflow-auto">
        {filteredTestCases.length > 0 ? (
          filteredTestCases.map((testCase) => {
            const result = results.get(testCase.id);
            const status = result?.status ?? 'untested';
            const originalIndex = getOriginalIndex(testCase);
            const isCurrentTest = originalIndex === currentIndex;

            return (
              <button
                key={testCase.id}
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 border-b px-3 py-2 text-left transition-colors',
                  'hover:bg-muted/50',
                  isCurrentTest && 'bg-accent'
                )}
                onClick={() => onSelectTest(originalIndex)}
              >
                {/* Status icon */}
                {getStatusIcon(status)}

                {/* Test info */}
                <div className="flex-1 min-w-0">
                  <span className="block text-xs text-muted-foreground">
                    #{originalIndex + 1}
                  </span>
                  <span className="block truncate text-sm">{testCase.title}</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No test cases match the filter.
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border-t p-2 text-xs text-muted-foreground">
        {filteredTestCases.length} of {testCases.length} test cases
      </div>
    </div>
  );
};
