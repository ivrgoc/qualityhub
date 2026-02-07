import { type FC, useMemo } from 'react';
import { AlertCircle, CheckCircle2, FileQuestion, Layers } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { CoverageReport as CoverageReportData } from '@/store/api/reportsApi';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/utils/cn';

export interface CoverageReportProps {
  data: CoverageReportData;
  isLoading?: boolean;
  className?: string;
}

/**
 * Coverage report component displaying requirement and suite coverage.
 * Includes coverage gauge, metrics table, and uncovered requirements list.
 */
export const CoverageReport: FC<CoverageReportProps> = ({
  data,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return <CoverageReportSkeleton className={className} />;
  }

  return (
    <div className={className}>
      {/* Report Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{data.projectName}</h2>
        <p className="text-sm text-muted-foreground">
          Coverage Report generated{' '}
          {formatDistanceToNow(parseISO(data.generatedAt), { addSuffix: true })}
        </p>
      </div>

      {/* Overall Coverage Gauge */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Overall Coverage</CardTitle>
          <CardDescription>
            Percentage of requirements with linked test cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoverageGauge percentage={data.overallCoverage} />
        </CardContent>
      </Card>

      {/* Coverage Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Requirement Coverage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Requirement Coverage</CardTitle>
            </div>
            <CardDescription>
              Test coverage by requirement ({data.requirementCoverage.length} requirements)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CoverageTable items={data.requirementCoverage} />
          </CardContent>
        </Card>

        {/* Suite Coverage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Suite Coverage</CardTitle>
            </div>
            <CardDescription>
              Test coverage by suite ({data.suiteCoverage.length} suites)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CoverageTable items={data.suiteCoverage} />
          </CardContent>
        </Card>
      </div>

      {/* Uncovered Requirements */}
      {data.uncoveredRequirements.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Uncovered Requirements</CardTitle>
            </div>
            <CardDescription>
              Requirements without linked test cases ({data.uncoveredRequirements.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.uncoveredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border bg-amber-50/50 p-3 dark:bg-amber-900/10"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="warning" className="shrink-0">
                      {req.id}
                    </Badge>
                    <span className="text-sm text-foreground">{req.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Coverage gauge component showing overall coverage percentage.
 */
interface CoverageGaugeProps {
  percentage: number;
}

const CoverageGauge: FC<CoverageGaugeProps> = ({ percentage }) => {
  const status = useMemo(() => {
    if (percentage >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (percentage >= 60) return { label: 'Good', color: 'text-blue-600' };
    if (percentage >= 40) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Needs Improvement', color: 'text-red-600' };
  }, [percentage]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={
              percentage >= 80
                ? '#22c55e'
                : percentage >= 60
                  ? '#3b82f6'
                  : percentage >= 40
                    ? '#eab308'
                    : '#ef4444'
            }
            strokeWidth="10"
            strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className={cn('h-5 w-5', status.color)} />
        <span className={cn('font-medium', status.color)}>{status.label}</span>
      </div>
    </div>
  );
};

/**
 * Coverage table component showing individual coverage metrics.
 */
interface CoverageTableProps {
  items: Array<{
    id: string;
    name: string;
    totalCases: number;
    executedCases: number;
    passedCases: number;
    coveragePercentage: number;
  }>;
}

const CoverageTable: FC<CoverageTableProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Tests</TableHead>
            <TableHead className="text-right">Coverage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">
                <span className="text-green-600">{item.passedCases}</span>
                <span className="text-muted-foreground">
                  /{item.totalCases}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Progress
                    value={item.coveragePercentage}
                    className="h-2 w-16"
                  />
                  <span className="w-12 text-sm">
                    {item.coveragePercentage.toFixed(0)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * Skeleton loading state for the coverage report.
 */
const CoverageReportSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <div className="mb-6">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="mb-6 h-64" />
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </div>
);
