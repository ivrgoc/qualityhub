import { ApiProperty } from '@nestjs/swagger';
import { TestStatus } from '../../test-runs/entities/test-result.entity';

export class ActivityItemDto {
  @ApiProperty({ example: 'act-123', description: 'Activity item ID' })
  id: string;

  @ApiProperty({
    enum: ['test_execution', 'test_run_started', 'test_run_completed', 'milestone_completed'],
    example: 'test_execution',
    description: 'Type of activity',
  })
  type: 'test_execution' | 'test_run_started' | 'test_run_completed' | 'milestone_completed';

  @ApiProperty({ example: 'Login Test', description: 'Title or description of the activity' })
  title: string;

  @ApiProperty({
    enum: TestStatus,
    example: TestStatus.PASSED,
    description: 'Status of the activity (for test executions)',
    required: false,
  })
  status?: TestStatus;

  @ApiProperty({ example: 'user-123', description: 'ID of the user who performed the activity' })
  userId: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the user who performed the activity', required: false })
  userName?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Timestamp of the activity' })
  timestamp: Date;

  @ApiProperty({ example: 'case-123', description: 'Related entity ID (test case, test run, milestone)', required: false })
  entityId?: string;

  @ApiProperty({ example: 'run-123', description: 'Test run ID (for test executions)', required: false })
  testRunId?: string;
}

export class ActivityDto {
  @ApiProperty({ example: 50, description: 'Total number of activities today' })
  totalToday: number;

  @ApiProperty({ example: 40, description: 'Number of tests executed today' })
  testsExecutedToday: number;

  @ApiProperty({ example: 30, description: 'Number of passed tests today' })
  passedToday: number;

  @ApiProperty({ example: 10, description: 'Number of failed tests today' })
  failedToday: number;

  @ApiProperty({ type: [ActivityItemDto], description: 'List of recent activity items' })
  recentActivity: ActivityItemDto[];
}
