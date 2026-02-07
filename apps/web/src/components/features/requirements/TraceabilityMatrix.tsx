import { type FC, useMemo } from 'react';
import { CheckCircle2, XCircle, Minus, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import type { TraceabilityMatrix as TraceabilityMatrixData } from '@/store/api/requirementsApi';

export interface TraceabilityMatrixProps {
  data: TraceabilityMatrixData;
  isLoading?: boolean;
  className?: string;
}

/**
 * Traceability matrix component showing requirements vs test cases grid.
 * Each cell shows the coverage status of a requirement-test case pair.
 */
export const TraceabilityMatrix: FC<TraceabilityMatrixProps> = ({
  data,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return <TraceabilityMatrixSkeleton className={className} />;
  }

  // Build a lookup map for coverage
  const coverageMap = useMemo(() => {
    const map = new Map<string, string>();
    data.coverage.forEach((cell) => {
      map.set(`${cell.requirementId}-${cell.testCaseId}`, cell.status || 'linked');
    });
    return map;
  }, [data.coverage]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Traceability Matrix</CardTitle>
            <CardDescription>
              Requirements mapped to test cases
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-muted-foreground">Failed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-muted-foreground">Linked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Not linked</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="mb-4 flex items-center gap-6 rounded-lg bg-muted/50 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Requirements</p>
            <p className="text-2xl font-bold">{data.stats.totalRequirements}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Covered</p>
            <p className="text-2xl font-bold text-green-600">
              {data.stats.coveredRequirements}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Coverage</p>
            <p className="text-2xl font-bold">
              {data.stats.coveragePercentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Matrix Grid */}
        {data.requirements.length === 0 || data.testCases.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            No data to display. Add requirements and test cases first.
          </div>
        ) : (
          <div className="overflow-auto">
            <div className="min-w-max">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 border bg-muted p-2 text-left text-sm font-medium">
                      Requirement / Test Case
                    </th>
                    {data.testCases.map((testCase) => (
                      <th
                        key={testCase.id}
                        className="border bg-muted p-2 text-left text-sm font-medium"
                        style={{ minWidth: '120px', maxWidth: '200px' }}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">
                              {testCase.title}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{testCase.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td className="sticky left-0 z-10 border bg-card p-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-xs cursor-help">
                              <span className="font-mono text-xs text-muted-foreground">
                                {requirement.externalId}
                              </span>
                              <p className="truncate text-sm font-medium">
                                {requirement.title}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{requirement.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      {data.testCases.map((testCase) => {
                        const key = `${requirement.id}-${testCase.id}`;
                        const status = coverageMap.get(key);

                        return (
                          <td
                            key={testCase.id}
                            className="border p-2 text-center"
                          >
                            <MatrixCell status={status} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MatrixCellProps {
  status?: string;
}

const MatrixCell: FC<MatrixCellProps> = ({ status }) => {
  if (!status) {
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />;
  }

  if (status === 'passed') {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />;
  }

  if (status === 'failed') {
    return <XCircle className="mx-auto h-5 w-5 text-red-600" />;
  }

  // Default: linked but not executed or other status
  return <AlertTriangle className="mx-auto h-4 w-4 text-yellow-600" />;
};

const TraceabilityMatrixSkeleton: FC<{ className?: string }> = ({ className }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-16 w-full" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);
