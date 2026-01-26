import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DailyActivityDto {
  @ApiProperty({ example: '2024-01-15', description: 'Activity date' })
  date: string;

  @ApiProperty({ example: 25, description: 'Number of tests executed on this date' })
  testsExecuted: number;

  @ApiProperty({ example: 20, description: 'Number of passed tests' })
  passed: number;

  @ApiProperty({ example: 5, description: 'Number of failed tests' })
  failed: number;
}

export class TesterActivityDto {
  @ApiPropertyOptional({ example: 'user-123', description: 'User ID (null if not tracked)' })
  userId: string | null;

  @ApiProperty({ example: 50, description: 'Number of tests executed by this tester' })
  testsExecuted: number;

  @ApiProperty({ example: 40, description: 'Number of passed tests' })
  passed: number;

  @ApiProperty({ example: 10, description: 'Number of failed tests' })
  failed: number;

  @ApiProperty({ example: 80, description: 'Pass rate percentage' })
  passRate: number;
}

export class ActivityReportDto {
  @ApiProperty({ example: 'proj-123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ example: '2024-01-01', description: 'Report period start date' })
  periodStart: string;

  @ApiProperty({ example: '2024-01-31', description: 'Report period end date' })
  periodEnd: string;

  @ApiProperty({ example: 250, description: 'Total tests executed in period' })
  totalTestsExecuted: number;

  @ApiProperty({
    type: [DailyActivityDto],
    description: 'Daily test activity breakdown',
  })
  dailyActivity: DailyActivityDto[];

  @ApiProperty({
    type: [TesterActivityDto],
    description: 'Activity breakdown by tester',
  })
  testerActivity: TesterActivityDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Report generation timestamp' })
  generatedAt: Date;
}
