import { ApiProperty } from '@nestjs/swagger';

export class StatsDto {
  @ApiProperty({ example: 100, description: 'Total number of test cases in the project' })
  totalTestCases: number;

  @ApiProperty({ example: 80, description: 'Total number of executed tests' })
  totalExecuted: number;

  @ApiProperty({ example: 60, description: 'Number of passed tests' })
  passed: number;

  @ApiProperty({ example: 15, description: 'Number of failed tests' })
  failed: number;

  @ApiProperty({ example: 5, description: 'Number of blocked tests' })
  blocked: number;

  @ApiProperty({ example: 20, description: 'Number of remaining tests (untested + skipped + retest)' })
  remaining: number;

  @ApiProperty({ example: 75, description: 'Pass rate percentage (passed / totalExecuted * 100)' })
  passRate: number;

  @ApiProperty({ example: 80, description: 'Execution progress percentage' })
  executionProgress: number;

  @ApiProperty({ example: 10, description: 'Total number of test runs' })
  totalTestRuns: number;

  @ApiProperty({ example: 2, description: 'Number of active test runs (in progress)' })
  activeTestRuns: number;

  @ApiProperty({ example: 5, description: 'Number of completed test runs' })
  completedTestRuns: number;

  @ApiProperty({ example: 50, description: 'Total number of requirements' })
  totalRequirements: number;

  @ApiProperty({ example: 80, description: 'Requirement coverage percentage' })
  coveragePercentage: number;

  @ApiProperty({ example: 3, description: 'Number of unique defects linked to test results' })
  totalDefects: number;

  @ApiProperty({ example: 5, description: 'Number of failed tests with linked defects' })
  failedTestsWithDefects: number;
}
