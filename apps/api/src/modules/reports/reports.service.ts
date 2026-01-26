import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestRun, TestRunStatus } from '../test-runs/entities/test-run.entity';
import { TestResult, TestStatus } from '../test-runs/entities/test-result.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Requirement } from '../requirements/entities/requirement.entity';
import { RequirementCoverage } from '../requirements/entities/requirement-coverage.entity';
import {
  ProjectSummaryDto,
  CoverageReportDto,
  DefectsReportDto,
  ActivityReportDto,
  TrendsReportDto,
} from './dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TestRun)
    private readonly testRunRepository: Repository<TestRun>,
    @InjectRepository(TestResult)
    private readonly testResultRepository: Repository<TestResult>,
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    @InjectRepository(RequirementCoverage)
    private readonly coverageRepository: Repository<RequirementCoverage>,
  ) {}

  // ============ Public API Methods ============

  async getSummary(projectId: string): Promise<ProjectSummaryDto> {
    return this.getProjectSummary(projectId);
  }

  async getCoverage(projectId: string): Promise<CoverageReportDto> {
    return this.getCoverageReport(projectId);
  }

  async getDefects(projectId: string): Promise<DefectsReportDto> {
    return this.getDefectsReport(projectId);
  }

  async getTrends(
    projectId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TrendsReportDto> {
    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const baseQuery = this.testResultRepository
      .createQueryBuilder('result')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.executed_at IS NOT NULL')
      .andWhere('result.executed_at >= :start', { start })
      .andWhere('result.executed_at <= :end', { end });

    // Get daily execution trends
    const dailyResults = await baseQuery
      .clone()
      .select("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'date')
      .addSelect('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy("TO_CHAR(result.executed_at, 'YYYY-MM-DD')")
      .addGroupBy('result.status')
      .orderBy("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    // Aggregate daily execution trends
    const dailyMap = new Map<
      string,
      { testsExecuted: number; passed: number; failed: number }
    >();

    for (const row of dailyResults) {
      if (!dailyMap.has(row.date)) {
        dailyMap.set(row.date, { testsExecuted: 0, passed: 0, failed: 0 });
      }
      const data = dailyMap.get(row.date)!;
      const count = parseInt(row.count, 10);
      data.testsExecuted += count;
      if (row.status === TestStatus.PASSED) {
        data.passed = count;
      } else if (row.status === TestStatus.FAILED) {
        data.failed = count;
      }
    }

    const executionTrends = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      passRate:
        data.testsExecuted > 0 ? Math.round((data.passed / data.testsExecuted) * 100) : 0,
      testsExecuted: data.testsExecuted,
      passed: data.passed,
      failed: data.failed,
    }));

    // Get daily defect trends
    const defectResults = await this.testResultRepository
      .createQueryBuilder('result')
      .select("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'date')
      .addSelect('result.defects', 'defects')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.executed_at IS NOT NULL')
      .andWhere('result.executed_at >= :start', { start })
      .andWhere('result.executed_at <= :end', { end })
      .andWhere('result.defects IS NOT NULL')
      .andWhere("result.defects != '[]'::jsonb")
      .getRawMany();

    // Aggregate defect trends by date
    const defectByDateMap = new Map<string, Set<string>>();
    const allDefects = new Set<string>();

    for (const row of defectResults) {
      const date = row.date;
      if (!defectByDateMap.has(date)) {
        defectByDateMap.set(date, new Set());
      }
      const defectsOnDate = defectByDateMap.get(date)!;

      if (row.defects && Array.isArray(row.defects)) {
        for (const defectId of row.defects) {
          if (!allDefects.has(defectId)) {
            defectsOnDate.add(defectId);
            allDefects.add(defectId);
          }
        }
      }
    }

    // Build defect trends with cumulative count
    const sortedDates = Array.from(defectByDateMap.keys()).sort();
    let cumulativeCount = 0;
    const defectTrends = sortedDates.map((date) => {
      const newDefects = defectByDateMap.get(date)!.size;
      cumulativeCount += newDefects;
      return {
        date,
        newDefects,
        cumulativeDefects: cumulativeCount,
      };
    });

    // Calculate average pass rate and trend
    let averagePassRate = 0;
    let passRateTrend = 0;

    if (executionTrends.length > 0) {
      const totalPassRate = executionTrends.reduce((sum, d) => sum + d.passRate, 0);
      averagePassRate = Math.round(totalPassRate / executionTrends.length);

      // Calculate trend as difference between last and first pass rate
      if (executionTrends.length >= 2) {
        const firstPassRate = executionTrends[0].passRate;
        const lastPassRate = executionTrends[executionTrends.length - 1].passRate;
        passRateTrend = lastPassRate - firstPassRate;
      }
    }

    return {
      projectId,
      periodStart: start.toISOString().split('T')[0],
      periodEnd: end.toISOString().split('T')[0],
      executionTrends,
      defectTrends,
      averagePassRate,
      passRateTrend,
      generatedAt: new Date(),
    };
  }

  // ============ Project Summary ============

  async getProjectSummary(projectId: string): Promise<ProjectSummaryDto> {
    const [testExecution, testRuns, requirementCoverage] = await Promise.all([
      this.getTestExecutionSummary(projectId),
      this.getTestRunSummary(projectId),
      this.getRequirementCoverageSummary(projectId),
    ]);

    return {
      projectId,
      testExecution,
      testRuns,
      requirementCoverage,
      generatedAt: new Date(),
    };
  }

  private async getTestExecutionSummary(projectId: string) {
    const totalTestCases = await this.testCaseRepository.count({
      where: { projectId },
    });

    const testRunCount = await this.testRunRepository.count({
      where: { projectId },
    });

    if (testRunCount === 0) {
      return {
        totalTestCases,
        totalTestResults: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        retest: 0,
        untested: 0,
        passRate: 0,
        executionProgress: 0,
      };
    }

    const results = await this.testResultRepository
      .createQueryBuilder('result')
      .select('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .groupBy('result.status')
      .getRawMany();

    const stats = {
      totalTestCases,
      totalTestResults: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      retest: 0,
      untested: 0,
      passRate: 0,
      executionProgress: 0,
    };

    for (const row of results) {
      const count = parseInt(row.count, 10);
      stats.totalTestResults += count;
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

    const executed = stats.totalTestResults - stats.untested;
    stats.passRate = executed > 0 ? Math.round((stats.passed / executed) * 100) : 0;
    stats.executionProgress =
      stats.totalTestResults > 0
        ? Math.round((executed / stats.totalTestResults) * 100)
        : 0;

    return stats;
  }

  private async getTestRunSummary(projectId: string) {
    const results = await this.testRunRepository
      .createQueryBuilder('run')
      .select('run.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('run.project_id = :projectId', { projectId })
      .groupBy('run.status')
      .getRawMany();

    const stats = {
      total: 0,
      notStarted: 0,
      inProgress: 0,
      completed: 0,
      aborted: 0,
    };

    for (const row of results) {
      const count = parseInt(row.count, 10);
      stats.total += count;
      switch (row.status) {
        case TestRunStatus.NOT_STARTED:
          stats.notStarted = count;
          break;
        case TestRunStatus.IN_PROGRESS:
          stats.inProgress = count;
          break;
        case TestRunStatus.COMPLETED:
          stats.completed = count;
          break;
        case TestRunStatus.ABORTED:
          stats.aborted = count;
          break;
      }
    }

    return stats;
  }

  private async getRequirementCoverageSummary(projectId: string) {
    const requirements = await this.requirementRepository.find({
      where: { projectId },
      select: ['id'],
    });

    const totalRequirements = requirements.length;

    if (totalRequirements === 0) {
      return {
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
      };
    }

    const requirementIds = requirements.map((r) => r.id);

    const coveredResult = await this.coverageRepository
      .createQueryBuilder('coverage')
      .select('COUNT(DISTINCT coverage.requirement_id)', 'count')
      .where('coverage.requirement_id IN (:...ids)', { ids: requirementIds })
      .getRawOne();

    const coveredCount = parseInt(coveredResult.count, 10);
    const uncoveredCount = totalRequirements - coveredCount;
    const coveragePercentage =
      totalRequirements > 0 ? Math.round((coveredCount / totalRequirements) * 100) : 0;

    return {
      totalRequirements,
      coveredRequirements: coveredCount,
      uncoveredRequirements: uncoveredCount,
      coveragePercentage,
    };
  }

  // ============ Coverage Report ============

  async getCoverageReport(projectId: string): Promise<CoverageReportDto> {
    const requirements = await this.requirementRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });

    if (requirements.length === 0) {
      return {
        projectId,
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
        requirements: [],
        generatedAt: new Date(),
      };
    }

    const requirementIds = requirements.map((r) => r.id);

    // Get coverage counts for each requirement
    const coverageCounts = await this.coverageRepository
      .createQueryBuilder('coverage')
      .select('coverage.requirement_id', 'requirementId')
      .addSelect('COUNT(*)', 'count')
      .where('coverage.requirement_id IN (:...ids)', { ids: requirementIds })
      .groupBy('coverage.requirement_id')
      .getRawMany();

    const coverageMap = new Map<string, number>();
    for (const row of coverageCounts) {
      coverageMap.set(row.requirementId, parseInt(row.count, 10));
    }

    const requirementDetails = requirements.map((req) => {
      const linkedTestCases = coverageMap.get(req.id) || 0;
      return {
        requirementId: req.id,
        externalId: req.externalId,
        title: req.title,
        status: req.status,
        linkedTestCases,
        isCovered: linkedTestCases > 0,
      };
    });

    const coveredCount = requirementDetails.filter((r) => r.isCovered).length;
    const uncoveredCount = requirements.length - coveredCount;
    const coveragePercentage =
      requirements.length > 0 ? Math.round((coveredCount / requirements.length) * 100) : 0;

    return {
      projectId,
      totalRequirements: requirements.length,
      coveredRequirements: coveredCount,
      uncoveredRequirements: uncoveredCount,
      coveragePercentage,
      requirements: requirementDetails,
      generatedAt: new Date(),
    };
  }

  // ============ Defects Report ============

  async getDefectsReport(projectId: string): Promise<DefectsReportDto> {
    // Get all test results with defects for this project
    const resultsWithDefects = await this.testResultRepository
      .createQueryBuilder('result')
      .select(['result.id', 'result.defects', 'result.status', 'result.testCaseId'])
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.defects IS NOT NULL')
      .andWhere("result.defects != '[]'::jsonb")
      .getMany();

    // Get total failed tests count
    const totalFailedTests = await this.testResultRepository
      .createQueryBuilder('result')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.status = :status', { status: TestStatus.FAILED })
      .getCount();

    // Aggregate defect data
    const defectMap = new Map<
      string,
      { linkedTestResults: number; testCaseIds: Set<string> }
    >();

    let failedTestsWithDefects = 0;

    for (const result of resultsWithDefects) {
      if (result.status === TestStatus.FAILED) {
        failedTestsWithDefects++;
      }

      if (result.defects && Array.isArray(result.defects)) {
        for (const defectId of result.defects) {
          if (!defectMap.has(defectId)) {
            defectMap.set(defectId, { linkedTestResults: 0, testCaseIds: new Set() });
          }
          const data = defectMap.get(defectId)!;
          data.linkedTestResults++;
          data.testCaseIds.add(result.testCaseId);
        }
      }
    }

    const defects = Array.from(defectMap.entries()).map(([defectId, data]) => ({
      defectId,
      linkedTestResults: data.linkedTestResults,
      affectedTestCases: data.testCaseIds.size,
    }));

    // Sort by number of linked test results descending
    defects.sort((a, b) => b.linkedTestResults - a.linkedTestResults);

    return {
      projectId,
      totalDefects: defects.length,
      totalFailedTests,
      failedTestsWithDefects,
      failedTestsWithoutDefects: totalFailedTests - failedTestsWithDefects,
      defects,
      generatedAt: new Date(),
    };
  }

  // ============ Activity Report ============

  async getActivityReport(
    projectId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ActivityReportDto> {
    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const baseQuery = this.testResultRepository
      .createQueryBuilder('result')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.executed_at IS NOT NULL')
      .andWhere('result.executed_at >= :start', { start })
      .andWhere('result.executed_at <= :end', { end });

    // Get daily activity
    const dailyResults = await baseQuery
      .clone()
      .select("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'date')
      .addSelect('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy("TO_CHAR(result.executed_at, 'YYYY-MM-DD')")
      .addGroupBy('result.status')
      .orderBy("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    // Aggregate daily activity
    const dailyMap = new Map<string, { testsExecuted: number; passed: number; failed: number }>();

    for (const row of dailyResults) {
      if (!dailyMap.has(row.date)) {
        dailyMap.set(row.date, { testsExecuted: 0, passed: 0, failed: 0 });
      }
      const data = dailyMap.get(row.date)!;
      const count = parseInt(row.count, 10);
      data.testsExecuted += count;
      if (row.status === TestStatus.PASSED) {
        data.passed = count;
      } else if (row.status === TestStatus.FAILED) {
        data.failed = count;
      }
    }

    const dailyActivity = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Get tester activity
    const testerResults = await baseQuery
      .clone()
      .select('result.executed_by', 'userId')
      .addSelect('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('result.executed_by')
      .addGroupBy('result.status')
      .getRawMany();

    // Aggregate tester activity
    const testerMap = new Map<
      string | null,
      { testsExecuted: number; passed: number; failed: number }
    >();

    for (const row of testerResults) {
      const userId = row.userId || null;
      if (!testerMap.has(userId)) {
        testerMap.set(userId, { testsExecuted: 0, passed: 0, failed: 0 });
      }
      const data = testerMap.get(userId)!;
      const count = parseInt(row.count, 10);
      data.testsExecuted += count;
      if (row.status === TestStatus.PASSED) {
        data.passed = count;
      } else if (row.status === TestStatus.FAILED) {
        data.failed = count;
      }
    }

    const testerActivity = Array.from(testerMap.entries()).map(([userId, data]) => ({
      userId,
      ...data,
      passRate:
        data.testsExecuted > 0 ? Math.round((data.passed / data.testsExecuted) * 100) : 0,
    }));

    // Sort by tests executed descending
    testerActivity.sort((a, b) => b.testsExecuted - a.testsExecuted);

    const totalTestsExecuted = dailyActivity.reduce((sum, d) => sum + d.testsExecuted, 0);

    return {
      projectId,
      periodStart: start.toISOString().split('T')[0],
      periodEnd: end.toISOString().split('T')[0],
      totalTestsExecuted,
      dailyActivity,
      testerActivity,
      generatedAt: new Date(),
    };
  }
}
