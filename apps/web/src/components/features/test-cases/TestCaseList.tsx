import { type FC, useCallback, useMemo } from 'react';
import { Search, Filter, Plus, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Button,
  Input,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  Pagination,
  EmptyState,
} from '@/components/ui';
import { TestCaseRow } from './TestCaseRow';
import type { TestCase, Priority, TestCaseTemplate } from '@/types';
import type { TestCaseFilters } from '@/hooks/useTestCases';

/**
 * Props for the TestCaseList component.
 */
export interface TestCaseListProps {
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  selectedIds: Set<string>;
  filters: TestCaseFilters;
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading?: boolean;
  isAllSelected?: boolean;
  onSelectTestCase: (testCase: TestCase) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onSetFilters: (filters: Partial<TestCaseFilters>) => void;
  onSetPage: (page: number) => void;
  onCreateTestCase: () => void;
  className?: string;
}

const PRIORITY_OPTIONS: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TEMPLATE_OPTIONS: { value: TestCaseTemplate | 'all'; label: string }[] = [
  { value: 'all', label: 'All Templates' },
  { value: 'steps', label: 'Steps' },
  { value: 'text', label: 'Text' },
  { value: 'bdd', label: 'BDD' },
  { value: 'exploratory', label: 'Exploratory' },
];

/**
 * List component for displaying test cases with search, filters, and pagination.
 */
export const TestCaseList: FC<TestCaseListProps> = ({
  testCases,
  selectedTestCase,
  selectedIds,
  filters,
  page,
  totalPages,
  totalCount,
  isLoading,
  isAllSelected,
  onSelectTestCase,
  onToggleSelect,
  onSelectAll,
  onSetFilters,
  onSetPage,
  onCreateTestCase,
  className,
}) => {
  // Debounced search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSetFilters({ search: e.target.value });
    },
    [onSetFilters]
  );

  const handlePriorityChange = useCallback(
    (value: string) => {
      onSetFilters({ priority: value === 'all' ? undefined : (value as Priority) });
    },
    [onSetFilters]
  );

  const handleTemplateChange = useCallback(
    (value: string) => {
      onSetFilters({ templateType: value === 'all' ? undefined : (value as TestCaseTemplate) });
    },
    [onSetFilters]
  );

  const hasActiveFilters = useMemo(
    () => filters.search || filters.priority || filters.templateType,
    [filters]
  );

  const handleClearFilters = useCallback(() => {
    onSetFilters({ search: '', priority: undefined, templateType: undefined });
  }, [onSetFilters]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="border-b p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b p-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header with search and filters */}
      <div className="border-b p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search test cases..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filters.priority ?? 'all'}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.templateType ?? 'all'}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground"
            >
              Clear filters
            </Button>
          )}

          <div className="flex-1" />

          <Button onClick={onCreateTestCase} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Test Case
          </Button>
        </div>

        {/* Bulk selection header */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
            />
            <span className="text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : `${totalCount} test cases`}
            </span>
          </div>
        </div>
      </div>

      {/* Test case list */}
      <div className="flex-1 overflow-auto">
        {testCases.length > 0 ? (
          testCases.map((testCase) => (
            <TestCaseRow
              key={testCase.id}
              testCase={testCase}
              isSelected={selectedTestCase?.id === testCase.id}
              isChecked={selectedIds.has(testCase.id)}
              onSelect={onSelectTestCase}
              onToggleCheck={onToggleSelect}
            />
          ))
        ) : (
          <EmptyState
            icon={<Filter className="h-12 w-12" />}
            title="No test cases found"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first test case to get started.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={onCreateTestCase}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Case
                </Button>
              )
            }
            className="py-12"
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onSetPage}
          />
        </div>
      )}
    </div>
  );
};
