import { ApiProperty } from '@nestjs/swagger';

export class TestExecutionSummaryDto {
  @ApiProperty({ example: 150, description: 'Total number of test cases' })
  totalTestCases: number;

  @ApiProperty({ example: 120, description: 'Total number of test results' })
  totalTestResults: number;

  @ApiProperty({ example: 80, description: 'Number of passed tests' })
  passed: number;

  @ApiProperty({ example: 20, description: 'Number of failed tests' })
  failed: number;

  @ApiProperty({ example: 10, description: 'Number of blocked tests' })
  blocked: number;

  @ApiProperty({ example: 5, description: 'Number of skipped tests' })
  skipped: number;

  @ApiProperty({ example: 5, description: 'Number of tests needing retest' })
  retest: number;

  @ApiProperty({ example: 30, description: 'Number of untested tests' })
  untested: number;

  @ApiProperty({ example: 80, description: 'Pass rate percentage' })
  passRate: number;

  @ApiProperty({ example: 75, description: 'Execution progress percentage' })
  executionProgress: number;
}

export class TestRunSummaryDto {
  @ApiProperty({ example: 10, description: 'Total number of test runs' })
  total: number;

  @ApiProperty({ example: 2, description: 'Number of runs not started' })
  notStarted: number;

  @ApiProperty({ example: 3, description: 'Number of runs in progress' })
  inProgress: number;

  @ApiProperty({ example: 4, description: 'Number of completed runs' })
  completed: number;

  @ApiProperty({ example: 1, description: 'Number of aborted runs' })
  aborted: number;
}

export class RequirementCoverageSummaryDto {
  @ApiProperty({ example: 25, description: 'Total number of requirements' })
  totalRequirements: number;

  @ApiProperty({ example: 20, description: 'Number of covered requirements' })
  coveredRequirements: number;

  @ApiProperty({ example: 5, description: 'Number of uncovered requirements' })
  uncoveredRequirements: number;

  @ApiProperty({ example: 80, description: 'Coverage percentage' })
  coveragePercentage: number;
}

export class ProjectSummaryDto {
  @ApiProperty({ example: 'proj-123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ type: TestExecutionSummaryDto, description: 'Test execution summary' })
  testExecution: TestExecutionSummaryDto;

  @ApiProperty({ type: TestRunSummaryDto, description: 'Test run summary' })
  testRuns: TestRunSummaryDto;

  @ApiProperty({ type: RequirementCoverageSummaryDto, description: 'Requirement coverage summary' })
  requirementCoverage: RequirementCoverageSummaryDto;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Report generation timestamp' })
  generatedAt: Date;
}
