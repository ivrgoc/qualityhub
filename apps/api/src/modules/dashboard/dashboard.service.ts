import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestRun, TestRunStatus } from '../test-runs/entities/test-run.entity';
import { TestResult, TestStatus } from '../test-runs/entities/test-result.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Requirement } from '../requirements/entities/requirement.entity';
import { RequirementCoverage } from '../requirements/entities/requirement-coverage.entity';
import {
  ProjectDashboardDto,
  TestExecutionWidgetDto,
  TestRunsWidgetDto,
  ActiveRunDto,
  RecentActivityWidgetDto,
  RecentActivityItemDto,
  CoverageWidgetDto,
  DefectsWidgetDto,
  TopDefectDto,
  TrendsWidgetDto,
  TrendPointDto,
} from './dto';

@Injectable()
export class DashboardService {
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

  // ============ Main Dashboard ============

  async getProjectDashboard(projectId: string): Promise<ProjectDashboardDto> {
    const [testExecution, testRuns, recentActivity, coverage, defects, trends] =
      await Promise.all([
        this.getTestExecutionWidget(projectId),
        this.getTestRunsWidget(projectId),
        this.getRecentActivityWidget(projectId),
        this.getCoverageWidget(projectId),
        this.getDefectsWidget(projectId),
        this.getTrendsWidget(projectId),
      ]);

    return {
      projectId,
      testExecution,
      testRuns,
      recentActivity,
      coverage,
      defects,
      trends,
      generatedAt: new Date(),
    };
  }

  // ============ Test Execution Widget ============

  async getTestExecutionWidget(projectId: string): Promise<TestExecutionWidgetDto> {
    const totalTestCases = await this.testCaseRepository.count({
      where: { projectId },
    });

    const testRunCount = await this.testRunRepository.count({
      where: { projectId },
    });

    if (testRunCount === 0) {
      return {
        totalTestCases,
        totalExecuted: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        remaining: totalTestCases,
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
      totalExecuted: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      remaining: 0,
      passRate: 0,
      executionProgress: 0,
    };

    let untested = 0;
    let skipped = 0;
    let retest = 0;

    for (const row of results) {
      const count = parseInt(row.count, 10);
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
          skipped = count;
          break;
        case TestStatus.RETEST:
          retest = count;
          break;
        case TestStatus.UNTESTED:
          untested = count;
          break;
      }
    }

    const totalResults = stats.passed + stats.failed + stats.blocked + skipped + retest + untested;
    stats.totalExecuted = stats.passed + stats.failed + stats.blocked;
    stats.remaining = untested + skipped + retest;
    stats.passRate =
      stats.totalExecuted > 0 ? Math.round((stats.passed / stats.totalExecuted) * 100) : 0;
    stats.executionProgress =
      totalResults > 0 ? Math.round((stats.totalExecuted / totalResults) * 100) : 0;

    return stats;
  }

  // ============ Test Runs Widget ============

  async getTestRunsWidget(projectId: string): Promise<TestRunsWidgetDto> {
    const statusResults = await this.testRunRepository
      .createQueryBuilder('run')
      .select('run.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('run.project_id = :projectId', { projectId })
      .groupBy('run.status')
      .getRawMany();

    const counts = {
      total: 0,
      activeCount: 0,
      completedCount: 0,
      pendingCount: 0,
    };

    for (const row of statusResults) {
      const count = parseInt(row.count, 10);
      counts.total += count;
      switch (row.status) {
        case TestRunStatus.IN_PROGRESS:
          counts.activeCount = count;
          break;
        case TestRunStatus.COMPLETED:
          counts.completedCount = count;
          break;
        case TestRunStatus.NOT_STARTED:
          counts.pendingCount = count;
          break;
      }
    }

    // Get active runs with progress
    const activeRuns = await this.getActiveRunsWithProgress(projectId);

    return {
      ...counts,
      activeRuns,
    };
  }

  private async getActiveRunsWithProgress(projectId: string): Promise<ActiveRunDto[]> {
    const activeRuns = await this.testRunRepository.find({
      where: {
        projectId,
        status: TestRunStatus.IN_PROGRESS,
      },
      order: { startedAt: 'DESC' },
      take: 5,
    });

    if (activeRuns.length === 0) {
      return [];
    }

    const runIds = activeRuns.map((r) => r.id);

    // Get progress for each run
    const progressResults = await this.testResultRepository
      .createQueryBuilder('result')
      .select('result.test_run_id', 'runId')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        `SUM(CASE WHEN result.status NOT IN ('${TestStatus.UNTESTED}') THEN 1 ELSE 0 END)`,
        'executed',
      )
      .where('result.test_run_id IN (:...runIds)', { runIds })
      .groupBy('result.test_run_id')
      .getRawMany();

    const progressMap = new Map<string, number>();
    for (const row of progressResults) {
      const total = parseInt(row.total, 10);
      const executed = parseInt(row.executed, 10);
      progressMap.set(row.runId, total > 0 ? Math.round((executed / total) * 100) : 0);
    }

    return activeRuns.map((run) => ({
      id: run.id,
      name: run.name,
      status: run.status,
      progress: progressMap.get(run.id) || 0,
      assigneeId: run.assigneeId,
      startedAt: run.startedAt,
    }));
  }

  // ============ Recent Activity Widget ============

  async getRecentActivityWidget(projectId: string): Promise<RecentActivityWidgetDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get today's execution counts
    const todayResults = await this.testResultRepository
      .createQueryBuilder('result')
      .select('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.executed_at >= :todayStart', { todayStart })
      .groupBy('result.status')
      .getRawMany();

