import { ApiProperty } from '@nestjs/swagger';
import { TestExecutionWidgetDto } from './test-execution-widget.dto';
import { TestRunsWidgetDto } from './test-runs-widget.dto';
import { RecentActivityWidgetDto } from './recent-activity-widget.dto';
import { CoverageWidgetDto } from './coverage-widget.dto';
import { DefectsWidgetDto } from './defects-widget.dto';
import { TrendsWidgetDto } from './trends-widget.dto';

export class ProjectDashboardDto {
  @ApiProperty({ example: 'proj-123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ type: TestExecutionWidgetDto, description: 'Test execution summary widget' })
  testExecution: TestExecutionWidgetDto;

  @ApiProperty({ type: TestRunsWidgetDto, description: 'Test runs summary widget' })
  testRuns: TestRunsWidgetDto;

  @ApiProperty({ type: RecentActivityWidgetDto, description: 'Recent activity widget' })
  recentActivity: RecentActivityWidgetDto;

  @ApiProperty({ type: CoverageWidgetDto, description: 'Requirement coverage widget' })
  coverage: CoverageWidgetDto;

  @ApiProperty({ type: DefectsWidgetDto, description: 'Defects summary widget' })
  defects: DefectsWidgetDto;

  @ApiProperty({ type: TrendsWidgetDto, description: 'Trends widget (last 7 days)' })
  trends: TrendsWidgetDto;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Dashboard generation timestamp' })
  generatedAt: Date;
}
