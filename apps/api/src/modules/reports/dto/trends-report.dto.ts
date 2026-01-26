import { ApiProperty } from '@nestjs/swagger';

export class TrendDataPointDto {
  @ApiProperty({ example: '2024-01-15', description: 'Date of the data point' })
  date: string;

  @ApiProperty({ example: 85, description: 'Pass rate percentage' })
  passRate: number;

  @ApiProperty({ example: 50, description: 'Total tests executed' })
  testsExecuted: number;

  @ApiProperty({ example: 42, description: 'Number of passed tests' })
  passed: number;

  @ApiProperty({ example: 8, description: 'Number of failed tests' })
  failed: number;
}

export class DefectTrendDataPointDto {
  @ApiProperty({ example: '2024-01-15', description: 'Date of the data point' })
  date: string;

  @ApiProperty({ example: 5, description: 'Number of new defects found on this date' })
  newDefects: number;

  @ApiProperty({ example: 3, description: 'Cumulative count of unique defects' })
  cumulativeDefects: number;
}

export class TrendsReportDto {
  @ApiProperty({ example: 'proj-123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ example: '2024-01-01', description: 'Report period start date' })
  periodStart: string;

  @ApiProperty({ example: '2024-01-31', description: 'Report period end date' })
  periodEnd: string;

  @ApiProperty({
    type: [TrendDataPointDto],
    description: 'Daily pass rate and execution trends',
  })
  executionTrends: TrendDataPointDto[];

  @ApiProperty({
    type: [DefectTrendDataPointDto],
    description: 'Daily defect discovery trends',
  })
  defectTrends: DefectTrendDataPointDto[];

  @ApiProperty({ example: 75, description: 'Average pass rate over the period' })
  averagePassRate: number;

  @ApiProperty({ example: 82, description: 'Pass rate trend (positive = improving, negative = declining)' })
  passRateTrend: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Report generation timestamp' })
  generatedAt: Date;
}
