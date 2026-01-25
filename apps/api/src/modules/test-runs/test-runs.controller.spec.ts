import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TestRunsController } from './test-runs.controller';
import { TestRunsService } from './test-runs.service';
import { TestRun, TestRunStatus } from './entities/test-run.entity';
import { TestResult, TestStatus } from './entities/test-result.entity';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { UpdateTestRunDto } from './dto/update-test-run.dto';
import { CreateTestResultDto } from './dto/create-test-result.dto';
import { UpdateTestResultDto } from './dto/update-test-result.dto';

describe('TestRunsController', () => {
  let controller: TestRunsController;
  let service: jest.Mocked<TestRunsService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestRunsController],
      providers: [
        {
          provide: TestRunsService,
          useValue: {
            create: jest.fn(),
            findAllByProject: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            startRun: jest.fn(),
            completeRun: jest.fn(),
            closeRun: jest.fn(),
            getRunStatistics: jest.fn(),
            getProgress: jest.fn(),
            getResults: jest.fn(),
            addResult: jest.fn(),
            findResultByIdOrFail: jest.fn(),
            updateResult: jest.fn(),
            deleteResult: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestRunsController>(TestRunsController);
    service = module.get(TestRunsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============ Test Run Endpoints ============

  describe('create', () => {
    const createTestRunDto: CreateTestRunDto = {
      name: 'New Test Run',
      description: 'A new test run',
    };

    it('should create a new test run', async () => {
      const newTestRun = { ...mockTestRun, ...createTestRunDto };
      service.create.mockResolvedValue(newTestRun);

      const result = await controller.create('proj-123', createTestRunDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', createTestRunDto);
      expect(result).toEqual(newTestRun);
    });

    it('should create a test run with minimal data', async () => {
      const minimalDto: CreateTestRunDto = {
        name: 'Minimal Test Run',
      };
      const newTestRun = { ...mockTestRun, name: 'Minimal Test Run' };
      service.create.mockResolvedValue(newTestRun);

      const result = await controller.create('proj-123', minimalDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', minimalDto);
      expect(result).toEqual(newTestRun);
    });
  });

  describe('findAll', () => {
    it('should return all test runs for a project', async () => {
      const testRuns = [mockTestRun];
      service.findAllByProject.mockResolvedValue(testRuns);

      const result = await controller.findAll('proj-123');

      expect(service.findAllByProject).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(testRuns);
    });

    it('should return empty array when no test runs exist', async () => {
      service.findAllByProject.mockResolvedValue([]);

      const result = await controller.findAll('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a test run by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockTestRun);

      const result = await controller.findById('proj-123', 'run-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result).toEqual(mockTestRun);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.findById('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateTestRunDto: UpdateTestRunDto = {
      name: 'Updated Test Run',
      description: 'Updated description',
    };

    it('should update a test run', async () => {
      const updatedTestRun = { ...mockTestRun, ...updateTestRunDto };
      service.update.mockResolvedValue(updatedTestRun);

      const result = await controller.update('proj-123', 'run-123', updateTestRunDto);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'run-123', updateTestRunDto);
      expect(result).toEqual(updatedTestRun);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(
        controller.update('proj-123', 'non-existent', updateTestRunDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a test run', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123', 'run-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123', 'run-123');
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('startRun', () => {
    it('should start a test run', async () => {
      const startedRun = {
        ...mockTestRun,
        status: TestRunStatus.IN_PROGRESS,
        startedAt: new Date(),
      };
      service.startRun.mockResolvedValue(startedRun);

      const result = await controller.startRun('proj-123', 'run-123');

      expect(service.startRun).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result.status).toBe(TestRunStatus.IN_PROGRESS);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.startRun.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.startRun('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeRun', () => {
    it('should complete a test run', async () => {
      const completedRun = {
        ...mockTestRun,
        status: TestRunStatus.COMPLETED,
        completedAt: new Date(),
      };
      service.completeRun.mockResolvedValue(completedRun);

      const result = await controller.completeRun('proj-123', 'run-123');

      expect(service.completeRun).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result.status).toBe(TestRunStatus.COMPLETED);
    });
  });

  describe('closeRun', () => {
    it('should close a test run', async () => {
      const closedRun = {
        ...mockTestRun,
        status: TestRunStatus.COMPLETED,
        completedAt: new Date(),
      };
      service.closeRun.mockResolvedValue(closedRun);

      const result = await controller.closeRun('proj-123', 'run-123');

      expect(service.closeRun).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result.status).toBe(TestRunStatus.COMPLETED);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.closeRun.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.closeRun('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return run statistics', async () => {
      const stats = {
        total: 10,
        passed: 5,
        failed: 2,
        blocked: 1,
        skipped: 0,
        retest: 0,
        untested: 2,
        passRate: 62,
      };
      service.getRunStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics('proj-123', 'run-123');

      expect(service.getRunStatistics).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result).toEqual(stats);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.getRunStatistics.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.getStatistics('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProgress', () => {
    const mockProgress = {
      testRunId: 'run-123',
      total: 10,
      executed: 7,
      remaining: 3,
      progressPercentage: 70,
      status: TestRunStatus.IN_PROGRESS,
    };

    it('should return progress for a test run', async () => {
      service.getProgress.mockResolvedValue(mockProgress);

      const result = await controller.getProgress('proj-123', 'run-123');

      expect(service.getProgress).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result).toEqual(mockProgress);
    });

    it('should return 0% progress when no tests executed', async () => {
      const noProgressResult = {
        ...mockProgress,
        executed: 0,
        remaining: 10,
        progressPercentage: 0,
      };
      service.getProgress.mockResolvedValue(noProgressResult);

      const result = await controller.getProgress('proj-123', 'run-123');

      expect(result.progressPercentage).toBe(0);
      expect(result.executed).toBe(0);
    });

    it('should return 100% progress when all tests executed', async () => {
      const fullProgressResult = {
        ...mockProgress,
        executed: 10,
        remaining: 0,
        progressPercentage: 100,
      };
      service.getProgress.mockResolvedValue(fullProgressResult);

      const result = await controller.getProgress('proj-123', 'run-123');

      expect(result.progressPercentage).toBe(100);
      expect(result.remaining).toBe(0);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.getProgress.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.getProgress('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ Test Result Endpoints ============

  describe('getResults', () => {
    it('should return results for a test run', async () => {
      service.getResults.mockResolvedValue([mockTestResult]);

      const result = await controller.getResults('proj-123', 'run-123');

      expect(service.getResults).toHaveBeenCalledWith('proj-123', 'run-123');
      expect(result).toEqual([mockTestResult]);
    });

    it('should return empty array when no results exist', async () => {
      service.getResults.mockResolvedValue([]);

      const result = await controller.getResults('proj-123', 'run-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.getResults.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(controller.getResults('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addResult', () => {
    const createResultDto: CreateTestResultDto = {
      testCaseId: 'case-456',
      status: TestStatus.PASSED,
    };

    it('should add a result to a test run', async () => {
      service.addResult.mockResolvedValue(mockTestResult);

      const result = await controller.addResult('proj-123', 'run-123', createResultDto);

      expect(service.addResult).toHaveBeenCalledWith('proj-123', 'run-123', createResultDto);
      expect(result).toEqual(mockTestResult);
    });

    it('should throw NotFoundException when test run not found', async () => {
      service.addResult.mockRejectedValue(
        new NotFoundException('Test run with ID non-existent not found'),
      );

      await expect(
        controller.addResult('proj-123', 'non-existent', createResultDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when result already exists', async () => {
      service.addResult.mockRejectedValue(
        new ConflictException('Result for test case case-456 already exists in this run'),
      );

      await expect(
        controller.addResult('proj-123', 'run-123', createResultDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getResult', () => {
    it('should return a specific result', async () => {
      service.findResultByIdOrFail.mockResolvedValue(mockTestResult);

      const result = await controller.getResult('proj-123', 'run-123', 'result-123');

      expect(service.findResultByIdOrFail).toHaveBeenCalledWith(
        'proj-123',
        'run-123',
        'result-123',
      );
      expect(result).toEqual(mockTestResult);
    });

    it('should throw NotFoundException when result not found', async () => {
      service.findResultByIdOrFail.mockRejectedValue(
        new NotFoundException('Test result with ID non-existent not found'),
      );

      await expect(
        controller.getResult('proj-123', 'run-123', 'non-existent'),
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
      service.updateResult.mockResolvedValue(updatedResult);

      const result = await controller.updateResult(
        'proj-123',
        'run-123',
        'result-123',
        updateResultDto,
      );

      expect(service.updateResult).toHaveBeenCalledWith(
        'proj-123',
        'run-123',
        'result-123',
        updateResultDto,
      );
      expect(result.status).toBe(TestStatus.PASSED);
    });

    it('should throw NotFoundException when result not found', async () => {
      service.updateResult.mockRejectedValue(
        new NotFoundException('Test result with ID non-existent not found'),
      );

      await expect(
        controller.updateResult('proj-123', 'run-123', 'non-existent', updateResultDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteResult', () => {
    it('should delete a result', async () => {
      service.deleteResult.mockResolvedValue(undefined);

      await controller.deleteResult('proj-123', 'run-123', 'result-123');

      expect(service.deleteResult).toHaveBeenCalledWith('proj-123', 'run-123', 'result-123');
    });

    it('should throw NotFoundException when result not found', async () => {
      service.deleteResult.mockRejectedValue(
        new NotFoundException('Test result with ID non-existent not found'),
      );

      await expect(
        controller.deleteResult('proj-123', 'run-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
