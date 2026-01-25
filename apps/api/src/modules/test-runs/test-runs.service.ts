import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TestRun, TestRunStatus } from './entities/test-run.entity';
import { TestResult, TestStatus } from './entities/test-result.entity';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { UpdateTestRunDto } from './dto/update-test-run.dto';
import { CreateTestResultDto } from './dto/create-test-result.dto';
import { UpdateTestResultDto } from './dto/update-test-result.dto';

@Injectable()
export class TestRunsService {
  constructor(
    @InjectRepository(TestRun)
    private readonly testRunRepository: Repository<TestRun>,
    @InjectRepository(TestResult)
    private readonly testResultRepository: Repository<TestResult>,
  ) {}

  // ============ Test Run Operations ============

  async create(
    projectId: string,
    createTestRunDto: CreateTestRunDto,
  ): Promise<TestRun> {
    const testRun = this.testRunRepository.create({
      ...createTestRunDto,
      projectId,
    });
    return this.testRunRepository.save(testRun);
  }

  async findAllByProject(projectId: string): Promise<TestRun[]> {
    return this.testRunRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(projectId: string, id: string): Promise<TestRun | null> {
    return this.testRunRepository.findOne({
      where: { id, projectId },
    });
  }

  async findByIdOrFail(projectId: string, id: string): Promise<TestRun> {
    const testRun = await this.findById(projectId, id);
    if (!testRun) {
      throw new NotFoundException(`Test run with ID ${id} not found`);
    }
    return testRun;
  }

  async findByIdWithResults(projectId: string, id: string): Promise<TestRun> {
    const testRun = await this.testRunRepository.findOne({
      where: { id, projectId },
      relations: ['results', 'results.testCase'],
    });
    if (!testRun) {
      throw new NotFoundException(`Test run with ID ${id} not found`);
    }
    return testRun;
  }

  async update(
    projectId: string,
    id: string,
    updateTestRunDto: UpdateTestRunDto,
  ): Promise<TestRun> {
    const testRun = await this.findByIdOrFail(projectId, id);

    // Handle status transitions
    if (updateTestRunDto.status) {
      if (
        updateTestRunDto.status === TestRunStatus.IN_PROGRESS &&
        !testRun.startedAt
      ) {
        testRun.startedAt = new Date();
      }
      if (
        (updateTestRunDto.status === TestRunStatus.COMPLETED ||
          updateTestRunDto.status === TestRunStatus.ABORTED) &&
        !testRun.completedAt
      ) {
        testRun.completedAt = new Date();
      }
    }

    Object.assign(testRun, updateTestRunDto);
    return this.testRunRepository.save(testRun);
  }

  async delete(projectId: string, id: string): Promise<void> {
    await this.findByIdOrFail(projectId, id);
    await this.testRunRepository.softDelete(id);
  }

  async startRun(projectId: string, id: string): Promise<TestRun> {
    const testRun = await this.findByIdOrFail(projectId, id);
    testRun.status = TestRunStatus.IN_PROGRESS;
    testRun.startedAt = new Date();
    return this.testRunRepository.save(testRun);
  }

  async completeRun(projectId: string, id: string): Promise<TestRun> {
    const testRun = await this.findByIdOrFail(projectId, id);
    testRun.status = TestRunStatus.COMPLETED;
    testRun.completedAt = new Date();
    return this.testRunRepository.save(testRun);
  }

  // ============ Test Result Operations ============

  async getResults(projectId: string, testRunId: string): Promise<TestResult[]> {
    await this.findByIdOrFail(projectId, testRunId);
    return this.testResultRepository.find({
      where: { testRunId },
      relations: ['testCase'],
      order: { createdAt: 'ASC' },
    });
  }

  async addResult(
    projectId: string,
    testRunId: string,
    createTestResultDto: CreateTestResultDto,
    executedBy?: string,
  ): Promise<TestResult> {
    await this.findByIdOrFail(projectId, testRunId);

    // Check if a result for this test case already exists in this run
    const existingResult = await this.testResultRepository.findOne({
      where: {
        testRunId,
        testCaseId: createTestResultDto.testCaseId,
      },
    });

    if (existingResult) {
      throw new ConflictException(
        `Result for test case ${createTestResultDto.testCaseId} already exists in this run`,
      );
    }

    const result = this.testResultRepository.create({
      ...createTestResultDto,
      testRunId,
      executedBy: executedBy || null,
      executedAt:
        createTestResultDto.status && createTestResultDto.status !== TestStatus.UNTESTED
          ? new Date()
          : null,
    });

    return this.testResultRepository.save(result);
  }

  async addResults(
    projectId: string,
    testRunId: string,
    testCaseIds: string[],
  ): Promise<TestResult[]> {
    await this.findByIdOrFail(projectId, testRunId);

    // Find existing results for these test cases
    const existingResults = await this.testResultRepository.find({
      where: {
        testRunId,
        testCaseId: In(testCaseIds),
      },
    });

    const existingTestCaseIds = new Set(existingResults.map((r) => r.testCaseId));
    const newTestCaseIds = testCaseIds.filter((id) => !existingTestCaseIds.has(id));

    if (newTestCaseIds.length === 0) {
      return [];
    }

    const newResults = newTestCaseIds.map((testCaseId) =>
      this.testResultRepository.create({
        testRunId,
        testCaseId,
        status: TestStatus.UNTESTED,
      }),
    );

    return this.testResultRepository.save(newResults);
  }

  async findResultById(
    projectId: string,
    testRunId: string,
    resultId: string,
  ): Promise<TestResult | null> {
    await this.findByIdOrFail(projectId, testRunId);
    return this.testResultRepository.findOne({
      where: { id: resultId, testRunId },
      relations: ['testCase'],
    });
  }

  async findResultByIdOrFail(
    projectId: string,
    testRunId: string,
    resultId: string,
  ): Promise<TestResult> {
    const result = await this.findResultById(projectId, testRunId, resultId);
    if (!result) {
      throw new NotFoundException(`Test result with ID ${resultId} not found`);
    }
    return result;
  }

  async updateResult(
    projectId: string,
    testRunId: string,
    resultId: string,
    updateTestResultDto: UpdateTestResultDto,
    executedBy?: string,
  ): Promise<TestResult> {
    const result = await this.findResultByIdOrFail(projectId, testRunId, resultId);

    // Set executedAt when status changes from untested
    if (
      updateTestResultDto.status &&
      updateTestResultDto.status !== TestStatus.UNTESTED &&
      result.status === TestStatus.UNTESTED
    ) {
      result.executedAt = new Date();
      result.executedBy = executedBy || result.executedBy;
    }

    Object.assign(result, updateTestResultDto);
    return this.testResultRepository.save(result);
  }

  async deleteResult(
    projectId: string,
    testRunId: string,
    resultId: string,
  ): Promise<void> {
    await this.findResultByIdOrFail(projectId, testRunId, resultId);
    await this.testResultRepository.delete(resultId);
  }

  // ============ Progress Aggregation ============

  async getProgress(
    projectId: string,
    testRunId: string,
  ): Promise<{
    testRunId: string;
    total: number;
    executed: number;
    remaining: number;
    progressPercentage: number;
    status: TestRunStatus;
  }> {
    const testRun = await this.findByIdOrFail(projectId, testRunId);

    const results = await this.testResultRepository
      .createQueryBuilder('result')
      .select('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('result.test_run_id = :testRunId', { testRunId })
      .groupBy('result.status')
      .getRawMany();

    let total = 0;
    let untested = 0;

    for (const row of results) {
      const count = parseInt(row.count, 10);
      total += count;
      if (row.status === TestStatus.UNTESTED) {
        untested = count;
      }
    }

    const executed = total - untested;
    const progressPercentage = total > 0 ? Math.round((executed / total) * 100) : 0;

    return {
      testRunId,
      total,
      executed,
      remaining: untested,
      progressPercentage,
      status: testRun.status,
    };
  }

  // ============ Statistics ============

  async getRunStatistics(
    projectId: string,
    testRunId: string,
  ): Promise<{
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    retest: number;
    untested: number;
    passRate: number;
  }> {
    await this.findByIdOrFail(projectId, testRunId);

    const results = await this.testResultRepository
      .createQueryBuilder('result')
      .select('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('result.test_run_id = :testRunId', { testRunId })
      .groupBy('result.status')
      .getRawMany();

    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      retest: 0,
      untested: 0,
      passRate: 0,
    };

    for (const row of results) {
      const count = parseInt(row.count, 10);
      stats.total += count;
      switch (row.status) {
        case TestStatus.PASSED:
          stats.passed = count;
          break;
        case TestStatus.FAILED:
          stats.failed = count;
          break;
        case TestStatus.BLOCKED:
          stats.blocked = count;
          break;
        case TestStatus.SKIPPED:
          stats.skipped = count;
          break;
        case TestStatus.RETEST:
          stats.retest = count;
          break;
        case TestStatus.UNTESTED:
          stats.untested = count;
          break;
      }
    }

    const executed = stats.total - stats.untested;
    stats.passRate = executed > 0 ? Math.round((stats.passed / executed) * 100) : 0;

    return stats;
  }
}
