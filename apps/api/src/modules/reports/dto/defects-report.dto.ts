import { ApiProperty } from '@nestjs/swagger';

export class DefectSummaryDto {
  @ApiProperty({ example: 'DEF-123', description: 'Defect ID' })
  defectId: string;

  @ApiProperty({ example: 5, description: 'Number of test results linked to this defect' })
  linkedTestResults: number;

  @ApiProperty({ example: 3, description: 'Number of unique test cases affected' })
  affectedTestCases: number;
}

export class DefectsReportDto {
  @ApiProperty({ example: 'proj-123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ example: 15, description: 'Total number of unique defects' })
  totalDefects: number;

  @ApiProperty({ example: 45, description: 'Total number of failed test results' })
  totalFailedTests: number;

  @ApiProperty({ example: 30, description: 'Number of failed tests linked to defects' })
  failedTestsWithDefects: number;

  @ApiProperty({ example: 15, description: 'Number of failed tests without defects' })
  failedTestsWithoutDefects: number;

  @ApiProperty({
    type: [DefectSummaryDto],
    description: 'Summary of each defect',
  })
  defects: DefectSummaryDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Report generation timestamp' })
  generatedAt: Date;
}