    let testsExecutedToday = 0;
    let passedToday = 0;
    let failedToday = 0;

    for (const row of todayResults) {
      const count = parseInt(row.count, 10);
      testsExecutedToday += count;
      if (row.status === TestStatus.PASSED) {
        passedToday = count;
      } else if (row.status === TestStatus.FAILED) {
        failedToday = count;
      }
    }

    // Get recent executions with test case info
    const recentResults = await this.testResultRepository
      .createQueryBuilder('result')
      .select([
        'result.id',
        'result.testCaseId',
        'result.status',
        'result.executedBy',
        'result.executedAt',
      ])
      .innerJoin('result.testRun', 'testRun')
      .innerJoin('result.testCase', 'testCase')
      .addSelect('testCase.title')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.executed_at IS NOT NULL')
      .orderBy('result.executed_at', 'DESC')
      .take(10)
      .getRawMany();

    const recentExecutions: RecentActivityItemDto[] = recentResults.map((row) => ({
      id: row.result_id,
      testCaseId: row.result_testCaseId || row.result_test_case_id,
      testCaseTitle: row.testCase_title,
      status: row.result_status,
      executedBy: row.result_executedBy || row.result_executed_by,
      executedAt: new Date(row.result_executedAt || row.result_executed_at),
    }));

    return {
      testsExecutedToday,
      passedToday,
      failedToday,
      recentExecutions,
    };
  }

  // ============ Coverage Widget ============

  async getCoverageWidget(projectId: string): Promise<CoverageWidgetDto> {
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
        linkedTestCases: 0,
      };
    }

    const requirementIds = requirements.map((r) => r.id);

    // Get coverage stats
    const coverageResult = await this.coverageRepository
      .createQueryBuilder('coverage')
      .select('COUNT(DISTINCT coverage.requirement_id)', 'coveredCount')
      .addSelect('COUNT(DISTINCT coverage.test_case_id)', 'linkedCount')
      .where('coverage.requirement_id IN (:...ids)', { ids: requirementIds })
      .getRawOne();

    const coveredCount = parseInt(coverageResult.coveredCount, 10);
    const linkedTestCases = parseInt(coverageResult.linkedCount, 10);
    const uncoveredCount = totalRequirements - coveredCount;
    const coveragePercentage =
      totalRequirements > 0 ? Math.round((coveredCount / totalRequirements) * 100) : 0;

    return {
      totalRequirements,
      coveredRequirements: coveredCount,
      uncoveredRequirements: uncoveredCount,
      coveragePercentage,
      linkedTestCases,
    };
  }

  // ============ Defects Widget ============

  async getDefectsWidget(projectId: string): Promise<DefectsWidgetDto> {
    const resultsWithDefects = await this.testResultRepository
      .createQueryBuilder('result')
      .select(['result.id', 'result.defects', 'result.status', 'result.testCaseId'])
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.defects IS NOT NULL')
      .andWhere("result.defects != '[]'::jsonb")
      .getMany();

    const totalFailedTests = await this.testResultRepository
      .createQueryBuilder('result')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.status = :status', { status: TestStatus.FAILED })
      .getCount();

    const defectMap = new Map<string, { linkedTestResults: number; testCaseIds: Set<string> }>();
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

    const allDefects: TopDefectDto[] = Array.from(defectMap.entries()).map(([defectId, data]) => ({
      defectId,
      linkedTestResults: data.linkedTestResults,
      affectedTestCases: data.testCaseIds.size,
    }));

    allDefects.sort((a, b) => b.linkedTestResults - a.linkedTestResults);
    const topDefects = allDefects.slice(0, 5);

    return {
      totalDefects: allDefects.length,
      totalFailedTests,
      failedTestsWithDefects,
      failedTestsWithoutDefects: totalFailedTests - failedTestsWithDefects,
      topDefects,
    };
  }

  // ============ Trends Widget ============

  async getTrendsWidget(projectId: string, periodDays: number = 7): Promise<TrendsWidgetDto> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const dailyResults = await this.testResultRepository
      .createQueryBuilder('result')
      .select("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'date')
      .addSelect('result.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('result.testRun', 'testRun')
      .where('testRun.project_id = :projectId', { projectId })
      .andWhere('result.executed_at IS NOT NULL')
      .andWhere('result.executed_at >= :startDate', { startDate })
      .andWhere('result.executed_at <= :endDate', { endDate })
      .groupBy("TO_CHAR(result.executed_at, 'YYYY-MM-DD')")
      .addGroupBy('result.status')
      .orderBy("TO_CHAR(result.executed_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

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

    const trendData: TrendPointDto[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      passRate:
        data.testsExecuted > 0 ? Math.round((data.passed / data.testsExecuted) * 100) : 0,
      testsExecuted: data.testsExecuted,
    }));

    let averagePassRate = 0;
    let passRateTrend = 0;
    let totalTestsExecuted = 0;

    if (trendData.length > 0) {
      totalTestsExecuted = trendData.reduce((sum, d) => sum + d.testsExecuted, 0);
      const totalPassRate = trendData.reduce((sum, d) => sum + d.passRate, 0);
      averagePassRate = Math.round(totalPassRate / trendData.length);

      if (trendData.length >= 2) {
        const firstPassRate = trendData[0].passRate;
        const lastPassRate = trendData[trendData.length - 1].passRate;
        passRateTrend = lastPassRate - firstPassRate;
      }
    }

    return {
      periodDays,
      averagePassRate,
      passRateTrend,
      totalTestsExecuted,
      trendData,
    };
  }
}
