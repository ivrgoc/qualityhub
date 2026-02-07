import { type FC } from 'react';
import {
  FileText,
  PlayCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import type { SummaryReport as SummaryReportData } from '@/store/api/reportsApi';
import { PassFailChart } from './PassFailChart';
import { TrendChart, type TrendDataPoint } from './TrendChart';
import { ReportMetric } from './ReportMetric';
import { formatDistanceToNow, parseISO } from 'date-fns';

export interface SummaryReportProps {
  data: SummaryReportData;
  isLoading?: boolean;
  className?: string;
}

/**
 * Summary report component displaying overall testing metrics.
 * Includes stats, status distribution pie chart, and pass rate trend.
 */
export const SummaryReport: FC<SummaryReportProps> = ({
  data,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return <SummaryReportSkeleton className={className} />;
  }

  // Convert recent activity to trend data for the chart
  const trendData: TrendDataPoint[] = data.recentActivity
    .filter((item) => item.type === 'test_execution')
    .slice(0, 14)
    .reduce((acc, item) => {
      const date = item.timestamp.split('T')[0]!;
      const existing = acc.find((d) => d.date === date);
      const isPassed = item.metadata?.['status'] === 'passed';

      if (existing) {
        if (isPassed) existing.passed = (existing.passed ?? 0) + 1;
        else existing.failed = (existing.failed ?? 0) + 1;
      } else {
        acc.push({
          date,
          passed: isPassed ? 1 : 0,
          failed: isPassed ? 0 : 1,
        });
      }
      return acc;
    }, [] as TrendDataPoint[])
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className={className}>
      {/* Report Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{data.projectName}</h2>
        <p className="text-sm text-muted-foreground">
          Summary Report generated{' '}
          {formatDistanceToNow(parseISO(data.generatedAt), { addSuffix: true })}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetric
          label="Total Test Cases"
          value={data.totalTestCases.toLocaleString()}
          icon={<FileText className="h-5 w-5" />}
        />
        <ReportMetric
          label="Total Test Runs"
          value={data.totalTestRuns.toLocaleString()}
          icon={<PlayCircle className="h-5 w-5" />}
        />
        <ReportMetric
          label="Pass Rate"
          value={`${data.passRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={
            data.passRate >= 80
              ? { value: data.passRate - 80, isPositive: true }
              : undefined
          }
        />
        <ReportMetric
          label="Avg. Execution Time"
          value={`${Math.round(data.averageExecutionTime)}s`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of test results by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassFailChart data={data.statusDistribution} />
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution Trend</CardTitle>
            <CardDescription>
              Passed vs failed tests over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Test Cases by Priority</CardTitle>
          <CardDescription>
            Distribution of test cases across priority levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-xl font-bold text-foreground">
                  {data.testCasesByPriority.critical ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">High</p>
                <p className="text-xl font-bold text-foreground">
                  {data.testCasesByPriority.high ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <CheckCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium</p>
                <p className="text-xl font-bold text-foreground">
                  {data.testCasesByPriority.medium ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low</p>
                <p className="text-xl font-bold text-foreground">
                  {data.testCasesByPriority.low ?? 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Skeleton loading state for the summary report.
 */
const SummaryReportSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <div className="mb-6">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </div>
);
