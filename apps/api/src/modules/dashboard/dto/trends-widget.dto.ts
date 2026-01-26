import { ApiProperty } from '@nestjs/swagger';

export class TrendPointDto {
  @ApiProperty({ example: '2024-01-15', description: 'Date (YYYY-MM-DD format)' })
  date: string;

  @ApiProperty({ example: 85, description: 'Pass rate percentage for this date' })
  passRate: number;

  @ApiProperty({ example: 50, description: 'Number of tests executed on this date' })
  testsExecuted: number;
}

export class TrendsWidgetDto {
  @ApiProperty({ example: 7, description: 'Number of days in the trend period' })
  periodDays: number;

  @ApiProperty({ example: 82, description: 'Average pass rate over the period' })
  averagePassRate: number;

  @ApiProperty({ example: 5, description: 'Pass rate trend (positive = improving, negative = declining)' })
  passRateTrend: number;

  @ApiProperty({ example: 350, description: 'Total tests executed in the period' })
  totalTestsExecuted: number;

  @ApiProperty({ type: [TrendPointDto], description: 'Daily trend data points' })
  trendData: TrendPointDto[];
}
