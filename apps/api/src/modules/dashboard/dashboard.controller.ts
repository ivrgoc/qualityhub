import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  ProjectDashboardDto,
  TestExecutionWidgetDto,
  TestRunsWidgetDto,
  RecentActivityWidgetDto,
  CoverageWidgetDto,
  DefectsWidgetDto,
  TrendsWidgetDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('projects/:projectId/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get complete project dashboard with all widgets' })
  @ApiOkResponse({
    description: 'Complete dashboard with test execution, runs, activity, coverage, defects, and trends',
    type: ProjectDashboardDto,
  })
  async getDashboard(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<ProjectDashboardDto> {
    return this.dashboardService.getProjectDashboard(projectId);
  }

  @Get('widgets/test-execution')
  @ApiOperation({ summary: 'Get test execution summary widget' })
  @ApiOkResponse({
    description: 'Test execution summary with pass/fail counts and progress',
    type: TestExecutionWidgetDto,
  })
  async getTestExecutionWidget(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<TestExecutionWidgetDto> {
    return this.dashboardService.getTestExecutionWidget(projectId);
  }

  @Get('widgets/test-runs')
  @ApiOperation({ summary: 'Get test runs summary widget' })
  @ApiOkResponse({
    description: 'Test runs summary with active runs and their progress',
    type: TestRunsWidgetDto,
  })
  async getTestRunsWidget(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<TestRunsWidgetDto> {
    return this.dashboardService.getTestRunsWidget(projectId);
  }

  @Get('widgets/recent-activity')
  @ApiOperation({ summary: 'Get recent activity widget' })
  @ApiOkResponse({
    description: 'Recent test executions and today activity summary',
    type: RecentActivityWidgetDto,
  })
  async getRecentActivityWidget(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<RecentActivityWidgetDto> {
    return this.dashboardService.getRecentActivityWidget(projectId);
  }

  @Get('widgets/coverage')
  @ApiOperation({ summary: 'Get requirement coverage widget' })
  @ApiOkResponse({
    description: 'Requirement coverage summary',
    type: CoverageWidgetDto,
  })
  async getCoverageWidget(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<CoverageWidgetDto> {
    return this.dashboardService.getCoverageWidget(projectId);
  }

  @Get('widgets/defects')
  @ApiOperation({ summary: 'Get defects summary widget' })
  @ApiOkResponse({
    description: 'Defects summary with top defects by impact',
    type: DefectsWidgetDto,
  })
  async getDefectsWidget(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<DefectsWidgetDto> {
    return this.dashboardService.getDefectsWidget(projectId);
  }

  @Get('widgets/trends')
  @ApiOperation({ summary: 'Get trends widget' })
  @ApiOkResponse({
    description: 'Pass rate and execution trends over time',
    type: TrendsWidgetDto,
  })
  @ApiQuery({
    name: 'periodDays',
    required: false,
    type: Number,
    description: 'Number of days for trend analysis (default: 7)',
    example: 7,
  })
  async getTrendsWidget(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('periodDays') periodDays?: string,
  ): Promise<TrendsWidgetDto> {
    const days = periodDays ? parseInt(periodDays, 10) : 7;
    return this.dashboardService.getTrendsWidget(projectId, days);
  }
}
