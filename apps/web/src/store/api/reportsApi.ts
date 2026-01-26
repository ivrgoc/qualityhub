import { baseApi, createTag, createListTag } from './baseApi';
import type { Priority } from '@/types';

/**
 * Report export format options.
 */
export type ReportFormat = 'pdf' | 'csv' | 'xlsx' | 'html';

/**
 * Report type identifiers.
 */
export type ReportType = 'summary' | 'coverage' | 'defects' | 'activity';

/**
 * Date range filter for reports.
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Common parameters for report queries.
 */
export interface ReportQueryParams {
  projectId: string;
  milestoneId?: string;
  testRunId?: string;
  dateRange?: DateRange;
}

/**
 * Test status distribution in reports.
 */
export interface StatusDistribution {
  passed: number;
  failed: number;
  blocked: number;
  retest: number;
  skipped: number;
  untested: number;
}

/**
 * Summary report data with overall project testing metrics.
 */
export interface SummaryReport {
  projectId: string;
  projectName: string;
  generatedAt: string;
  totalTestCases: number;
  totalTestRuns: number;
  totalExecutions: number;
  statusDistribution: StatusDistribution;
  passRate: number;
  averageExecutionTime: number;
  testCasesByPriority: Record<Priority, number>;
  recentActivity: ActivityItem[];
}

/**
 * Coverage metrics for requirements or test suites.
 */
export interface CoverageMetric {
  id: string;
  name: string;
  totalCases: number;
  executedCases: number;
  passedCases: number;
  coveragePercentage: number;
}

/**
 * Coverage report data with requirement and suite coverage.
 */
export interface CoverageReport {
  projectId: string;
  projectName: string;
  generatedAt: string;
  overallCoverage: number;
  requirementCoverage: CoverageMetric[];
  suiteCoverage: CoverageMetric[];
  uncoveredRequirements: Array<{
    id: string;
    title: string;
  }>;
}

/**
 * Defect trend data point.
 */
export interface DefectTrendPoint {
  date: string;
  opened: number;
  closed: number;
  total: number;
}

/**
 * Defect by severity breakdown.
 */
export interface DefectSeverity {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Defect report data with defect metrics and trends.
 */
export interface DefectsReport {
  projectId: string;
  projectName: string;
  generatedAt: string;
  totalDefects: number;
  openDefects: number;
  closedDefects: number;
  defectsBySeverity: DefectSeverity;
  defectsByStatus: Record<string, number>;
  defectTrend: DefectTrendPoint[];
  topDefectCauses: Array<{
    cause: string;
    count: number;
  }>;
  averageResolutionTime: number;
}

/**
 * Activity item for recent activity feed.
 */
export interface ActivityItem {
  id: string;
  type: 'test_execution' | 'test_case_created' | 'test_case_updated' | 'test_run_created' | 'test_run_completed' | 'defect_reported';
  description: string;
  userId: string;
  userName: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activity report data with activity timeline.
 */
export interface ActivityReport {
  projectId: string;
  projectName: string;
  generatedAt: string;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
  activities: ActivityItem[];
}

/**
 * Parameters for activity report with pagination.
 */
export interface GetActivityReportParams extends ReportQueryParams {
  page?: number;
  pageSize?: number;
  activityType?: ActivityItem['type'];
  userId?: string;
}

/**
 * Request payload for exporting a report.
 */
export interface ExportReportRequest {
  projectId: string;
  reportType: ReportType;
  format: ReportFormat;
  milestoneId?: string;
  testRunId?: string;
  dateRange?: DateRange;
  includeCharts?: boolean;
  includeDetails?: boolean;
}

/**
 * Response for export report request.
 */
export interface ExportReportResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Parameters for checking export status.
 */
export interface GetExportStatusParams {
  projectId: string;
  exportId: string;
}

/**
 * Reports API slice with report generation endpoints.
 * Provides endpoints for fetching summary, coverage, defects, and activity reports,
 * as well as exporting reports to various formats.
 */
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get a summary report for a project.
     * Includes overall testing metrics, status distribution, and pass rate.
     */
    getSummaryReport: builder.query<SummaryReport, ReportQueryParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/reports/summary`,
        params,
      }),
      providesTags: (_result, _error, { projectId }) => [
        createTag('Report', `summary-${projectId}`),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get a coverage report for a project.
     * Includes requirement coverage, suite coverage, and uncovered areas.
     */
    getCoverageReport: builder.query<CoverageReport, ReportQueryParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/reports/coverage`,
        params,
      }),
      providesTags: (_result, _error, { projectId }) => [
        createTag('Report', `coverage-${projectId}`),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get a defects report for a project.
     * Includes defect metrics, severity breakdown, and trends.
     */
    getDefectsReport: builder.query<DefectsReport, ReportQueryParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/reports/defects`,
        params,
      }),
      providesTags: (_result, _error, { projectId }) => [
        createTag('Report', `defects-${projectId}`),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get an activity report for a project.
     * Includes activity timeline, user activity breakdown, and recent activities.
     * Supports pagination and filtering by activity type and user.
     */
    getActivityReport: builder.query<ActivityReport, GetActivityReportParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/reports/activity`,
        params,
      }),
      providesTags: (_result, _error, { projectId }) => [
        createTag('Report', `activity-${projectId}`),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Export a report to a specified format.
     * Returns an export ID that can be used to check status and download.
     */
    exportReport: builder.mutation<ExportReportResponse, ExportReportRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/reports/export`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        createListTag('Report'),
        createTag('Project', projectId),
      ],
    }),

    /**
     * Get the status of a report export.
     * Use this to poll for completion and get the download URL.
     */
    getExportStatus: builder.query<ExportReportResponse, GetExportStatusParams>({
      query: ({ projectId, exportId }) =>
        `/projects/${projectId}/reports/export/${exportId}`,
      providesTags: (_result, _error, { exportId }) => [
        createTag('Report', `export-${exportId}`),
      ],
    }),
  }),
});

export const {
  useGetSummaryReportQuery,
  useLazyGetSummaryReportQuery,
  useGetCoverageReportQuery,
  useLazyGetCoverageReportQuery,
  useGetDefectsReportQuery,
  useLazyGetDefectsReportQuery,
  useGetActivityReportQuery,
  useLazyGetActivityReportQuery,
  useExportReportMutation,
  useGetExportStatusQuery,
  useLazyGetExportStatusQuery,
} = reportsApi;
