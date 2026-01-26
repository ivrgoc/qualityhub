import { describe, it, expect } from 'vitest';
import {
  reportsApi,
  type ReportFormat,
  type ReportType,
  type DateRange,
  type ReportQueryParams,
  type StatusDistribution,
  type SummaryReport,
  type CoverageMetric,
  type CoverageReport,
  type DefectTrendPoint,
  type DefectSeverity,
  type DefectsReport,
  type ActivityItem,
  type ActivityReport,
  type GetActivityReportParams,
  type ExportReportRequest,
  type ExportReportResponse,
  type GetExportStatusParams,
} from './reportsApi';
import { Priority } from '@/types';

// Mock data for reports
const mockStatusDistribution: StatusDistribution = {
  passed: 50,
  failed: 10,
  blocked: 5,
  retest: 3,
  skipped: 2,
  untested: 30,
};

const mockActivityItem: ActivityItem = {
  id: 'activity-123',
  type: 'test_execution',
  description: 'Executed test case TC-001',
  userId: 'user-456',
  userName: 'John Doe',
  entityId: 'case-789',
  entityName: 'Login Test',
  timestamp: '2024-01-15T10:30:00Z',
};

const mockSummaryReport: SummaryReport = {
  projectId: 'project-123',
  projectName: 'QualityHub',
  generatedAt: '2024-01-15T12:00:00Z',
  totalTestCases: 100,
  totalTestRuns: 15,
  totalExecutions: 500,
  statusDistribution: mockStatusDistribution,
  passRate: 83.3,
  averageExecutionTime: 45.5,
  testCasesByPriority: {
    [Priority.CRITICAL]: 10,
    [Priority.HIGH]: 30,
    [Priority.MEDIUM]: 40,
    [Priority.LOW]: 20,
  },
  recentActivity: [mockActivityItem],
};

const mockCoverageMetric: CoverageMetric = {
  id: 'req-123',
  name: 'User Authentication',
  totalCases: 20,
  executedCases: 18,
  passedCases: 16,
  coveragePercentage: 90,
};

const mockCoverageReport: CoverageReport = {
  projectId: 'project-123',
  projectName: 'QualityHub',
  generatedAt: '2024-01-15T12:00:00Z',
  overallCoverage: 85.5,
  requirementCoverage: [mockCoverageMetric],
  suiteCoverage: [
    {
      id: 'suite-123',
      name: 'Smoke Tests',
      totalCases: 50,
      executedCases: 45,
      passedCases: 42,
      coveragePercentage: 90,
    },
  ],
  uncoveredRequirements: [
    { id: 'req-456', title: 'Export Functionality' },
  ],
};

const mockDefectTrendPoint: DefectTrendPoint = {
  date: '2024-01-15',
  opened: 5,
  closed: 3,
  total: 25,
};

const mockDefectSeverity: DefectSeverity = {
  critical: 2,
  high: 8,
  medium: 15,
  low: 10,
};

const mockDefectsReport: DefectsReport = {
  projectId: 'project-123',
  projectName: 'QualityHub',
  generatedAt: '2024-01-15T12:00:00Z',
  totalDefects: 35,
  openDefects: 12,
  closedDefects: 23,
  defectsBySeverity: mockDefectSeverity,
  defectsByStatus: {
    open: 12,
    in_progress: 5,
    resolved: 15,
    closed: 3,
  },
  defectTrend: [mockDefectTrendPoint],
  topDefectCauses: [
    { cause: 'UI Regression', count: 8 },
    { cause: 'API Error', count: 6 },
  ],
  averageResolutionTime: 72.5,
};

const mockActivityReport: ActivityReport = {
  projectId: 'project-123',
  projectName: 'QualityHub',
  generatedAt: '2024-01-15T12:00:00Z',
  totalActivities: 150,
  activitiesByType: {
    test_execution: 80,
    test_case_created: 30,
    test_case_updated: 20,
    test_run_created: 10,
    test_run_completed: 5,
    defect_reported: 5,
  },
  activitiesByUser: [
    { userId: 'user-1', userName: 'John Doe', count: 75 },
    { userId: 'user-2', userName: 'Jane Smith', count: 75 },
  ],
  dailyActivity: [
    { date: '2024-01-14', count: 50 },
    { date: '2024-01-15', count: 100 },
  ],
  activities: [mockActivityItem],
};

const mockExportResponse: ExportReportResponse = {
  exportId: 'export-123',
  status: 'completed',
  downloadUrl: 'https://storage.example.com/reports/export-123.pdf',
  expiresAt: '2024-01-16T12:00:00Z',
};

