import { ApiProperty } from '@nestjs/swagger';

export enum TodoItemType {
  ASSIGNED_TEST_RUN = 'assigned_test_run',
  OVERDUE_MILESTONE = 'overdue_milestone',
  UPCOMING_MILESTONE = 'upcoming_milestone',
  BLOCKED_TEST = 'blocked_test',
  FAILED_TEST_REVIEW = 'failed_test_review',
}

export enum TodoPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class TodoItemDto {
  @ApiProperty({ example: 'todo-123', description: 'Todo item ID' })
  id: string;

  @ApiProperty({
    enum: TodoItemType,
    example: TodoItemType.ASSIGNED_TEST_RUN,
    description: 'Type of todo item',
  })
  type: TodoItemType;

  @ApiProperty({ example: 'Complete Regression Test Run', description: 'Title of the todo item' })
  title: string;

  @ApiProperty({ example: 'Execute remaining 20 test cases', description: 'Description of the todo item', required: false })
  description?: string;

  @ApiProperty({
    enum: TodoPriority,
    example: TodoPriority.HIGH,
    description: 'Priority of the todo item',
  })
  priority: TodoPriority;

  @ApiProperty({ example: '2024-01-20T00:00:00.000Z', description: 'Due date if applicable', required: false })
  dueDate?: Date;

  @ApiProperty({ example: 'run-123', description: 'Related entity ID (test run, milestone, etc.)' })
  entityId: string;

  @ApiProperty({ example: 65, description: 'Progress percentage (for test runs)', required: false })
  progress?: number;

  @ApiProperty({ example: 20, description: 'Remaining items count (tests to execute, etc.)', required: false })
  remainingCount?: number;
}

export class TodoDto {
  @ApiProperty({ example: 5, description: 'Total number of todo items' })
  totalItems: number;

  @ApiProperty({ example: 2, description: 'Number of urgent items (overdue or critical)' })
  urgentCount: number;

  @ApiProperty({ type: [TodoItemDto], description: 'List of todo items sorted by priority and due date' })
  items: TodoItemDto[];
}
