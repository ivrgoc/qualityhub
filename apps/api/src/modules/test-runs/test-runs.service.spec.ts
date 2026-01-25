import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TestRunsService } from './test-runs.service';
import { TestRun, TestRunStatus } from './entities/test-run.entity';
import { TestResult, TestStatus } from './entities/test-result.entity';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { UpdateTestRunDto } from './dto/update-test-run.dto';
import { CreateTestResultDto } from './dto/create-test-result.dto';
import { UpdateTestResultDto } from './dto/update-test-result.dto';

describe('TestRunsService', () => {
  let service: TestRunsService;
  let testRunRepository: jest.Mocked<Repository<TestRun>>;
  let testResultRepository: jest.Mocked<Repository<TestResult>>;

  const mockTestRun: TestRun = {
    id: 'run-123',
    projectId: 'proj-123',
    project: null,
    testPlanId: null,
    name: 'Sprint 1 Regression',
    description: 'Regression tests for Sprint 1',
    status: TestRunStatus.NOT_STARTED,
    config: null,
    assigneeId: null,
    startedAt: null,
    completedAt: null,
    results: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockTestResult: TestResult = {
    id: 'result-123',
    testRunId: 'run-123',
    testRun: null,
    testCaseId: 'case-456',
    testCase: null,
    testCaseVersion: 1,
    status: TestStatus.UNTESTED,
    comment: null,
    elapsedSeconds: null,
    defects: null,
    attachments: null,
    executedBy: null,
    executedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestRunsService,
        {
          provide: getRepositoryToken(TestRun),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TestResult),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<TestRunsService>(TestRunsService);
    testRunRepository = module.get(getRepositoryToken(TestRun));
    testResultRepository = module.get(getRepositoryToken(TestResult));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============ Test Run Operations ============

  describe('create', () => {
    const createTestRunDto: CreateTestRunDto = {
      name: 'New Test Run',
      description: 'A new test run',
    };

    it('should create a new test run', async () => {
      const newTestRun = { ...mockTestRun, ...createTestRunDto };
      testRunRepository.create.mockReturnValue(newTestRun);
      testRunRepository.save.mockResolvedValue(newTestRun);

      const result = await service.create('proj-123', createTestRunDto);

      expect(testRunRepository.create).toHaveBeenCalledWith({
        ...createTestRunDto,
        projectId: 'proj-123',
      });
      expect(testRunRepository.save).toHaveBeenCalledWith(newTestRun);
      expect(result).toEqual(newTestRun);
    });

    it('should create a test run with only required fields', async () => {
      const minimalDto: CreateTestRunDto = {
        name: 'Minimal Test Run',
      };
      const newTestRun = { ...mockTestRun, ...minimalDto };
      testRunRepository.create.mockReturnValue(newTestRun);
      testRunRepository.save.mockResolvedValue(newTestRun);

      const result = await service.create('proj-123', minimalDto);

      expect(testRunRepository.create).toHaveBeenCalledWith({
        ...minimalDto,
        projectId: 'proj-123',
      });
      expect(result).toEqual(newTestRun);
    });
  });

  describe('findAllByProject', () => {
    it('should return all test runs for a project', async () => {
      const testRuns = [mockTestRun];
      testRunRepository.find.mockResolvedValue(testRuns);

      const result = await service.findAllByProject('proj-123');

      expect(testRunRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(testRuns);
    });

    it('should return empty array when no test runs exist', async () => {
      testRunRepository.find.mockResolvedValue([]);

      const result = await service.findAllByProject('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a test run by id and projectId', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);

      const result = await service.findById('proj-123', 'run-123');

      expect(testRunRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'run-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockTestRun);
    });

    it('should return null when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('proj-123', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a test run by id and projectId', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);

      const result = await service.findByIdOrFail('proj-123', 'run-123');

      expect(result).toEqual(mockTestRun);
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        'Test run with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const updateTestRunDto: UpdateTestRunDto = {
      name: 'Updated Test Run',
    };

    it('should update an existing test run', async () => {
      const updatedTestRun = { ...mockTestRun, ...updateTestRunDto };
      testRunRepository.findOne.mockResolvedValue({ ...mockTestRun });
      testRunRepository.save.mockResolvedValue(updatedTestRun);

      const result = await service.update('proj-123', 'run-123', updateTestRunDto);

      expect(testRunRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'run-123',
          name: 'Updated Test Run',
        }),
      );
      expect(result).toEqual(updatedTestRun);
    });

    it('should set startedAt when status changes to IN_PROGRESS', async () => {
      const updateDto: UpdateTestRunDto = {
        status: TestRunStatus.IN_PROGRESS,
      };
      testRunRepository.findOne.mockResolvedValue({ ...mockTestRun });
      testRunRepository.save.mockImplementation(async (run) => run as TestRun);

      const result = await service.update('proj-123', 'run-123', updateDto);

      expect(result.startedAt).toBeDefined();
      expect(result.status).toBe(TestRunStatus.IN_PROGRESS);
    });

    it('should set completedAt when status changes to COMPLETED', async () => {
      const updateDto: UpdateTestRunDto = {
        status: TestRunStatus.COMPLETED,
      };
      const runInProgress = { ...mockTestRun, status: TestRunStatus.IN_PROGRESS };
      testRunRepository.findOne.mockResolvedValue(runInProgress);
      testRunRepository.save.mockImplementation(async (run) => run as TestRun);

      const result = await service.update('proj-123', 'run-123', updateDto);

      expect(result.completedAt).toBeDefined();
      expect(result.status).toBe(TestRunStatus.COMPLETED);
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-123', 'non-existent', updateTestRunDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete an existing test run', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testRunRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.delete('proj-123', 'run-123');

      expect(testRunRepository.softDelete).toHaveBeenCalledWith('run-123');
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(testRunRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('startRun', () => {
    it('should start a test run', async () => {
      testRunRepository.findOne.mockResolvedValue({ ...mockTestRun });
      testRunRepository.save.mockImplementation(async (run) => run as TestRun);

      const result = await service.startRun('proj-123', 'run-123');

      expect(result.status).toBe(TestRunStatus.IN_PROGRESS);
      expect(result.startedAt).toBeDefined();
    });
  });

  describe('completeRun', () => {
    it('should complete a test run', async () => {
      testRunRepository.findOne.mockResolvedValue({ ...mockTestRun });
      testRunRepository.save.mockImplementation(async (run) => run as TestRun);

      const result = await service.completeRun('proj-123', 'run-123');

      expect(result.status).toBe(TestRunStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });
  });

  // ============ Test Result Operations ============

  describe('getResults', () => {
    it('should return results for a test run', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.find.mockResolvedValue([mockTestResult]);

      const result = await service.getResults('proj-123', 'run-123');

      expect(testResultRepository.find).toHaveBeenCalledWith({
        where: { testRunId: 'run-123' },
        relations: ['testCase'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([mockTestResult]);
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(service.getResults('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addResult', () => {
    const createResultDto: CreateTestResultDto = {
      testCaseId: 'case-456',
      status: TestStatus.PASSED,
    };

    it('should add a new result to test run', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(null);
      testResultRepository.create.mockReturnValue(mockTestResult);
      testResultRepository.save.mockResolvedValue(mockTestResult);

      const result = await service.addResult('proj-123', 'run-123', createResultDto);

      expect(testResultRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockTestResult);
    });

    it('should throw ConflictException when result already exists', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(mockTestResult);

      await expect(
        service.addResult('proj-123', 'run-123', createResultDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addResult('proj-123', 'non-existent', createResultDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addResults', () => {
    it('should add multiple results to test run', async () => {
      const testCaseIds = ['case-1', 'case-2'];
      const newResults = [
        { ...mockTestResult, id: 'result-1', testCaseId: 'case-1' },
        { ...mockTestResult, id: 'result-2', testCaseId: 'case-2' },
      ];

      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.find.mockResolvedValue([]);
      testResultRepository.create
        .mockReturnValueOnce(newResults[0])
        .mockReturnValueOnce(newResults[1]);
      testResultRepository.save.mockResolvedValue(newResults);

      const result = await service.addResults('proj-123', 'run-123', testCaseIds);

      expect(result).toEqual(newResults);
    });

    it('should skip existing results', async () => {
      const testCaseIds = ['case-1', 'case-2'];
      const existingResult = { ...mockTestResult, testCaseId: 'case-1' };
      const newResult = { ...mockTestResult, id: 'result-2', testCaseId: 'case-2' };

      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.find.mockResolvedValue([existingResult]);
      testResultRepository.create.mockReturnValue(newResult);
      testResultRepository.save.mockResolvedValue([newResult]);

      const result = await service.addResults('proj-123', 'run-123', testCaseIds);

      expect(testResultRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual([newResult]);
    });

    it('should return empty array when all results exist', async () => {
      const testCaseIds = ['case-1'];
      const existingResult = { ...mockTestResult, testCaseId: 'case-1' };

      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.find.mockResolvedValue([existingResult]);

      const result = await service.addResults('proj-123', 'run-123', testCaseIds);

      expect(result).toEqual([]);
      expect(testResultRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findResultByIdOrFail', () => {
    it('should find a result by id', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(mockTestResult);

      const result = await service.findResultByIdOrFail('proj-123', 'run-123', 'result-123');

      expect(result).toEqual(mockTestResult);
    });

    it('should throw NotFoundException when result not found', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findResultByIdOrFail('proj-123', 'run-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateResult', () => {
    const updateResultDto: UpdateTestResultDto = {
      status: TestStatus.PASSED,
      comment: 'Test passed',
    };

    it('should update a result', async () => {
      const updatedResult = { ...mockTestResult, ...updateResultDto };
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue({ ...mockTestResult });
      testResultRepository.save.mockResolvedValue(updatedResult);

      const result = await service.updateResult(
        'proj-123',
        'run-123',
        'result-123',
        updateResultDto,
      );

      expect(result.status).toBe(TestStatus.PASSED);
      expect(result.comment).toBe('Test passed');
    });

    it('should set executedAt when status changes from untested', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue({ ...mockTestResult });
      testResultRepository.save.mockImplementation(async (result) => result as TestResult);

      const result = await service.updateResult(
        'proj-123',
        'run-123',
        'result-123',
        { status: TestStatus.PASSED },
      );

      expect(result.executedAt).toBeDefined();
    });

    it('should throw NotFoundException when result not found', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateResult('proj-123', 'run-123', 'non-existent', updateResultDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteResult', () => {
    it('should delete a result', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(mockTestResult);
      testResultRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteResult('proj-123', 'run-123', 'result-123');

      expect(testResultRepository.delete).toHaveBeenCalledWith('result-123');
    });

    it('should throw NotFoundException when result not found', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      testResultRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteResult('proj-123', 'run-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ Statistics ============

  describe('getRunStatistics', () => {
    it('should return run statistics', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '5' },
        { status: TestStatus.FAILED, count: '2' },
        { status: TestStatus.UNTESTED, count: '3' },
      ]);

      const result = await service.getRunStatistics('proj-123', 'run-123');

      expect(result.total).toBe(10);
      expect(result.passed).toBe(5);
      expect(result.failed).toBe(2);
      expect(result.untested).toBe(3);
      expect(result.passRate).toBe(71); // 5 / 7 * 100 = 71.4 rounded to 71
    });

    it('should return zero pass rate when no tests executed', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.UNTESTED, count: '10' },
      ]);

      const result = await service.getRunStatistics('proj-123', 'run-123');

      expect(result.passRate).toBe(0);
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(service.getRunStatistics('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ Progress Aggregation ============

  describe('getProgress', () => {
    it('should return progress with correct percentages', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '5' },
        { status: TestStatus.FAILED, count: '2' },
        { status: TestStatus.UNTESTED, count: '3' },
      ]);

      const result = await service.getProgress('proj-123', 'run-123');

      expect(result.testRunId).toBe('run-123');
      expect(result.total).toBe(10);
      expect(result.executed).toBe(7);
      expect(result.remaining).toBe(3);
      expect(result.progressPercentage).toBe(70); // 7 / 10 * 100 = 70
      expect(result.status).toBe(TestRunStatus.NOT_STARTED);
    });

    it('should return 0% progress when all tests are untested', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.UNTESTED, count: '10' },
      ]);

      const result = await service.getProgress('proj-123', 'run-123');

      expect(result.total).toBe(10);
      expect(result.executed).toBe(0);
      expect(result.remaining).toBe(10);
      expect(result.progressPercentage).toBe(0);
    });

    it('should return 100% progress when all tests are executed', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { status: TestStatus.PASSED, count: '8' },
        { status: TestStatus.FAILED, count: '2' },
      ]);

      const result = await service.getProgress('proj-123', 'run-123');

      expect(result.total).toBe(10);
      expect(result.executed).toBe(10);
      expect(result.remaining).toBe(0);
      expect(result.progressPercentage).toBe(100);
    });

    it('should return 0% progress when no results exist', async () => {
      testRunRepository.findOne.mockResolvedValue(mockTestRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getProgress('proj-123', 'run-123');

      expect(result.total).toBe(0);
      expect(result.executed).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.progressPercentage).toBe(0);
    });

    it('should include test run status in response', async () => {
      const inProgressRun = { ...mockTestRun, status: TestRunStatus.IN_PROGRESS };
      testRunRepository.findOne.mockResolvedValue(inProgressRun);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getProgress('proj-123', 'run-123');

      expect(result.status).toBe(TestRunStatus.IN_PROGRESS);
    });

    it('should throw NotFoundException when test run not found', async () => {
      testRunRepository.findOne.mockResolvedValue(null);

      await expect(service.getProgress('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