describe('reportsApi', () => {
  describe('endpoints configuration', () => {
    it('should have getSummaryReport endpoint defined', () => {
      expect(reportsApi.endpoints.getSummaryReport).toBeDefined();
    });

    it('should have getCoverageReport endpoint defined', () => {
      expect(reportsApi.endpoints.getCoverageReport).toBeDefined();
    });

    it('should have getDefectsReport endpoint defined', () => {
      expect(reportsApi.endpoints.getDefectsReport).toBeDefined();
    });

    it('should have getActivityReport endpoint defined', () => {
      expect(reportsApi.endpoints.getActivityReport).toBeDefined();
    });

    it('should have exportReport endpoint defined', () => {
      expect(reportsApi.endpoints.exportReport).toBeDefined();
    });

    it('should have getExportStatus endpoint defined', () => {
      expect(reportsApi.endpoints.getExportStatus).toBeDefined();
    });
  });

  describe('getSummaryReport endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = reportsApi.endpoints.getSummaryReport;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept report query parameters', () => {
      const params: ReportQueryParams = {
        projectId: 'project-123',
        milestoneId: 'milestone-456',
        testRunId: 'run-789',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };

      expect(params.projectId).toBe('project-123');
      expect(params.milestoneId).toBe('milestone-456');
      expect(params.testRunId).toBe('run-789');
      expect(params.dateRange?.startDate).toBe('2024-01-01');
      expect(params.dateRange?.endDate).toBe('2024-01-31');
    });

    it('should work with only required projectId parameter', () => {
      const params: ReportQueryParams = {
        projectId: 'project-123',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.milestoneId).toBeUndefined();
      expect(params.testRunId).toBeUndefined();
      expect(params.dateRange).toBeUndefined();
    });
  });

  describe('getCoverageReport endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = reportsApi.endpoints.getCoverageReport;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and optional filters', () => {
      const params: ReportQueryParams = {
        projectId: 'project-123',
        milestoneId: 'milestone-456',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.milestoneId).toBe('milestone-456');
    });
  });

  describe('getDefectsReport endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = reportsApi.endpoints.getDefectsReport;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and date range', () => {
      const params: ReportQueryParams = {
        projectId: 'project-123',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };
      expect(params.projectId).toBe('project-123');
      expect(params.dateRange?.startDate).toBe('2024-01-01');
    });
  });

  describe('getActivityReport endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = reportsApi.endpoints.getActivityReport;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept pagination and filter parameters', () => {
      const params: GetActivityReportParams = {
        projectId: 'project-123',
        page: 1,
        pageSize: 50,
        activityType: 'test_execution',
        userId: 'user-456',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };

      expect(params.projectId).toBe('project-123');
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(50);
      expect(params.activityType).toBe('test_execution');
      expect(params.userId).toBe('user-456');
    });

    it('should work with only required projectId parameter', () => {
      const params: GetActivityReportParams = {
        projectId: 'project-123',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.page).toBeUndefined();
      expect(params.activityType).toBeUndefined();
    });
  });

  describe('exportReport endpoint', () => {
    it('should be a mutation endpoint', () => {
      const endpoint = reportsApi.endpoints.exportReport;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should generate correct request for exporting a report', () => {
      const exportData: ExportReportRequest = {
        projectId: 'project-123',
        reportType: 'summary',
        format: 'pdf',
        milestoneId: 'milestone-456',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        includeCharts: true,
        includeDetails: true,
      };

      expect(exportData.projectId).toBe('project-123');
      expect(exportData.reportType).toBe('summary');
      expect(exportData.format).toBe('pdf');
      expect(exportData.milestoneId).toBe('milestone-456');
      expect(exportData.includeCharts).toBe(true);
      expect(exportData.includeDetails).toBe(true);
    });

    it('should allow minimal required fields only', () => {
      const exportData: ExportReportRequest = {
        projectId: 'project-123',
        reportType: 'coverage',
        format: 'csv',
      };

      expect(exportData.projectId).toBe('project-123');
      expect(exportData.reportType).toBe('coverage');
      expect(exportData.format).toBe('csv');
      expect(exportData.milestoneId).toBeUndefined();
      expect(exportData.includeCharts).toBeUndefined();
    });

    it('should support all report formats', () => {
      const formats: ReportFormat[] = ['pdf', 'csv', 'xlsx', 'html'];
      formats.forEach((format) => {
        const exportData: ExportReportRequest = {
          projectId: 'project-123',
          reportType: 'summary',
          format,
        };
        expect(exportData.format).toBe(format);
      });
    });

    it('should support all report types', () => {
      const types: ReportType[] = ['summary', 'coverage', 'defects', 'activity'];
      types.forEach((reportType) => {
        const exportData: ExportReportRequest = {
          projectId: 'project-123',
          reportType,
          format: 'pdf',
        };
        expect(exportData.reportType).toBe(reportType);
      });
    });
  });

  describe('getExportStatus endpoint', () => {
    it('should be a query endpoint', () => {
      const endpoint = reportsApi.endpoints.getExportStatus;
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.initiate).toBe('function');
    });

    it('should accept projectId and exportId as parameters', () => {
      const params: GetExportStatusParams = {
        projectId: 'project-123',
        exportId: 'export-456',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.exportId).toBe('export-456');
    });
  });

  describe('exported hooks', () => {
    it('should export useGetSummaryReportQuery hook', async () => {
      const { useGetSummaryReportQuery } = await import('./reportsApi');
      expect(useGetSummaryReportQuery).toBeDefined();
      expect(typeof useGetSummaryReportQuery).toBe('function');
    });

    it('should export useLazyGetSummaryReportQuery hook', async () => {
      const { useLazyGetSummaryReportQuery } = await import('./reportsApi');
      expect(useLazyGetSummaryReportQuery).toBeDefined();
      expect(typeof useLazyGetSummaryReportQuery).toBe('function');
    });

    it('should export useGetCoverageReportQuery hook', async () => {
      const { useGetCoverageReportQuery } = await import('./reportsApi');
      expect(useGetCoverageReportQuery).toBeDefined();
      expect(typeof useGetCoverageReportQuery).toBe('function');
    });

    it('should export useLazyGetCoverageReportQuery hook', async () => {
      const { useLazyGetCoverageReportQuery } = await import('./reportsApi');
      expect(useLazyGetCoverageReportQuery).toBeDefined();
      expect(typeof useLazyGetCoverageReportQuery).toBe('function');
    });

    it('should export useGetDefectsReportQuery hook', async () => {
      const { useGetDefectsReportQuery } = await import('./reportsApi');
      expect(useGetDefectsReportQuery).toBeDefined();
      expect(typeof useGetDefectsReportQuery).toBe('function');
    });

    it('should export useLazyGetDefectsReportQuery hook', async () => {
      const { useLazyGetDefectsReportQuery } = await import('./reportsApi');
      expect(useLazyGetDefectsReportQuery).toBeDefined();
      expect(typeof useLazyGetDefectsReportQuery).toBe('function');
    });

    it('should export useGetActivityReportQuery hook', async () => {
      const { useGetActivityReportQuery } = await import('./reportsApi');
      expect(useGetActivityReportQuery).toBeDefined();
      expect(typeof useGetActivityReportQuery).toBe('function');
    });

    it('should export useLazyGetActivityReportQuery hook', async () => {
      const { useLazyGetActivityReportQuery } = await import('./reportsApi');
      expect(useLazyGetActivityReportQuery).toBeDefined();
      expect(typeof useLazyGetActivityReportQuery).toBe('function');
    });

    it('should export useExportReportMutation hook', async () => {
      const { useExportReportMutation } = await import('./reportsApi');
      expect(useExportReportMutation).toBeDefined();
      expect(typeof useExportReportMutation).toBe('function');
    });

    it('should export useGetExportStatusQuery hook', async () => {
      const { useGetExportStatusQuery } = await import('./reportsApi');
      expect(useGetExportStatusQuery).toBeDefined();
      expect(typeof useGetExportStatusQuery).toBe('function');
    });

    it('should export useLazyGetExportStatusQuery hook', async () => {
      const { useLazyGetExportStatusQuery } = await import('./reportsApi');
      expect(useLazyGetExportStatusQuery).toBeDefined();
      expect(typeof useLazyGetExportStatusQuery).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should export ReportFormat type', () => {
      const formats: ReportFormat[] = ['pdf', 'csv', 'xlsx', 'html'];
      expect(formats).toHaveLength(4);
      expect(formats).toContain('pdf');
      expect(formats).toContain('csv');
      expect(formats).toContain('xlsx');
      expect(formats).toContain('html');
    });

    it('should export ReportType type', () => {
      const types: ReportType[] = ['summary', 'coverage', 'defects', 'activity'];
      expect(types).toHaveLength(4);
      expect(types).toContain('summary');
      expect(types).toContain('coverage');
      expect(types).toContain('defects');
      expect(types).toContain('activity');
    });

    it('should export DateRange interface', () => {
      const dateRange: DateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      expect(dateRange.startDate).toBe('2024-01-01');
      expect(dateRange.endDate).toBe('2024-01-31');
    });

    it('should export ReportQueryParams interface', () => {
      const params: ReportQueryParams = {
        projectId: 'project-123',
        milestoneId: 'milestone-456',
        testRunId: 'run-789',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.milestoneId).toBe('milestone-456');
      expect(params.testRunId).toBe('run-789');
    });

    it('should export StatusDistribution interface', () => {
      const distribution: StatusDistribution = mockStatusDistribution;
      expect(distribution.passed).toBe(50);
      expect(distribution.failed).toBe(10);
      expect(distribution.blocked).toBe(5);
      expect(distribution.retest).toBe(3);
      expect(distribution.skipped).toBe(2);
      expect(distribution.untested).toBe(30);
    });

    it('should export SummaryReport interface', () => {
      const report: SummaryReport = mockSummaryReport;
      expect(report.projectId).toBe('project-123');
      expect(report.totalTestCases).toBe(100);
      expect(report.passRate).toBe(83.3);
      expect(report.statusDistribution.passed).toBe(50);
    });

    it('should export CoverageMetric interface', () => {
      const metric: CoverageMetric = mockCoverageMetric;
      expect(metric.id).toBe('req-123');
      expect(metric.name).toBe('User Authentication');
      expect(metric.totalCases).toBe(20);
      expect(metric.coveragePercentage).toBe(90);
    });

    it('should export CoverageReport interface', () => {
      const report: CoverageReport = mockCoverageReport;
      expect(report.projectId).toBe('project-123');
      expect(report.overallCoverage).toBe(85.5);
      expect(report.requirementCoverage).toHaveLength(1);
      expect(report.uncoveredRequirements).toHaveLength(1);
    });

    it('should export DefectTrendPoint interface', () => {
      const point: DefectTrendPoint = mockDefectTrendPoint;
      expect(point.date).toBe('2024-01-15');
      expect(point.opened).toBe(5);
      expect(point.closed).toBe(3);
      expect(point.total).toBe(25);
    });

    it('should export DefectSeverity interface', () => {
      const severity: DefectSeverity = mockDefectSeverity;
      expect(severity.critical).toBe(2);
      expect(severity.high).toBe(8);
      expect(severity.medium).toBe(15);
      expect(severity.low).toBe(10);
    });

    it('should export DefectsReport interface', () => {
      const report: DefectsReport = mockDefectsReport;
      expect(report.projectId).toBe('project-123');
      expect(report.totalDefects).toBe(35);
      expect(report.openDefects).toBe(12);
      expect(report.averageResolutionTime).toBe(72.5);
    });

    it('should export ActivityItem interface', () => {
      const item: ActivityItem = mockActivityItem;
      expect(item.id).toBe('activity-123');
      expect(item.type).toBe('test_execution');
      expect(item.userId).toBe('user-456');
      expect(item.userName).toBe('John Doe');
    });

    it('should export ActivityReport interface', () => {
      const report: ActivityReport = mockActivityReport;
      expect(report.projectId).toBe('project-123');
      expect(report.totalActivities).toBe(150);
      expect(report.activitiesByUser).toHaveLength(2);
      expect(report.dailyActivity).toHaveLength(2);
    });

    it('should export GetActivityReportParams interface', () => {
      const params: GetActivityReportParams = {
        projectId: 'project-123',
        page: 1,
        pageSize: 50,
        activityType: 'test_execution',
        userId: 'user-456',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.page).toBe(1);
      expect(params.activityType).toBe('test_execution');
    });

    it('should export ExportReportRequest interface', () => {
      const request: ExportReportRequest = {
        projectId: 'project-123',
        reportType: 'summary',
        format: 'pdf',
        includeCharts: true,
      };
      expect(request.projectId).toBe('project-123');
      expect(request.reportType).toBe('summary');
      expect(request.format).toBe('pdf');
      expect(request.includeCharts).toBe(true);
    });

    it('should export ExportReportResponse interface', () => {
      const response: ExportReportResponse = mockExportResponse;
      expect(response.exportId).toBe('export-123');
      expect(response.status).toBe('completed');
      expect(response.downloadUrl).toBe('https://storage.example.com/reports/export-123.pdf');
    });

    it('should export GetExportStatusParams interface', () => {
      const params: GetExportStatusParams = {
        projectId: 'project-123',
        exportId: 'export-456',
      };
      expect(params.projectId).toBe('project-123');
      expect(params.exportId).toBe('export-456');
    });
  });

  describe('type safety', () => {
    it('should have correct SummaryReport fields in responses', () => {
      expect(mockSummaryReport.projectId).toBe('project-123');
      expect(mockSummaryReport.projectName).toBe('QualityHub');
      expect(mockSummaryReport.totalTestCases).toBe(100);
      expect(mockSummaryReport.totalTestRuns).toBe(15);
      expect(mockSummaryReport.totalExecutions).toBe(500);
      expect(mockSummaryReport.passRate).toBe(83.3);
      expect(mockSummaryReport.averageExecutionTime).toBe(45.5);
    });

    it('should have correct CoverageReport fields in responses', () => {
      expect(mockCoverageReport.projectId).toBe('project-123');
      expect(mockCoverageReport.overallCoverage).toBe(85.5);
      expect(mockCoverageReport.requirementCoverage).toHaveLength(1);
      expect(mockCoverageReport.suiteCoverage).toHaveLength(1);
    });

    it('should have correct DefectsReport fields in responses', () => {
      expect(mockDefectsReport.projectId).toBe('project-123');
      expect(mockDefectsReport.totalDefects).toBe(35);
      expect(mockDefectsReport.openDefects).toBe(12);
      expect(mockDefectsReport.closedDefects).toBe(23);
      expect(mockDefectsReport.defectTrend).toHaveLength(1);
    });

    it('should have correct ActivityReport fields in responses', () => {
      expect(mockActivityReport.projectId).toBe('project-123');
      expect(mockActivityReport.totalActivities).toBe(150);
      expect(mockActivityReport.activitiesByType.test_execution).toBe(80);
      expect(mockActivityReport.activities).toHaveLength(1);
    });

    it('should have correct ExportReportResponse status values', () => {
      const statuses: ExportReportResponse['status'][] = ['pending', 'processing', 'completed', 'failed'];
      statuses.forEach((status) => {
        const response: ExportReportResponse = { exportId: 'test', status };
        expect(['pending', 'processing', 'completed', 'failed']).toContain(response.status);
      });
    });

    it('should have correct ActivityItem type values', () => {
      const types: ActivityItem['type'][] = [
        'test_execution',
        'test_case_created',
        'test_case_updated',
        'test_run_created',
        'test_run_completed',
        'defect_reported',
      ];
      types.forEach((type) => {
        const item: ActivityItem = { ...mockActivityItem, type };
        expect([
          'test_execution',
          'test_case_created',
          'test_case_updated',
          'test_run_created',
          'test_run_completed',
          'defect_reported',
        ]).toContain(item.type);
      });
    });
  });

  describe('endpoint URLs', () => {
    it('getSummaryReport endpoint should target /projects/:projectId/reports/summary', () => {
      expect(reportsApi.endpoints.getSummaryReport).toBeDefined();
    });

    it('getCoverageReport endpoint should target /projects/:projectId/reports/coverage', () => {
      expect(reportsApi.endpoints.getCoverageReport).toBeDefined();
    });

    it('getDefectsReport endpoint should target /projects/:projectId/reports/defects', () => {
      expect(reportsApi.endpoints.getDefectsReport).toBeDefined();
    });

    it('getActivityReport endpoint should target /projects/:projectId/reports/activity', () => {
      expect(reportsApi.endpoints.getActivityReport).toBeDefined();
    });

    it('exportReport endpoint should target /projects/:projectId/reports/export', () => {
      expect(reportsApi.endpoints.exportReport).toBeDefined();
    });

    it('getExportStatus endpoint should target /projects/:projectId/reports/export/:exportId', () => {
      expect(reportsApi.endpoints.getExportStatus).toBeDefined();
    });
  });

  describe('cache tags', () => {
    it('getSummaryReport should provide Report tags', () => {
      const endpoint = reportsApi.endpoints.getSummaryReport;
      expect(endpoint).toBeDefined();
    });

    it('getCoverageReport should provide Report tags', () => {
      const endpoint = reportsApi.endpoints.getCoverageReport;
      expect(endpoint).toBeDefined();
    });

    it('getDefectsReport should provide Report tags', () => {
      const endpoint = reportsApi.endpoints.getDefectsReport;
      expect(endpoint).toBeDefined();
    });

    it('getActivityReport should provide Report tags', () => {
      const endpoint = reportsApi.endpoints.getActivityReport;
      expect(endpoint).toBeDefined();
    });

    it('exportReport should invalidate Report list tags', () => {
      const endpoint = reportsApi.endpoints.exportReport;
      expect(endpoint).toBeDefined();
    });

    it('getExportStatus should provide Report export tags', () => {
      const endpoint = reportsApi.endpoints.getExportStatus;
      expect(endpoint).toBeDefined();
    });
  });

  describe('reducerPath', () => {
    it('should be part of the base API', () => {
      expect(reportsApi.reducerPath).toBe('api');
    });
  });
});
