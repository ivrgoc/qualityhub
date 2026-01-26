import { ApiProperty } from '@nestjs/swagger';

export class RecentActivityItemDto {
  @ApiProperty({ example: 'result-123', description: 'Test result ID' })
  id: string;

  @ApiProperty({ example: 'case-456', description: 'Test case ID' })
  testCaseId: string;

  @ApiProperty({ example: 'Login with valid credentials', description: 'Test case title' })
  testCaseTitle: string;

  @ApiProperty({ example: 'passed', description: 'Test result status' })
  status: string;

  @ApiProperty({ example: 'user-789', description: 'User who executed the test', nullable: true })
  executedBy: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Execution timestamp' })
  executedAt: Date;
}

export class RecentActivityWidgetDto {
  @ApiProperty({ example: 50, description: 'Total tests executed today' })
  testsExecutedToday: number;

  @ApiProperty({ example: 45, description: 'Tests passed today' })
  passedToday: number;

  @ApiProperty({ example: 5, description: 'Tests failed today' })
  failedToday: number;

  @ApiProperty({ type: [RecentActivityItemDto], description: 'Recent test executions (max 10)' })
  recentExecutions: RecentActivityItemDto[];
}
