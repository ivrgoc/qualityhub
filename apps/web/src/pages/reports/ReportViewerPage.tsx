import { type FC, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, RefreshCw } from 'lucide-react';
import {
  Button,
  Alert,
  AlertDescription,
  Skeleton,
} from '@/components/ui';
import {
  SummaryReport,
  CoverageReport,
  ExportDialog,
  type ExportOptions,
} from '@/components/features/reports';
import {
  useGetSummaryReportQuery,
  useGetCoverageReportQuery,
  useGetDefectsReportQuery,
  useGetActivityReportQuery,
  useExportReportMutation,
  type ReportType,
  type ReportFormat,
  type DateRange,
} from '@/store/api/reportsApi';
import { useToast } from '@/hooks';

const REPORT_TITLES: Record<ReportType, string> = {
  summary: 'Summary Report',
  coverage: 'Coverage Report',
  defects: 'Defects Report',
  activity: 'Activity Report',
};

/**
 * Report viewer page rendering the selected report with export functionality.
 */
export const ReportViewerPage: FC = () => {
  const { projectId, reportType } = useParams<{
    projectId: string;
    reportType: ReportType;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showExportDialog, setShowExportDialog] = useState(false);

  // Parse date range from query params
  const dateRange: DateRange | undefined = useMemo(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      return { startDate, endDate };
    }
    return undefined;
  }, [searchParams]);

  // Fetch report data based on type
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetSummaryReportQuery(
    { projectId: projectId!, dateRange },
    { skip: !projectId || reportType !== 'summary' }
  );

  const {
    data: coverageData,
    isLoading: isCoverageLoading,
    error: coverageError,
    refetch: refetchCoverage,
  } = useGetCoverageReportQuery(
    { projectId: projectId!, dateRange },
    { skip: !projectId || reportType !== 'coverage' }
  );

  const {
    data: defectsData,
    isLoading: isDefectsLoading,
    error: defectsError,
    refetch: refetchDefects,
  } = useGetDefectsReportQuery(
    { projectId: projectId!, dateRange },
    { skip: !projectId || reportType !== 'defects' }
  );

  const {
    data: activityData,
    isLoading: isActivityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useGetActivityReportQuery(
    { projectId: projectId!, dateRange },
    { skip: !projectId || reportType !== 'activity' }
  );

  const [exportReport, { isLoading: isExporting }] = useExportReportMutation();

  // Determine current state based on report type
  const isLoading =
    reportType === 'summary'
      ? isSummaryLoading
      : reportType === 'coverage'
        ? isCoverageLoading
        : reportType === 'defects'
          ? isDefectsLoading
          : isActivityLoading;

  const error =
    reportType === 'summary'
      ? summaryError
      : reportType === 'coverage'
        ? coverageError
        : reportType === 'defects'
          ? defectsError
          : activityError;

  const refetch =
    reportType === 'summary'
      ? refetchSummary
      : reportType === 'coverage'
        ? refetchCoverage
        : reportType === 'defects'
          ? refetchDefects
          : refetchActivity;

  // Handle export
  const handleExport = useCallback(
    async (format: ReportFormat, options: ExportOptions) => {
      if (!projectId || !reportType) return;

      try {
        const result = await exportReport({
          projectId,
          reportType,
          format,
          dateRange,
          includeCharts: options.includeCharts,
          includeDetails: options.includeDetails,
        }).unwrap();

        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
          toast({
            title: 'Export successful',
            description: `Report exported as ${format.toUpperCase()}`,
          });
        } else if (result.status === 'pending' || result.status === 'processing') {
          toast({
            title: 'Export in progress',
            description: 'Your report is being generated. Please wait...',
          });
        }

        setShowExportDialog(false);
      } catch {
        toast({
          title: 'Export failed',
          description: 'Failed to export report. Please try again.',
          variant: 'error',
        });
      }
    },
    [projectId, reportType, dateRange, exportReport, toast]
  );

  // Error message extraction
  const errorMessage = useMemo(() => {
    if (!error) return null;
    if ('status' in error) {
      const fetchError = error as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred loading the report';
  }, [error]);

  if (!projectId || !reportType) {
    return (
      <Alert variant="error">
        <AlertDescription>Invalid report parameters</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/reports`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {REPORT_TITLES[reportType]}
            </h1>
            {dateRange && (
              <p className="mt-1 text-sm text-muted-foreground">
                {dateRange.startDate} to {dateRange.endDate}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={isLoading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowExportDialog(true)}
            disabled={isLoading}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="error">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Report Content */}
      {isLoading ? (
        <ReportSkeleton />
      ) : (
        <>
          {reportType === 'summary' && summaryData && (
            <SummaryReport data={summaryData} />
          )}
          {reportType === 'coverage' && coverageData && (
            <CoverageReport data={coverageData} />
          )}
          {reportType === 'defects' && defectsData && (
            <DefectsReportContent data={defectsData} />
          )}
          {reportType === 'activity' && activityData && (
            <ActivityReportContent data={activityData} />
          )}
        </>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        reportType={reportType}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};

/**
 * Defects report content component (placeholder for future implementation).
 */
import type { DefectsReport, ActivityReport } from '@/store/api/reportsApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { TrendChart } from '@/components/features/reports';
import { formatDistanceToNow, parseISO } from 'date-fns';

const DefectsReportContent: FC<{ data: DefectsReport }> = ({ data }) => {
  return (
    <div>
      {/* Report Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{data.projectName}</h2>
        <p className="text-sm text-muted-foreground">
          Defects Report generated{' '}
          {formatDistanceToNow(parseISO(data.generatedAt), { addSuffix: true })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Defects</p>
            <p className="text-2xl font-bold">{data.totalDefects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Open Defects</p>
            <p className="text-2xl font-bold text-red-600">{data.openDefects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Closed Defects</p>
            <p className="text-2xl font-bold text-green-600">{data.closedDefects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
            <p className="text-2xl font-bold">{Math.round(data.averageResolutionTime)}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Defect Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Defect Trend</CardTitle>
          <CardDescription>Opened vs closed defects over time</CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={data.defectTrend.map((point) => ({
              date: point.date,
              passed: point.closed,
              failed: point.opened,
            }))}
            lines={[
              { dataKey: 'passed', color: '#22c55e', name: 'Closed' },
              { dataKey: 'failed', color: '#ef4444', name: 'Opened' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Severity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Defects by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {data.defectsBySeverity.critical}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
              <p className="text-sm text-muted-foreground">High</p>
              <p className="text-2xl font-bold text-orange-600">
                {data.defectsBySeverity.high}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">
                {data.defectsBySeverity.medium}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-muted-foreground">Low</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.defectsBySeverity.low}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Activity report content component (placeholder for future implementation).
 */
const ActivityReportContent: FC<{ data: ActivityReport }> = ({ data }) => {
  return (
    <div>
      {/* Report Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{data.projectName}</h2>
        <p className="text-sm text-muted-foreground">
          Activity Report generated{' '}
          {formatDistanceToNow(parseISO(data.generatedAt), { addSuffix: true })}
        </p>
      </div>

      {/* Summary Metric */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total Activities</p>
          <p className="text-3xl font-bold">{data.totalActivities}</p>
        </CardContent>
      </Card>

      {/* Activity Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Daily Activity</CardTitle>
          <CardDescription>Number of activities per day</CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={data.dailyActivity.map((point) => ({
              date: point.date,
              total: point.count,
            }))}
            lines={[{ dataKey: 'total', color: '#8b5cf6', name: 'Activities' }]}
          />
        </CardContent>
      </Card>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Contributors</CardTitle>
          <CardDescription>Most active team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.activitiesByUser.slice(0, 5).map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <span className="font-medium">{user.userName}</span>
                </div>
                <span className="text-muted-foreground">
                  {user.count} activities
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Loading skeleton for reports.
 */
const ReportSkeleton: FC = () => (
  <div className="space-y-6">
    <div className="mb-6">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
