import { ApiProperty } from '@nestjs/swagger';

export class TopDefectDto {
  @ApiProperty({ example: 'DEF-123', description: 'Defect identifier' })
  defectId: string;

  @ApiProperty({ example: 5, description: 'Number of test results linked to this defect' })
  linkedTestResults: number;

  @ApiProperty({ example: 3, description: 'Number of unique test cases affected' })
  affectedTestCases: number;
}

export class DefectsWidgetDto {
  @ApiProperty({ example: 15, description: 'Total number of unique defects' })
  totalDefects: number;

  @ApiProperty({ example: 25, description: 'Total number of failed tests' })
  totalFailedTests: number;

  @ApiProperty({ example: 20, description: 'Failed tests with linked defects' })
  failedTestsWithDefects: number;

  @ApiProperty({ example: 5, description: 'Failed tests without linked defects' })
  failedTestsWithoutDefects: number;

  @ApiProperty({ type: [TopDefectDto], description: 'Top defects by impact (max 5)' })
  topDefects: TopDefectDto[];
}
