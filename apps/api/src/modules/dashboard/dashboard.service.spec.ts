import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { TestRun, TestRunStatus } from '../test-runs/entities/test-run.entity';
import { TestResult, TestStatus } from '../test-runs/entities/test-result.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Requirement } from '../requirements/entities/requirement.entity';
import { RequirementCoverage } from '../requirements/entities/requirement-coverage.entity';
import { Milestone } from '../milestones/entities/milestone.entity';
import { User } from '../users/entities/user.entity';
import { TodoItemType, TodoPriority } from './dto';

describe('DashboardService', () => {
  let service: DashboardService;
  let testRunRepository: jest.Mocked<Repository<TestRun>>;
  let testCaseRepository: jest.Mocked<Repository<TestCase>>;
  let requirementRepository: jest.Mocked<Repository<Requirement>>;

  const mockTestRunQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
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

  const mockMilestoneQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
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
        {
          provide: getRepositoryToken(Milestone),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockMilestoneQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

  // ============ Stats Method ============

  describe('getStats', () => {
    it('should return aggregated statistics from all widgets', async () => {
      // Mock test execution widget dependencies
      testCaseRepository.count.mockResolvedValue(100);
      testRunRepository.count.mockResolvedValue(5);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '60' },
        { status: TestStatus.FAILED, count: '15' },
        { status: TestStatus.BLOCKED, count: '5' },
        { status: TestStatus.UNTESTED, count: '20' },
      ]);

      // Mock test runs widget dependencies
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestRunStatus.COMPLETED, count: '3' },
        { status: TestRunStatus.IN_PROGRESS, count: '2' },
      ]);
      testRunRepository.find.mockResolvedValue([]);

      // Mock coverage widget dependencies
      requirementRepository.find.mockResolvedValue([
        { id: 'req-1' },
        { id: 'req-2' },
        { id: 'req-3' },
        { id: 'req-4' },
      ] as Requirement[]);
      mockCoverageQueryBuilder.getRawOne.mockResolvedValue({
        coveredCount: '3',
        linkedCount: '10',
      });

      // Mock defects widget dependencies
      mockTestResultQueryBuilder.getMany.mockResolvedValue([
        { id: 'r1', status: TestStatus.FAILED, defects: ['DEF-1'], testCaseId: 'c1' },
        { id: 'r2', status: TestStatus.FAILED, defects: ['DEF-2'], testCaseId: 'c2' },
      ] as TestResult[]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(15);

      const result = await service.getStats('proj-123');

      expect(result.totalTestCases).toBe(100);
      expect(result.totalExecuted).toBe(80);
      expect(result.passed).toBe(60);
      expect(result.failed).toBe(15);
      expect(result.blocked).toBe(5);
      expect(result.remaining).toBe(20);
      expect(result.passRate).toBe(75);
      expect(result.executionProgress).toBe(80);
      expect(result.totalTestRuns).toBe(5);
      expect(result.activeTestRuns).toBe(2);
      expect(result.completedTestRuns).toBe(3);
      expect(result.totalRequirements).toBe(4);
      expect(result.coveragePercentage).toBe(75);
      expect(result.totalDefects).toBe(2);
      expect(result.failedTestsWithDefects).toBe(2);
    });

    it('should return zeros when no data exists', async () => {
      testCaseRepository.count.mockResolvedValue(0);
      testRunRepository.count.mockResolvedValue(0);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      testRunRepository.find.mockResolvedValue([]);
      requirementRepository.find.mockResolvedValue([]);
      mockTestResultQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getStats('proj-123');

      expect(result.totalTestCases).toBe(0);
      expect(result.totalExecuted).toBe(0);
      expect(result.passRate).toBe(0);
      expect(result.totalTestRuns).toBe(0);
      expect(result.totalRequirements).toBe(0);
      expect(result.totalDefects).toBe(0);
    });
  });

  // ============ Activity Method ============

  describe('getActivity', () => {
    it('should return activity with today stats and recent items', async () => {
      // Mock today's test results
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { status: TestStatus.PASSED, count: '30' },
          { status: TestStatus.FAILED, count: '5' },
        ])
        .mockResolvedValueOnce([
          {
            result_id: 'result-1',
            result_testCaseId: 'case-1',
            testCase_title: 'Login Test',
            result_status: TestStatus.PASSED,
            result_executedBy: 'user-1',
            result_executedAt: new Date('2024-01-15T10:00:00'),
            testRun_id: 'run-1',
          },
        ]);

      // Mock user lookup
      mockUserRepository.find.mockResolvedValue([
        { id: 'user-1', name: 'John Doe' },
      ]);

      // Mock recent test runs
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        {
          run_id: 'run-1',
          run_name: 'Regression Suite',
          run_status: TestRunStatus.IN_PROGRESS,
          run_assigneeId: 'user-1',
          run_startedAt: new Date('2024-01-15T09:00:00'),
          run_completedAt: null,
        },
      ]);

      // Mock recent milestones
      mockMilestoneQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getActivity('proj-123', 20);

      expect(result.testsExecutedToday).toBe(35);
      expect(result.passedToday).toBe(30);
      expect(result.failedToday).toBe(5);
      expect(result.recentActivity.length).toBeGreaterThan(0);

      const testExecution = result.recentActivity.find((a) => a.type === 'test_execution');
      expect(testExecution).toBeDefined();
      expect(testExecution?.title).toBe('Login Test');
      expect(testExecution?.userName).toBe('John Doe');
    });

    it('should return empty activity when no data exists', async () => {
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      mockMilestoneQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getActivity('proj-123');

      expect(result.totalToday).toBe(0);
      expect(result.testsExecutedToday).toBe(0);
      expect(result.passedToday).toBe(0);
      expect(result.failedToday).toBe(0);
      expect(result.recentActivity).toEqual([]);
    });

    it('should include milestone completions in activity', async () => {
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      mockMilestoneQueryBuilder.getRawMany.mockResolvedValue([
        {
          milestone_id: 'milestone-1',
          milestone_name: 'Release 1.0',
          milestone_updatedAt: new Date('2024-01-15T12:00:00'),
        },
      ]);

      const result = await service.getActivity('proj-123');

      const milestoneActivity = result.recentActivity.find((a) => a.type === 'milestone_completed');
      expect(milestoneActivity).toBeDefined();
      expect(milestoneActivity?.title).toBe('Release 1.0');
    });

    it('should respect the limit parameter', async () => {
      const executions = Array.from({ length: 30 }, (_, i) => ({
        result_id: `result-${i}`,
        result_testCaseId: `case-${i}`,
        testCase_title: `Test ${i}`,
        result_status: TestStatus.PASSED,
        result_executedBy: 'user-1',
        result_executedAt: new Date(Date.now() - i * 60000),
        testRun_id: 'run-1',
      }));

      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(executions);
      mockUserRepository.find.mockResolvedValue([]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      mockMilestoneQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getActivity('proj-123', 10);

      expect(result.recentActivity.length).toBeLessThanOrEqual(10);
    });
  });

  // ============ Todo Method ============

  describe('getTodo', () => {
    it('should return assigned test runs as todo items', async () => {
      const assignedRuns: Partial<TestRun>[] = [
        {
          id: 'run-1',
          name: 'Regression Test',
          status: TestRunStatus.IN_PROGRESS,
          startedAt: new Date('2024-01-15'),
        },
      ];

      mockTestRunQueryBuilder.getRawMany = undefined;
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(assignedRuns),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { runId: 'run-1', total: '50', executed: '25' },
      ]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      mockMilestoneQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getTodo('proj-123');

      expect(result.items.length).toBeGreaterThan(0);
      const runTodo = result.items.find((i) => i.type === TodoItemType.ASSIGNED_TEST_RUN);
      expect(runTodo).toBeDefined();
      expect(runTodo?.title).toBe('Regression Test');
      expect(runTodo?.progress).toBe(50);
      expect(runTodo?.remainingCount).toBe(25);
      expect(runTodo?.priority).toBe(TodoPriority.HIGH);
    });

    it('should return overdue milestones with critical priority', async () => {
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockMilestoneQueryBuilder.getMany
        .mockResolvedValueOnce([
          {
            id: 'milestone-1',
            name: 'Overdue Release',
            dueDate: yesterday,
          },
        ])
        .mockResolvedValueOnce([]);

      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getTodo('proj-123');

      const overdueMilestone = result.items.find((i) => i.type === TodoItemType.OVERDUE_MILESTONE);
      expect(overdueMilestone).toBeDefined();
      expect(overdueMilestone?.priority).toBe(TodoPriority.CRITICAL);
      expect(result.urgentCount).toBeGreaterThan(0);
    });

    it('should return upcoming milestones with appropriate priority', async () => {
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);

      mockMilestoneQueryBuilder.getMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'milestone-2',
            name: 'Upcoming Release',
            dueDate: inTwoDays,
          },
        ]);

      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getTodo('proj-123');

      const upcomingMilestone = result.items.find((i) => i.type === TodoItemType.UPCOMING_MILESTONE);
      expect(upcomingMilestone).toBeDefined();
      expect(upcomingMilestone?.priority).toBe(TodoPriority.HIGH);
    });

    it('should return blocked tests as todo items', async () => {
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      mockMilestoneQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount
        .mockResolvedValueOnce(5) // blocked tests
        .mockResolvedValueOnce(0); // failed tests without defects

      const result = await service.getTodo('proj-123');

      const blockedTodo = result.items.find((i) => i.type === TodoItemType.BLOCKED_TEST);
      expect(blockedTodo).toBeDefined();
      expect(blockedTodo?.remainingCount).toBe(5);
      expect(blockedTodo?.priority).toBe(TodoPriority.HIGH);
    });

    it('should return failed tests needing review as todo items', async () => {
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      mockMilestoneQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount
        .mockResolvedValueOnce(0) // blocked tests
        .mockResolvedValueOnce(8); // failed tests without defects

      const result = await service.getTodo('proj-123');

      const reviewTodo = result.items.find((i) => i.type === TodoItemType.FAILED_TEST_REVIEW);
      expect(reviewTodo).toBeDefined();
      expect(reviewTodo?.remainingCount).toBe(8);
      expect(reviewTodo?.priority).toBe(TodoPriority.MEDIUM);
    });

    it('should return empty todo list when no items exist', async () => {
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      mockMilestoneQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getTodo('proj-123');

      expect(result.totalItems).toBe(0);
      expect(result.urgentCount).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should sort todo items by priority and due date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'run-1',
            name: 'Medium Priority Run',
            status: TestRunStatus.NOT_STARTED,
            startedAt: null,
          },
        ]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { runId: 'run-1', total: '10', executed: '0' },
      ]);

      mockMilestoneQueryBuilder.getMany
        .mockResolvedValueOnce([
          { id: 'milestone-overdue', name: 'Overdue', dueDate: yesterday },
        ])
        .mockResolvedValueOnce([
          { id: 'milestone-upcoming', name: 'Upcoming', dueDate: tomorrow },
        ]);

      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getTodo('proj-123');

      // Critical items should come first
      expect(result.items[0].priority).toBe(TodoPriority.CRITICAL);
    });

    it('should filter todo items by userId when provided', async () => {
      const mockTodoRunQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      testRunRepository.createQueryBuilder = jest.fn().mockReturnValue(mockTodoRunQueryBuilder);

      mockMilestoneQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      await service.getTodo('proj-123', 'user-123');

      // Verify andWhere was called with userId filter
      expect(mockTodoRunQueryBuilder.andWhere).toHaveBeenCalledWith(
        'run.assignee_id = :userId',
        { userId: 'user-123' }
      );
    });
  });
});
