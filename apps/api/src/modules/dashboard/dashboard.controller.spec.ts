import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  ProjectDashboardDto,
  TestExecutionWidgetDto,
  TestRunsWidgetDto,
  RecentActivityWidgetDto,
  CoverageWidgetDto,
  DefectsWidgetDto,
  TrendsWidgetDto,
} from './dto';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;

  const mockTestExecutionWidget: TestExecutionWidgetDto = {
    totalTestCases: 100,
    totalExecuted: 80,
    passed: 60,
    failed: 15,
    blocked: 5,
    remaining: 20,
    passRate: 75,
    executionProgress: 80,
  };

  const mockTestRunsWidget: TestRunsWidgetDto = {
    total: 10,
    activeCount: 2,
    completedCount: 5,
    pendingCount: 3,
    activeRuns: [
      {
        id: 'run-1',
        name: 'Regression Test',
        status: 'in_progress',
        progress: 65,
        assigneeId: 'user-1',
        startedAt: new Date('2024-01-15'),
      },
    ],
  };

  const mockRecentActivityWidget: RecentActivityWidgetDto = {
    testsExecutedToday: 50,
    passedToday: 45,
    failedToday: 5,
    recentExecutions: [
      {
        id: 'result-1',
        testCaseId: 'case-1',
        testCaseTitle: 'Login Test',
        status: 'passed',
        executedBy: 'user-1',
        executedAt: new Date('2024-01-15T10:00:00'),
      },
    ],
  };

  const mockCoverageWidget: CoverageWidgetDto = {
    totalRequirements: 25,
    coveredRequirements: 20,
    uncoveredRequirements: 5,
    coveragePercentage: 80,
    linkedTestCases: 100,
  };

  const mockDefectsWidget: DefectsWidgetDto = {
    totalDefects: 15,
    totalFailedTests: 25,
    failedTestsWithDefects: 20,
    failedTestsWithoutDefects: 5,
    topDefects: [
      { defectId: 'DEF-1', linkedTestResults: 5, affectedTestCases: 3 },
    ],
  };

  const mockTrendsWidget: TrendsWidgetDto = {
    periodDays: 7,
    averagePassRate: 82,
    passRateTrend: 5,
    totalTestsExecuted: 350,
    trendData: [
      { date: '2024-01-15', passRate: 80, testsExecuted: 50 },
      { date: '2024-01-16', passRate: 85, testsExecuted: 60 },
    ],
  };

  const mockProjectDashboard: ProjectDashboardDto = {
    projectId: 'proj-123',
    testExecution: mockTestExecutionWidget,
    testRuns: mockTestRunsWidget,
    recentActivity: mockRecentActivityWidget,
    coverage: mockCoverageWidget,
    defects: mockDefectsWidget,
    trends: mockTrendsWidget,
    generatedAt: new Date('2024-01-15T10:30:00'),
  };

  beforeEach(async () => {
    const mockService = {
      getProjectDashboard: jest.fn(),
      getTestExecutionWidget: jest.fn(),
      getTestRunsWidget: jest.fn(),
      getRecentActivityWidget: jest.fn(),
      getCoverageWidget: jest.fn(),
      getDefectsWidget: jest.fn(),
      getTrendsWidget: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return complete project dashboard', async () => {
      service.getProjectDashboard.mockResolvedValue(mockProjectDashboard);

      const result = await controller.getDashboard('proj-123');

      expect(service.getProjectDashboard).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockProjectDashboard);
      expect(result.projectId).toBe('proj-123');
      expect(result.testExecution).toBeDefined();
      expect(result.testRuns).toBeDefined();
      expect(result.recentActivity).toBeDefined();
      expect(result.coverage).toBeDefined();
      expect(result.defects).toBeDefined();
      expect(result.trends).toBeDefined();
    });
  });

  describe('getTestExecutionWidget', () => {
    it('should return test execution widget', async () => {
      service.getTestExecutionWidget.mockResolvedValue(mockTestExecutionWidget);

      const result = await controller.getTestExecutionWidget('proj-123');

      expect(service.getTestExecutionWidget).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockTestExecutionWidget);
      expect(result.totalTestCases).toBe(100);
      expect(result.passRate).toBe(75);
    });
  });

  describe('getTestRunsWidget', () => {
    it('should return test runs widget', async () => {
      service.getTestRunsWidget.mockResolvedValue(mockTestRunsWidget);

      const result = await controller.getTestRunsWidget('proj-123');

      expect(service.getTestRunsWidget).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockTestRunsWidget);
      expect(result.total).toBe(10);
      expect(result.activeRuns).toHaveLength(1);
    });
  });

  describe('getRecentActivityWidget', () => {
    it('should return recent activity widget', async () => {
      service.getRecentActivityWidget.mockResolvedValue(mockRecentActivityWidget);

      const result = await controller.getRecentActivityWidget('proj-123');

      expect(service.getRecentActivityWidget).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockRecentActivityWidget);
      expect(result.testsExecutedToday).toBe(50);
      expect(result.recentExecutions).toHaveLength(1);
    });
  });

  describe('getCoverageWidget', () => {
    it('should return coverage widget', async () => {
      service.getCoverageWidget.mockResolvedValue(mockCoverageWidget);

      const result = await controller.getCoverageWidget('proj-123');

      expect(service.getCoverageWidget).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockCoverageWidget);
      expect(result.coveragePercentage).toBe(80);
    });
  });

  describe('getDefectsWidget', () => {
    it('should return defects widget', async () => {
      service.getDefectsWidget.mockResolvedValue(mockDefectsWidget);

      const result = await controller.getDefectsWidget('proj-123');

      expect(service.getDefectsWidget).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockDefectsWidget);
      expect(result.totalDefects).toBe(15);
      expect(result.topDefects).toHaveLength(1);
    });
  });

  describe('getTrendsWidget', () => {
    it('should return trends widget with default period', async () => {
      service.getTrendsWidget.mockResolvedValue(mockTrendsWidget);

      const result = await controller.getTrendsWidget('proj-123');

      expect(service.getTrendsWidget).toHaveBeenCalledWith('proj-123', 7);
      expect(result).toEqual(mockTrendsWidget);
      expect(result.periodDays).toBe(7);
    });

    it('should return trends widget with custom period', async () => {
      const customTrendsWidget = { ...mockTrendsWidget, periodDays: 14 };
      service.getTrendsWidget.mockResolvedValue(customTrendsWidget);

      const result = await controller.getTrendsWidget('proj-123', '14');

      expect(service.getTrendsWidget).toHaveBeenCalledWith('proj-123', 14);
      expect(result.periodDays).toBe(14);
    });

    it('should parse string period days to number', async () => {
      service.getTrendsWidget.mockResolvedValue(mockTrendsWidget);

      await controller.getTrendsWidget('proj-123', '30');

      expect(service.getTrendsWidget).toHaveBeenCalledWith('proj-123', 30);
    });
  });
});
