import { type FC } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Skeleton } from './Skeleton';
import { cn } from '@/utils/cn';

/**
 * Page header skeleton with title and action buttons.
 */
export const PageHeaderSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center justify-between', className)}>
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

/**
 * Stats grid skeleton for 4 stats cards.
 */
export const StatsGridSkeleton: FC<{ className?: string; count?: number }> = ({
  className,
  count = 4,
}) => (
  <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
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
    ))}
  </div>
);

/**
 * Table skeleton with configurable rows and columns.
 */
export const TableSkeleton: FC<{
  className?: string;
  rows?: number;
  columns?: number;
}> = ({ className, rows = 5, columns = 5 }) => (
  <Card className={className}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {/* Table header */}
      <div className="mb-4 flex gap-4 border-b pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={cn('h-4 flex-1', colIdx === 0 && 'w-1/4 flex-none')}
              />
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Card grid skeleton for displaying a grid of cards.
 */
export const CardGridSkeleton: FC<{
  className?: string;
  count?: number;
  columns?: 2 | 3 | 4;
}> = ({ className, count = 6, columns = 3 }) => (
  <div
    className={cn(
      'grid gap-4',
      columns === 2 && 'sm:grid-cols-2',
      columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
      className
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * List skeleton for displaying a list of items.
 */
export const ListSkeleton: FC<{
  className?: string;
  count?: number;
}> = ({ className, count = 5 }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * Form skeleton for displaying a form with multiple fields.
 */
export const FormSkeleton: FC<{
  className?: string;
  fields?: number;
}> = ({ className, fields = 5 }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Detail view skeleton for showing item details.
 */
export const DetailSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>

    {/* Content */}
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>

    {/* Steps or sections */}
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
            <Skeleton className="h-6 w-6 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

/**
 * Dashboard page skeleton combining all dashboard elements.
 */
export const DashboardPageSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('mx-auto max-w-7xl space-y-6', className)}>
    <PageHeaderSkeleton />
    <StatsGridSkeleton />
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    <TableSkeleton rows={5} columns={6} />
  </div>
);

/**
 * Projects list page skeleton.
 */
export const ProjectsPageSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <PageHeaderSkeleton />
    <CardGridSkeleton count={6} columns={3} />
  </div>
);

/**
 * Test cases list page skeleton.
 */
export const TestCasesPageSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <PageHeaderSkeleton />
    {/* Filters */}
    <div className="flex gap-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
    <TableSkeleton rows={10} columns={6} />
  </div>
);

/**
 * Test runs list page skeleton.
 */
export const TestRunsPageSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <PageHeaderSkeleton />
    <div className="flex gap-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <TableSkeleton rows={8} columns={7} />
  </div>
);

/**
 * Test execution page skeleton.
 */
export const TestExecutionPageSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex h-full gap-6', className)}>
    {/* Sidebar */}
    <Card className="w-72 shrink-0">
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded p-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
    {/* Main content */}
    <div className="flex-1">
      <DetailSkeleton />
    </div>
  </div>
);
