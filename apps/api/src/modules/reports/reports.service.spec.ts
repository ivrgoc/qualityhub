import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { TestRun, TestRunStatus } from '../test-runs/entities/test-run.entity';
import { TestResult, TestStatus } from '../test-runs/entities/test-result.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Requirement, RequirementStatus } from '../requirements/entities/requirement.entity';
import { RequirementCoverage } from '../requirements/entities/requirement-coverage.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let testRunRepository: jest.Mocked<Repository<TestRun>>;
  let testResultRepository: jest.Mocked<Repository<TestResult>>;
  let testCaseRepository: jest.Mocked<Repository<TestCase>>;
  let requirementRepository: jest.Mocked<Repository<Requirement>>;
  let coverageRepository: jest.Mocked<Repository<RequirementCoverage>>;

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
    clone: jest.fn().mockReturnThis(),
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
        ReportsService,
        {
          provide: getRepositoryToken(TestRun),
          useValue: {
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

    service = module.get<ReportsService>(ReportsService);
    testRunRepository = module.get(getRepositoryToken(TestRun));
    testResultRepository = module.get(getRepositoryToken(TestResult));
    testCaseRepository = module.get(getRepositoryToken(TestCase));
    requirementRepository = module.get(getRepositoryToken(Requirement));
    coverageRepository = module.get(getRepositoryToken(RequirementCoverage));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============ Project Summary ============

  describe('getProjectSummary', () => {
    it('should return project summary with all metrics', async () => {
      // Setup test case count
      testCaseRepository.count.mockResolvedValue(100);

      // Setup test run find
      testRunRepository.find.mockResolvedValue([{ id: 'run-1' }, { id: 'run-2' }] as TestRun[]);

      // Setup test result aggregation
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '60' },
        { status: TestStatus.FAILED, count: '15' },
        { status: TestStatus.BLOCKED, count: '5' },
        { status: TestStatus.UNTESTED, count: '20' },
      ]);

      // Setup test run status aggregation
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestRunStatus.COMPLETED, count: '5' },
        { status: TestRunStatus.IN_PROGRESS, count: '2' },
        { status: TestRunStatus.NOT_STARTED, count: '1' },
      ]);

      // Setup requirement coverage
      requirementRepository.find.mockResolvedValue([
        { id: 'req-1' },
        { id: 'req-2' },
        { id: 'req-3' },
      ] as Requirement[]);
      mockCoverageQueryBuilder.getRawOne.mockResolvedValue({ count: '2' });

      const result = await service.getProjectSummary('proj-123');

      expect(result.projectId).toBe('proj-123');
      expect(result.testExecution.totalTestCases).toBe(100);
      expect(result.testExecution.passed).toBe(60);
      expect(result.testExecution.failed).toBe(15);
      expect(result.testExecution.blocked).toBe(5);
      expect(result.testExecution.untested).toBe(20);
      expect(result.testExecution.passRate).toBe(75); // 60 / 80 executed
      expect(result.testExecution.executionProgress).toBe(80); // 80 / 100

      expect(result.testRuns.total).toBe(8);
      expect(result.testRuns.completed).toBe(5);
      expect(result.testRuns.inProgress).toBe(2);
      expect(result.testRuns.notStarted).toBe(1);

      expect(result.requirementCoverage.totalRequirements).toBe(3);
      expect(result.requirementCoverage.coveredRequirements).toBe(2);
      expect(result.requirementCoverage.uncoveredRequirements).toBe(1);
      expect(result.requirementCoverage.coveragePercentage).toBe(67);

      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should return zeros when no test runs exist', async () => {
      testCaseRepository.count.mockResolvedValue(50);
      testRunRepository.find.mockResolvedValue([]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getProjectSummary('proj-123');

      expect(result.testExecution.totalTestCases).toBe(50);
      expect(result.testExecution.totalTestResults).toBe(0);
      expect(result.testExecution.passed).toBe(0);
      expect(result.testExecution.passRate).toBe(0);
      expect(result.testRuns.total).toBe(0);
      expect(result.requirementCoverage.totalRequirements).toBe(0);
    });

    it('should handle all test statuses', async () => {
      testCaseRepository.count.mockResolvedValue(100);
      testRunRepository.find.mockResolvedValue([{ id: 'run-1' }] as TestRun[]);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '30' },
        { status: TestStatus.FAILED, count: '10' },
        { status: TestStatus.BLOCKED, count: '5' },
        { status: TestStatus.SKIPPED, count: '3' },
        { status: TestStatus.RETEST, count: '2' },
        { status: TestStatus.UNTESTED, count: '50' },
      ]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getProjectSummary('proj-123');

      expect(result.testExecution.passed).toBe(30);
      expect(result.testExecution.failed).toBe(10);
      expect(result.testExecution.blocked).toBe(5);
      expect(result.testExecution.skipped).toBe(3);
      expect(result.testExecution.retest).toBe(2);
      expect(result.testExecution.untested).toBe(50);
      expect(result.testExecution.totalTestResults).toBe(100);
    });

    it('should handle all test run statuses', async () => {
      testCaseRepository.count.mockResolvedValue(0);
      testRunRepository.find.mockResolvedValue([]);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestRunStatus.NOT_STARTED, count: '2' },
        { status: TestRunStatus.IN_PROGRESS, count: '3' },
        { status: TestRunStatus.COMPLETED, count: '4' },
        { status: TestRunStatus.ABORTED, count: '1' },
      ]);
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getProjectSummary('proj-123');

      expect(result.testRuns.notStarted).toBe(2);
      expect(result.testRuns.inProgress).toBe(3);
      expect(result.testRuns.completed).toBe(4);
      expect(result.testRuns.aborted).toBe(1);
      expect(result.testRuns.total).toBe(10);
    });

    it('should calculate 100% pass rate when all executed tests pass', async () => {
      testCaseRepository.count.mockResolvedValue(50);
      testRunRepository.find.mockResolvedValue([{ id: 'run-1' }] as TestRun[]);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '40' },
        { status: TestStatus.UNTESTED, count: '10' },
      ]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getProjectSummary('proj-123');

      expect(result.testExecution.passRate).toBe(100);
      expect(result.testExecution.executionProgress).toBe(80);
    });

    it('should calculate 0% pass rate when no tests pass', async () => {
      testCaseRepository.count.mockResolvedValue(50);
      testRunRepository.find.mockResolvedValue([{ id: 'run-1' }] as TestRun[]);
      mockTestResultQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.FAILED, count: '30' },
        { status: TestStatus.UNTESTED, count: '20' },
      ]);
      mockTestRunQueryBuilder.getRawMany.mockResolvedValue([]);
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getProjectSummary('proj-123');

      expect(result.testExecution.passRate).toBe(0);
    });
  });

  // ============ Coverage Report ============

  describe('getCoverageReport', () => {
    it('should return detailed coverage report', async () => {
      const requirements = [
        { id: 'req-1', externalId: 'JIRA-1', title: 'Req 1', status: RequirementStatus.APPROVED },
        { id: 'req-2', externalId: 'JIRA-2', title: 'Req 2', status: RequirementStatus.DRAFT },
        { id: 'req-3', externalId: null, title: 'Req 3', status: RequirementStatus.DRAFT },
      ] as Requirement[];
      requirementRepository.find.mockResolvedValue(requirements);
      mockCoverageQueryBuilder.getRawMany.mockResolvedValue([
        { requirementId: 'req-1', count: '3' },
        { requirementId: 'req-2', count: '1' },
      ]);

      const result = await service.getCoverageReport('proj-123');

      expect(result.projectId).toBe('proj-123');
      expect(result.totalRequirements).toBe(3);
      expect(result.coveredRequirements).toBe(2);
      expect(result.uncoveredRequirements).toBe(1);
      expect(result.coveragePercentage).toBe(67);
      expect(result.requirements).toHaveLength(3);

      const req1 = result.requirements.find((r) => r.requirementId === 'req-1');
      expect(req1?.linkedTestCases).toBe(3);
      expect(req1?.isCovered).toBe(true);
      expect(req1?.externalId).toBe('JIRA-1');

      const req3 = result.requirements.find((r) => r.requirementId === 'req-3');
      expect(req3?.linkedTestCases).toBe(0);
      expect(req3?.isCovered).toBe(false);
      expect(req3?.externalId).toBeNull();

      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should return empty report when no requirements exist', async () => {
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getCoverageReport('proj-123');

      expect(result.totalRequirements).toBe(0);
      expect(result.coveredRequirements).toBe(0);
      expect(result.uncoveredRequirements).toBe(0);
      expect(result.coveragePercentage).toBe(0);
      expect(result.requirements).toEqual([]);
    });

    it('should return 100% coverage when all requirements are covered', async () => {
      const requirements = [
        { id: 'req-1', externalId: 'JIRA-1', title: 'Req 1', status: RequirementStatus.APPROVED },
        { id: 'req-2', externalId: 'JIRA-2', title: 'Req 2', status: RequirementStatus.APPROVED },
      ] as Requirement[];
      requirementRepository.find.mockResolvedValue(requirements);
      mockCoverageQueryBuilder.getRawMany.mockResolvedValue([
        { requirementId: 'req-1', count: '2' },
        { requirementId: 'req-2', count: '1' },
      ]);

      const result = await service.getCoverageReport('proj-123');

      expect(result.coveragePercentage).toBe(100);
      expect(result.uncoveredRequirements).toBe(0);
      expect(result.requirements.every((r) => r.isCovered)).toBe(true);
    });

    it('should return 0% coverage when no requirements are covered', async () => {
      const requirements = [
        { id: 'req-1', externalId: null, title: 'Req 1', status: RequirementStatus.DRAFT },
        { id: 'req-2', externalId: null, title: 'Req 2', status: RequirementStatus.DRAFT },
      ] as Requirement[];
      requirementRepository.find.mockResolvedValue(requirements);
      mockCoverageQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getCoverageReport('proj-123');

      expect(result.coveragePercentage).toBe(0);
      expect(result.coveredRequirements).toBe(0);
      expect(result.requirements.every((r) => !r.isCovered)).toBe(true);
    });
  });

  // ============ Defects Report ============

  describe('getDefectsReport', () => {
    it('should return defects report with aggregated data', async () => {
      const resultsWithDefects = [
        { id: 'result-1', status: TestStatus.FAILED, defects: ['DEF-1', 'DEF-2'], testCaseId: 'case-1' },
        { id: 'result-2', status: TestStatus.FAILED, defects: ['DEF-1'], testCaseId: 'case-2' },
        { id: 'result-3', status: TestStatus.PASSED, defects: ['DEF-3'], testCaseId: 'case-1' },
      ] as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(5);

      const result = await service.getDefectsReport('proj-123');

      expect(result.projectId).toBe('proj-123');
      expect(result.totalDefects).toBe(3);
      expect(result.totalFailedTests).toBe(5);
      expect(result.failedTestsWithDefects).toBe(2);
      expect(result.failedTestsWithoutDefects).toBe(3);

      const def1 = result.defects.find((d) => d.defectId === 'DEF-1');
      expect(def1?.linkedTestResults).toBe(2);
      expect(def1?.affectedTestCases).toBe(2);

      const def2 = result.defects.find((d) => d.defectId === 'DEF-2');
      expect(def2?.linkedTestResults).toBe(1);
      expect(def2?.affectedTestCases).toBe(1);

      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should return empty defects report when no defects exist', async () => {
      mockTestResultQueryBuilder.getMany.mockResolvedValue([]);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getDefectsReport('proj-123');

      expect(result.totalDefects).toBe(0);
      expect(result.totalFailedTests).toBe(0);
      expect(result.failedTestsWithDefects).toBe(0);
      expect(result.failedTestsWithoutDefects).toBe(0);
      expect(result.defects).toEqual([]);
    });

    it('should sort defects by linked test results descending', async () => {
      const resultsWithDefects = [
        { id: 'result-1', status: TestStatus.FAILED, defects: ['DEF-A'], testCaseId: 'case-1' },
        { id: 'result-2', status: TestStatus.FAILED, defects: ['DEF-B'], testCaseId: 'case-2' },
        { id: 'result-3', status: TestStatus.FAILED, defects: ['DEF-B'], testCaseId: 'case-3' },
        { id: 'result-4', status: TestStatus.FAILED, defects: ['DEF-B'], testCaseId: 'case-4' },
        { id: 'result-5', status: TestStatus.FAILED, defects: ['DEF-C', 'DEF-C'], testCaseId: 'case-5' },
      ] as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(5);

      const result = await service.getDefectsReport('proj-123');

      // DEF-B should be first with 3 linked results
      expect(result.defects[0].defectId).toBe('DEF-B');
      expect(result.defects[0].linkedTestResults).toBe(3);
    });

    it('should handle null defects array', async () => {
      const resultsWithDefects = [
        { id: 'result-1', status: TestStatus.FAILED, defects: null, testCaseId: 'case-1' },
      ] as unknown as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.getDefectsReport('proj-123');

      expect(result.totalDefects).toBe(0);
      expect(result.defects).toEqual([]);
    });

    it('should count unique affected test cases correctly', async () => {
      // Same defect on same test case multiple times (e.g., multiple runs)
      const resultsWithDefects = [
        { id: 'result-1', status: TestStatus.FAILED, defects: ['DEF-1'], testCaseId: 'case-1' },
        { id: 'result-2', status: TestStatus.FAILED, defects: ['DEF-1'], testCaseId: 'case-1' },
        { id: 'result-3', status: TestStatus.FAILED, defects: ['DEF-1'], testCaseId: 'case-2' },
      ] as TestResult[];
      mockTestResultQueryBuilder.getMany.mockResolvedValue(resultsWithDefects);
      mockTestResultQueryBuilder.getCount.mockResolvedValue(3);

      const result = await service.getDefectsReport('proj-123');

      const def1 = result.defects.find((d) => d.defectId === 'DEF-1');
      expect(def1?.linkedTestResults).toBe(3);
      expect(def1?.affectedTestCases).toBe(2); // Only 2 unique test cases
    });
  });

  // ============ Activity Report ============

  describe('getActivityReport', () => {
    it('should return activity report with daily and tester breakdown', async () => {
      const dailyResults = [
        { date: '2024-01-15', status: TestStatus.PASSED, count: '10' },
        { date: '2024-01-15', status: TestStatus.FAILED, count: '2' },
        { date: '2024-01-16', status: TestStatus.PASSED, count: '15' },
        { date: '2024-01-16', status: TestStatus.FAILED, count: '5' },
      ];
      const testerResults = [
        { userId: 'user-1', status: TestStatus.PASSED, count: '20' },
        { userId: 'user-1', status: TestStatus.FAILED, count: '5' },
        { userId: 'user-2', status: TestStatus.PASSED, count: '5' },
        { userId: null, status: TestStatus.FAILED, count: '2' },
      ];

      mockTestResultQueryBuilder.clone.mockReturnValue(mockTestResultQueryBuilder);
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce(dailyResults)
        .mockResolvedValueOnce(testerResults);

      const result = await service.getActivityReport(
        'proj-123',
        new Date('2024-01-15'),
        new Date('2024-01-16'),
      );

      expect(result.projectId).toBe('proj-123');
      expect(result.periodStart).toBe('2024-01-15');
      expect(result.periodEnd).toBe('2024-01-16');
      expect(result.totalTestsExecuted).toBe(32);

      expect(result.dailyActivity).toHaveLength(2);
      const day1 = result.dailyActivity.find((d) => d.date === '2024-01-15');
      expect(day1?.testsExecuted).toBe(12);
      expect(day1?.passed).toBe(10);
      expect(day1?.failed).toBe(2);

      expect(result.testerActivity).toHaveLength(3);
      const user1 = result.testerActivity.find((t) => t.userId === 'user-1');
      expect(user1?.testsExecuted).toBe(25);
      expect(user1?.passed).toBe(20);
      expect(user1?.failed).toBe(5);
      expect(user1?.passRate).toBe(80);

      const unknownUser = result.testerActivity.find((t) => t.userId === null);
      expect(unknownUser?.testsExecuted).toBe(2);

      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should return empty activity report when no results exist', async () => {
      mockTestResultQueryBuilder.clone.mockReturnValue(mockTestResultQueryBuilder);
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getActivityReport('proj-123');

      expect(result.totalTestsExecuted).toBe(0);
      expect(result.dailyActivity).toEqual([]);
      expect(result.testerActivity).toEqual([]);
    });

    it('should use default date range when not provided', async () => {
      mockTestResultQueryBuilder.clone.mockReturnValue(mockTestResultQueryBuilder);
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getActivityReport('proj-123');

      // Should have a 30-day range
      const start = new Date(result.periodStart);
      const end = new Date(result.periodEnd);
      const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      expect(diffDays).toBe(30);
    });

    it('should sort tester activity by tests executed descending', async () => {
      const testerResults = [
        { userId: 'user-A', status: TestStatus.PASSED, count: '5' },
        { userId: 'user-B', status: TestStatus.PASSED, count: '15' },
        { userId: 'user-C', status: TestStatus.PASSED, count: '10' },
      ];

      mockTestResultQueryBuilder.clone.mockReturnValue(mockTestResultQueryBuilder);
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(testerResults);

      const result = await service.getActivityReport('proj-123');

      expect(result.testerActivity[0].userId).toBe('user-B');
      expect(result.testerActivity[1].userId).toBe('user-C');
      expect(result.testerActivity[2].userId).toBe('user-A');
    });

    it('should calculate pass rate correctly for each tester', async () => {
      const testerResults = [
        { userId: 'user-1', status: TestStatus.PASSED, count: '8' },
        { userId: 'user-1', status: TestStatus.FAILED, count: '2' },
      ];

      mockTestResultQueryBuilder.clone.mockReturnValue(mockTestResultQueryBuilder);
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(testerResults);

      const result = await service.getActivityReport('proj-123');

      const user1 = result.testerActivity[0];
      expect(user1.passRate).toBe(80); // 8 / 10 = 80%
    });

    it('should handle tester with zero pass rate', async () => {
      const testerResults = [
        { userId: 'user-1', status: TestStatus.FAILED, count: '10' },
      ];

      mockTestResultQueryBuilder.clone.mockReturnValue(mockTestResultQueryBuilder);
      mockTestResultQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(testerResults);

      const result = await service.getActivityReport('proj-123');

      expect(result.testerActivity[0].passRate).toBe(0);
    });
  });
});
