import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { TestRun, TestRunStatus } from '../test-runs/entities/test-run.entity';
import { TestResult, TestStatus } from '../test-runs/entities/test-result.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Requirement } from '../requirements/entities/requirement.entity';
import { RequirementCoverage } from '../requirements/entities/requirement-coverage.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let testRunRepository: jest.Mocked<Repository<TestRun>>;
  let testCaseRepository: jest.Mocked<Repository<TestCase>>;
  let requirementRepository: jest.Mocked<Repository<Requirement>>;

  const mockTestRunQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockTestResultQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockCoverageQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(TestRun),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockTestRunQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(TestResult),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockTestResultQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(TestCase),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Requirement),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RequirementCoverage),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockCoverageQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    testRunRepository = module.get(getRepositoryToken(TestRun));
    testCaseRepository = module.get(getRepositoryToken(TestCase));
    requirementRepository = module.get(getRepositoryToken(Requirement));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============ Test Execution Widget ============

  describe('getTestExecutionWidget', () => {
    it('should return test execution stats with pass rate and progress', async () => {
      testCaseRepository.count.mockResolvedValue(100);
      testRunRepository.count.mockResolvedValue(2);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '60' },
        { status: TestStatus.FAILED, count: '15' },
        { status: TestStatus.BLOCKED, count: '5' },
        { status: TestStatus.UNTESTED, count: '20' },
      ]);

      const result = await service.getTestExecutionWidget('proj-123');

      expect(result.totalTestCases).toBe(100);
      expect(result.passed).toBe(60);
      expect(result.failed).toBe(15);
      expect(result.blocked).toBe(5);
      expect(result.totalExecuted).toBe(80); // passed + failed + blocked
      expect(result.remaining).toBe(20); // untested
      expect(result.passRate).toBe(75); // 60 / 80
      expect(result.executionProgress).toBe(80); // 80 / 100
    });

    it('should return zeros when no test runs exist', async () => {
      testCaseRepository.count.mockResolvedValue(50);
      testRunRepository.count.mockResolvedValue(0);

      const result = await service.getTestExecutionWidget('proj-123');

      expect(result.totalTestCases).toBe(50);
      expect(result.totalExecuted).toBe(0);
      expect(result.passed).toBe(0);
      expect(result.passRate).toBe(0);
      expect(result.remaining).toBe(50);
    });

    it('should calculate 100% pass rate when all executed tests pass', async () => {
      testCaseRepository.count.mockResolvedValue(50);
      testRunRepository.count.mockResolvedValue(1);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '40' },
        { status: TestStatus.UNTESTED, count: '10' },
      ]);

      const result = await service.getTestExecutionWidget('proj-123');

      expect(result.passRate).toBe(100);
      expect(result.executionProgress).toBe(80);
    });

    it('should handle all test statuses including skipped and retest', async () => {
      testCaseRepository.count.mockResolvedValue(100);
      testRunRepository.count.mockResolvedValue(1);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '30' },
        { status: TestStatus.FAILED, count: '10' },
        { status: TestStatus.BLOCKED, count: '5' },
        { status: TestStatus.SKIPPED, count: '3' },
        { status: TestStatus.RETEST, count: '2' },
        { status: TestStatus.UNTESTED, count: '50' },
      ]);

      const result = await service.getTestExecutionWidget('proj-123');

      expect(result.totalExecuted).toBe(45); // passed + failed + blocked
      expect(result.remaining).toBe(55); // untested + skipped + retest
    });
  });

  // ============ Test Runs Widget ============

  describe('getTestRunsWidget', () => {
    it('should return test runs summary with counts', async () => {
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestRunStatus.COMPLETED, count: '5' },
        { status: TestRunStatus.IN_PROGRESS, count: '2' },
        { status: TestRunStatus.NOT_STARTED, count: '3' },
      ]);
      testRunRepository.find.mockResolvedValue([]);

      const result = await service.getTestRunsWidget('proj-123');

      expect(result.total).toBe(10);
      expect(result.completedCount).toBe(5);
      expect(result.activeCount).toBe(2);
      expect(result.pendingCount).toBe(3);
      expect(result.activeRuns).toEqual([]);
    });

    it('should return active runs with progress', async () => {
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestRunStatus.IN_PROGRESS, count: '1' },
      ]);

      const activeRun: Partial<TestRun> = {
        id: 'run-1',
        name: 'Regression Test',
        status: TestRunStatus.IN_PROGRESS,
        assigneeId: 'user-1',
        startedAt: new Date('2024-01-15'),
      };
      testRunRepository.find.mockResolvedValue([activeRun as TestRun]);

      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { runId: 'run-1', total: '100', executed: '65' },
      ]);

      const result = await service.getTestRunsWidget('proj-123');

      expect(result.activeRuns).toHaveLength(1);
      expect(result.activeRuns[0].id).toBe('run-1');
      expect(result.activeRuns[0].name).toBe('Regression Test');
      expect(result.activeRuns[0].progress).toBe(65);
      expect(result.activeRuns[0].assigneeId).toBe('user-1');
    });

    it('should handle empty test runs', async () => {
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      testRunRepository.find.mockResolvedValue([]);

      const result = await service.getTestRunsWidget('proj-123');

      expect(result.total).toBe(0);
      expect(result.activeCount).toBe(0);
      expect(result.completedCount).toBe(0);
      expect(result.pendingCount).toBe(0);
      expect(result.activeRuns).toEqual([]);
    });
  });

  // ============ Recent Activity Widget ============

  describe('getRecentActivityWidget', () => {
    it('should return today activity and recent executions', async () => {
      // Today's activity
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { status: TestStatus.PASSED, count: '40' },
          { status: TestStatus.FAILED, count: '10' },
        ])
        .mockResolvedValueOnce([
          {
            result_id: 'result-1',
            result_testCaseId: 'case-1',
            testCase_title: 'Login Test',
            result_status: TestStatus.PASSED,
            result_executedBy: 'user-1',
            result_executedAt: new Date('2024-01-15T10:00:00'),
          },
        ]);

      const result = await service.getRecentActivityWidget('proj-123');

      expect(result.testsExecutedToday).toBe(50);
      expect(result.passedToday).toBe(40);
      expect(result.failedToday).toBe(10);
      expect(result.recentExecutions).toHaveLength(1);
      expect(result.recentExecutions[0].testCaseTitle).toBe('Login Test');
    });

    it('should return empty activity when no tests executed', async () => {
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getRecentActivityWidget('proj-123');

      expect(result.testsExecutedToday).toBe(0);
      expect(result.passedToday).toBe(0);
      expect(result.failedToday).toBe(0);
      expect(result.recentExecutions).toEqual([]);
    });
  });

  // ============ Coverage Widget ============

  describe('getCoverageWidget', () => {
    it('should return coverage stats with linked test cases', async () => {
      requirementRepository.find.mockResolvedValue([
        { id: 'req-1' },
        { id: 'req-2' },
        { id: 'req-3' },
      ] as Requirement[]);
      mockCoverageQueryBuilder.getRawOne.mockResolvedValue({
        coveredCount: '2',
        linkedCount: '10',
      });

      const result = await service.getCoverageWidget('proj-123');

      expect(result.totalRequirements).toBe(3);
      expect(result.coveredRequirements).toBe(2);
      expect(result.uncoveredRequirements).toBe(1);
      expect(result.coveragePercentage).toBe(67);
      expect(result.linkedTestCases).toBe(10);
    });

    it('should return zeros when no requirements exist', async () => {
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getCoverageWidget('proj-123');

      expect(result.totalRequirements).toBe(0);
      expect(result.coveredRequirements).toBe(0);
      expect(result.uncoveredRequirements).toBe(0);
      expect(result.coveragePercentage).toBe(0);
      expect(result.linkedTestCases).toBe(0);
    });

    it('should return 100% coverage when all requirements are covered', async () => {
      requirementRepository.find.mockResolvedValue([
        { id: 'req-1' },
        { id: 'req-2' },
      ] as Requirement[]);
      mockCoverageQueryBuilder.getRawOne.mockResolvedValue({
        coveredCount: '2',
        linkedCount: '5',
      });

      const result = await service.getCoverageWidget('proj-123');

      expect(result.coveragePercentage).toBe(100);
      expect(result.uncoveredRequirements).toBe(0);
    });
  });

  // ============ Defects Widget ============

  describe('getDefectsWidget', () => {
    it('should return defects summary with top defects', async () => {
      const resultsWithDefects = [
        { id: 'r1', status: TestStatus.FAILED, defects: ['DEF-1', 'DEF-2'], testCaseId: 'c1' },
        { id: 'r2', status: TestStatus.FAILED, defects: ['DEF-1'], testCaseId: 'c2' },
        { id: 'r3', status: TestStatus.PASSED, defects: ['DEF-3'], testCaseId: 'c1' },
      ] as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(5);

      const result = await service.getDefectsWidget('proj-123');

      expect(result.totalDefects).toBe(3);
      expect(result.totalFailedTests).toBe(5);
      expect(result.failedTestsWithDefects).toBe(2);
      expect(result.failedTestsWithoutDefects).toBe(3);
      expect(result.topDefects).toHaveLength(3);

      const def1 = result.topDefects.find((d) => d.defectId === 'DEF-1');
      expect(def1?.linkedTestResults).toBe(2);
      expect(def1?.affectedTestCases).toBe(2);
    });

    it('should return empty defects when none exist', async () => {
      mockTestResultQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getDefectsWidget('proj-123');

      expect(result.totalDefects).toBe(0);
      expect(result.totalFailedTests).toBe(0);
      expect(result.topDefects).toEqual([]);
    });

    it('should sort defects by linked test results and limit to 5', async () => {
      const resultsWithDefects = [
        { id: 'r1', status: TestStatus.FAILED, defects: ['DEF-A'], testCaseId: 'c1' },
        { id: 'r2', status: TestStatus.FAILED, defects: ['DEF-B'], testCaseId: 'c2' },
        { id: 'r3', status: TestStatus.FAILED, defects: ['DEF-B'], testCaseId: 'c3' },
        { id: 'r4', status: TestStatus.FAILED, defects: ['DEF-B'], testCaseId: 'c4' },
        { id: 'r5', status: TestStatus.FAILED, defects: ['DEF-C'], testCaseId: 'c5' },
        { id: 'r6', status: TestStatus.FAILED, defects: ['DEF-C'], testCaseId: 'c6' },
        { id: 'r7', status: TestStatus.FAILED, defects: ['DEF-D'], testCaseId: 'c7' },
        { id: 'r8', status: TestStatus.FAILED, defects: ['DEF-E'], testCaseId: 'c8' },
        { id: 'r9', status: TestStatus.FAILED, defects: ['DEF-F'], testCaseId: 'c9' },
        { id: 'r10', status: TestStatus.FAILED, defects: ['DEF-G'], testCaseId: 'c10' },
      ] as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(10);

      const result = await service.getDefectsWidget('proj-123');

      expect(result.topDefects).toHaveLength(5);
      expect(result.topDefects[0].defectId).toBe('DEF-B');
      expect(result.topDefects[0].linkedTestResults).toBe(3);
    });

    it('should handle null defects array', async () => {
      const resultsWithDefects = [
        { id: 'r1', status: TestStatus.FAILED, defects: null, testCaseId: 'c1' },
      ] as unknown as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.getDefectsWidget('proj-123');

      expect(result.totalDefects).toBe(0);
      expect(result.topDefects).toEqual([]);
    });
  });

  // ============ Trends Widget ============

  describe('getTrendsWidget', () => {
    it('should return trends with pass rate and execution data', async () => {
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { date: '2024-01-15', status: TestStatus.PASSED, count: '10' },
        { date: '2024-01-15', status: TestStatus.FAILED, count: '2' },
        { date: '2024-01-16', status: TestStatus.PASSED, count: '15' },
        { date: '2024-01-16', status: TestStatus.FAILED, count: '3' },
      ]);

      const result = await service.getTrendsWidget('proj-123', 7);

      expect(result.periodDays).toBe(7);
      expect(result.trendData).toHaveLength(2);
      expect(result.totalTestsExecuted).toBe(30);

      const day1 = result.trendData.find((d) => d.date === '2024-01-15');
      expect(day1?.testsExecuted).toBe(12);
      expect(day1?.passRate).toBe(83); // 10 / 12

      expect(result.averagePassRate).toBe(83);
    });

    it('should return empty trends when no results exist', async () => {
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getTrendsWidget('proj-123');

      expect(result.trendData).toEqual([]);
      expect(result.averagePassRate).toBe(0);
      expect(result.passRateTrend).toBe(0);
      expect(result.totalTestsExecuted).toBe(0);
    });

    it('should calculate positive pass rate trend when improving', async () => {
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { date: '2024-01-15', status: TestStatus.PASSED, count: '5' },
        { date: '2024-01-15', status: TestStatus.FAILED, count: '5' },
        { date: '2024-01-16', status: TestStatus.PASSED, count: '9' },
        { date: '2024-01-16', status: TestStatus.FAILED, count: '1' },
      ]);

      const result = await service.getTrendsWidget('proj-123');

      expect(result.trendData[0].passRate).toBe(50);
      expect(result.trendData[1].passRate).toBe(90);
      expect(result.passRateTrend).toBe(40);
    });

    it('should calculate negative pass rate trend when declining', async () => {
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { date: '2024-01-15', status: TestStatus.PASSED, count: '9' },
        { date: '2024-01-15', status: TestStatus.FAILED, count: '1' },
        { date: '2024-01-16', status: TestStatus.PASSED, count: '5' },
        { date: '2024-01-16', status: TestStatus.FAILED, count: '5' },
      ]);

      const result = await service.getTrendsWidget('proj-123');

      expect(result.passRateTrend).toBe(-40);
    });

    it('should use default period of 7 days', async () => {
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getTrendsWidget('proj-123');

      expect(result.periodDays).toBe(7);
    });
  });

  // ============ Full Dashboard ============

  describe('getProjectDashboard', () => {
    it('should return complete dashboard with all widgets', async () => {
      // Setup mocks for all widget calls
      testCaseRepository.count.mockResolvedValue(100);
      testRunRepository.count.mockResolvedValue(1);
      testRunRepository.find.mockResolvedValue([]);
      requirementRepository.find.mockResolvedValue([{ id: 'req-1' }] as Requirement[]);

      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '50' },
      ]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestRunStatus.COMPLETED, count: '1' },
      ]);
      mockCoverageQueryBuilder.getRawOne.mockResolvedValue({
        coveredCount: '1',
        linkedCount: '5',
      });
      mockTestResultQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getProjectDashboard('proj-123');

      expect(result.projectId).toBe('proj-123');
      expect(result.testExecution).toBeDefined();
      expect(result.testRuns).toBeDefined();
      expect(result.recentActivity).toBeDefined();
      expect(result.coverage).toBeDefined();
      expect(result.defects).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });
});
