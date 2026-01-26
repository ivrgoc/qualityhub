import { ApiProperty } from '@nestjs/swagger';

export class TestExecutionWidgetDto {
  @ApiProperty({ example: 150, description: 'Total number of test cases in the project' })
  totalTestCases: number;

  @ApiProperty({ example: 120, description: 'Total number of test results across all runs' })
  totalExecuted: number;

  @ApiProperty({ example: 80, description: 'Number of passed tests' })
  passed: number;

  @ApiProperty({ example: 20, description: 'Number of failed tests' })
  failed: number;

  @ApiProperty({ example: 10, description: 'Number of blocked tests' })
  blocked: number;

  @ApiProperty({ example: 10, description: 'Number of remaining tests (untested, skipped, retest)' })
  remaining: number;

  @ApiProperty({ example: 80, description: 'Pass rate percentage (passed / executed)' })
  passRate: number;

  @ApiProperty({ example: 75, description: 'Execution progress percentage' })
  executionProgress: number;
}
