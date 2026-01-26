import { ApiProperty } from '@nestjs/swagger';

export class ActiveRunDto {
  @ApiProperty({ example: 'run-123', description: 'Test run ID' })
  id: string;

  @ApiProperty({ example: 'Regression Test Run #5', description: 'Test run name' })
  name: string;

  @ApiProperty({ example: 'in_progress', description: 'Test run status' })
  status: string;

  @ApiProperty({ example: 65, description: 'Progress percentage' })
  progress: number;

  @ApiProperty({ example: 'user-456', description: 'Assignee user ID', nullable: true })
  assigneeId: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Run start timestamp', nullable: true })
  startedAt: Date | null;
}

export class TestRunsWidgetDto {
  @ApiProperty({ example: 10, description: 'Total number of test runs' })
  total: number;

  @ApiProperty({ example: 3, description: 'Number of active runs (in progress)' })
  activeCount: number;

  @ApiProperty({ example: 5, description: 'Number of completed runs' })
  completedCount: number;

  @ApiProperty({ example: 2, description: 'Number of pending runs (not started)' })
  pendingCount: number;

  @ApiProperty({ type: [ActiveRunDto], description: 'List of active test runs (max 5)' })
  activeRuns: ActiveRunDto[];
}
