import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import {
  ProjectSummaryDto,
  CoverageReportDto,
  DefectsReportDto,
  ActivityReportDto,
} from './dto';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: jest.Mocked<ReportsService>;

  const mockProjectSummary: ProjectSummaryDto = {
    projectId: 'proj-123',
    testExecution: {
      totalTestCases: 100,
      totalTestResults: 80,
      passed: 60,
      failed: 10,
      blocked: 5,
      skipped: 3,
      retest: 2,
      untested: 0,
      passRate: 75,
      executionProgress: 100,
    },
    testRuns: {
      total: 10,
      notStarted: 2,
      inProgress: 3,
      completed: 4,
      aborted: 1,
    },
    requirementCoverage: {
      totalRequirements: 20,
      coveredRequirements: 15,
      uncoveredRequirements: 5,
      coveragePercentage: 75,
    },
    generatedAt: new Date('2024-01-15T10:00:00.000Z'),
  };

  const mockCoverageReport: CoverageReportDto = {
    projectId: 'proj-123',
    totalRequirements: 3,
    coveredRequirements: 2,
    uncoveredRequirements: 1,
    coveragePercentage: 67,
    requirements: [
      {
        requirementId: 'req-1',
        externalId: 'JIRA-1',
        title: 'Req 1',
        status: 'approved',
        linkedTestCases: 3,
        isCovered: true,
      },
      {
        requirementId: 'req-2',
        externalId: 'JIRA-2',
        title: 'Req 2',
        status: 'draft',
        linkedTestCases: 1,
        isCovered: true,
      },
      {
        requirementId: 'req-3',
        externalId: null,
        title: 'Req 3',
        status: 'draft',
        linkedTestCases: 0,
        isCovered: false,
      },
    ],
    generatedAt: new Date('2024-01-15T10:00:00.000Z'),
  };

  const mockDefectsReport: DefectsReportDto = {
    projectId: 'proj-123',
    totalDefects: 5,
    totalFailedTests: 15,
    failedTestsWithDefects: 10,
    failedTestsWithoutDefects: 5,
    defects: [
      { defectId: 'DEF-1', linkedTestResults: 4, affectedTestCases: 3 },
      { defectId: 'DEF-2', linkedTestResults: 3, affectedTestCases: 2 },
      { defectId: 'DEF-3', linkedTestResults: 2, affectedTestCases: 1 },
    ],
    generatedAt: new Date('2024-01-15T10:00:00.000Z'),
  };

  const mockActivityReport: ActivityReportDto = {
    projectId: 'proj-123',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    totalTestsExecuted: 250,
    dailyActivity: [
      { date: '2024-01-15', testsExecuted: 25, passed: 20, failed: 5 },
      { date: '2024-01-16', testsExecuted: 30, passed: 25, failed: 5 },
    ],
    testerActivity: [
      { userId: 'user-1', testsExecuted: 100, passed: 80, failed: 20, passRate: 80 },
      { userId: 'user-2', testsExecuted: 50, passed: 45, failed: 5, passRate: 90 },
    ],
    generatedAt: new Date('2024-01-15T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getProjectSummary: jest.fn(),
            getCoverageReport: jest.fn(),
            getDefectsReport: jest.fn(),
            getActivityReport: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============ Summary Endpoint ============

  describe('getSummary', () => {
    it('should return project summary', async () => {
      service.getProjectSummary.mockResolvedValue(mockProjectSummary);

      const result = await controller.getSummary('proj-123');

      expect(service.getProjectSummary).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockProjectSummary);
    });

    it('should return summary with test execution metrics', async () => {
      service.getProjectSummary.mockResolvedValue(mockProjectSummary);

      const result = await controller.getSummary('proj-123');

      expect(result.testExecution.totalTestCases).toBe(100);
      expect(result.testExecution.passed).toBe(60);
      expect(result.testExecution.failed).toBe(10);
      expect(result.testExecution.passRate).toBe(75);
    });

    it('should return summary with test run metrics', async () => {
      service.getProjectSummary.mockResolvedValue(mockProjectSummary);

      const result = await controller.getSummary('proj-123');

      expect(result.testRuns.total).toBe(10);
      expect(result.testRuns.completed).toBe(4);
      expect(result.testRuns.inProgress).toBe(3);
    });

    it('should return summary with requirement coverage metrics', async () => {
      service.getProjectSummary.mockResolvedValue(mockProjectSummary);

      const result = await controller.getSummary('proj-123');

      expect(result.requirementCoverage.totalRequirements).toBe(20);
      expect(result.requirementCoverage.coveragePercentage).toBe(75);
    });

    it('should return empty metrics for project with no data', async () => {
      const emptyProjectSummary: ProjectSummaryDto = {
        projectId: 'proj-123',
        testExecution: {
          totalTestCases: 0,
          totalTestResults: 0,
          passed: 0,
          failed: 0,
          blocked: 0,
          skipped: 0,
          retest: 0,
          untested: 0,
          passRate: 0,
          executionProgress: 0,
        },
        testRuns: {
          total: 0,
          notStarted: 0,
          inProgress: 0,
          completed: 0,
          aborted: 0,
        },
        requirementCoverage: {
          totalRequirements: 0,
          coveredRequirements: 0,
          uncoveredRequirements: 0,
          coveragePercentage: 0,
        },
        generatedAt: new Date(),
      };
      service.getProjectSummary.mockResolvedValue(emptyProjectSummary);

      const result = await controller.getSummary('proj-123');

      expect(result.testExecution.totalTestCases).toBe(0);
      expect(result.testRuns.total).toBe(0);
      expect(result.requirementCoverage.totalRequirements).toBe(0);
    });
  });

  // ============ Coverage Endpoint ============

  describe('getCoverage', () => {
    it('should return coverage report', async () => {
      service.getCoverageReport.mockResolvedValue(mockCoverageReport);

      const result = await controller.getCoverage('proj-123');

      expect(service.getCoverageReport).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockCoverageReport);
    });

    it('should return coverage statistics', async () => {
      service.getCoverageReport.mockResolvedValue(mockCoverageReport);

      const result = await controller.getCoverage('proj-123');

      expect(result.totalRequirements).toBe(3);
      expect(result.coveredRequirements).toBe(2);
      expect(result.uncoveredRequirements).toBe(1);
      expect(result.coveragePercentage).toBe(67);
    });

    it('should return detailed requirement coverage', async () => {
      service.getCoverageReport.mockResolvedValue(mockCoverageReport);

      const result = await controller.getCoverage('proj-123');

      expect(result.requirements).toHaveLength(3);
      expect(result.requirements[0].requirementId).toBe('req-1');
      expect(result.requirements[0].isCovered).toBe(true);
      expect(result.requirements[2].isCovered).toBe(false);
    });

    it('should return empty coverage report when no requirements', async () => {
      const emptyCoverageReport: CoverageReportDto = {
        projectId: 'proj-123',
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
        requirements: [],
        generatedAt: new Date(),
      };
      service.getCoverageReport.mockResolvedValue(emptyCoverageReport);

      const result = await controller.getCoverage('proj-123');

      expect(result.requirements).toEqual([]);
      expect(result.coveragePercentage).toBe(0);
    });

    it('should return 100% coverage when all requirements covered', async () => {
      const fullCoverageReport: CoverageReportDto = {
        ...mockCoverageReport,
        coveredRequirements: 3,
        uncoveredRequirements: 0,
        coveragePercentage: 100,
        requirements: mockCoverageReport.requirements.map((r) => ({ ...r, isCovered: true })),
      };
      service.getCoverageReport.mockResolvedValue(fullCoverageReport);

      const result = await controller.getCoverage('proj-123');

      expect(result.coveragePercentage).toBe(100);
      expect(result.uncoveredRequirements).toBe(0);
    });
  });

  // ============ Defects Endpoint ============

  describe('getDefects', () => {
    it('should return defects report', async () => {
      service.getDefectsReport.mockResolvedValue(mockDefectsReport);

      const result = await controller.getDefects('proj-123');

      expect(service.getDefectsReport).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockDefectsReport);
    });

    it('should return defect statistics', async () => {
      service.getDefectsReport.mockResolvedValue(mockDefectsReport);

      const result = await controller.getDefects('proj-123');

      expect(result.totalDefects).toBe(5);
      expect(result.totalFailedTests).toBe(15);
      expect(result.failedTestsWithDefects).toBe(10);
      expect(result.failedTestsWithoutDefects).toBe(5);
    });

    it('should return detailed defect breakdown', async () => {
      service.getDefectsReport.mockResolvedValue(mockDefectsReport);

      const result = await controller.getDefects('proj-123');

      expect(result.defects).toHaveLength(3);
      expect(result.defects[0].defectId).toBe('DEF-1');
      expect(result.defects[0].linkedTestResults).toBe(4);
      expect(result.defects[0].affectedTestCases).toBe(3);
    });

    it('should return empty defects report when no defects', async () => {
      const emptyDefectsReport: DefectsReportDto = {
        projectId: 'proj-123',
        totalDefects: 0,
        totalFailedTests: 0,
        failedTestsWithDefects: 0,
        failedTestsWithoutDefects: 0,
        defects: [],
        generatedAt: new Date(),
      };
      service.getDefectsReport.mockResolvedValue(emptyDefectsReport);

      const result = await controller.getDefects('proj-123');

      expect(result.defects).toEqual([]);
      expect(result.totalDefects).toBe(0);
    });
  });

  // ============ Activity Endpoint ============

  describe('getActivity', () => {
    it('should return activity report', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      const result = await controller.getActivity('proj-123');

      expect(service.getActivityReport).toHaveBeenCalledWith('proj-123', undefined, undefined);
      expect(result).toEqual(mockActivityReport);
    });

    it('should pass date parameters to service', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      await controller.getActivity('proj-123', '2024-01-01', '2024-01-31');

      expect(service.getActivityReport).toHaveBeenCalledWith(
        'proj-123',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );
    });

    it('should return activity statistics', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      const result = await controller.getActivity('proj-123');

      expect(result.totalTestsExecuted).toBe(250);
      expect(result.periodStart).toBe('2024-01-01');
      expect(result.periodEnd).toBe('2024-01-31');
    });

    it('should return daily activity breakdown', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      const result = await controller.getActivity('proj-123');

      expect(result.dailyActivity).toHaveLength(2);
      expect(result.dailyActivity[0].date).toBe('2024-01-15');
      expect(result.dailyActivity[0].testsExecuted).toBe(25);
      expect(result.dailyActivity[0].passed).toBe(20);
      expect(result.dailyActivity[0].failed).toBe(5);
    });

    it('should return tester activity breakdown', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      const result = await controller.getActivity('proj-123');

      expect(result.testerActivity).toHaveLength(2);
      expect(result.testerActivity[0].userId).toBe('user-1');
      expect(result.testerActivity[0].testsExecuted).toBe(100);
      expect(result.testerActivity[0].passRate).toBe(80);
    });

    it('should return empty activity report when no activity', async () => {
      const emptyActivityReport: ActivityReportDto = {
        projectId: 'proj-123',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        totalTestsExecuted: 0,
        dailyActivity: [],
        testerActivity: [],
        generatedAt: new Date(),
      };
      service.getActivityReport.mockResolvedValue(emptyActivityReport);

      const result = await controller.getActivity('proj-123');

      expect(result.totalTestsExecuted).toBe(0);
      expect(result.dailyActivity).toEqual([]);
      expect(result.testerActivity).toEqual([]);
    });

    it('should handle only startDate parameter', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      await controller.getActivity('proj-123', '2024-01-01', undefined);

      expect(service.getActivityReport).toHaveBeenCalledWith(
        'proj-123',
        new Date('2024-01-01'),
        undefined,
      );
    });

    it('should handle only endDate parameter', async () => {
      service.getActivityReport.mockResolvedValue(mockActivityReport);

      await controller.getActivity('proj-123', undefined, '2024-01-31');

      expect(service.getActivityReport).toHaveBeenCalledWith(
        'proj-123',
        undefined,
        new Date('2024-01-31'),
      );
    });
  });
});
