import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  ProjectSummaryDto,
  CoverageReportDto,
  DefectsReportDto,
  ActivityReportDto,
  TrendsReportDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('projects/:projectId/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get project summary report' })
  @ApiOkResponse({
    description: 'Project summary with test execution, test runs, and coverage metrics',
    type: ProjectSummaryDto,
  })
  async getSummary(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<ProjectSummaryDto> {
    return this.reportsService.getProjectSummary(projectId);
  }

  @Get('coverage')
  @ApiOperation({ summary: 'Get requirement coverage report' })
  @ApiOkResponse({
    description: 'Detailed requirement coverage report',
    type: CoverageReportDto,
  })
  async getCoverage(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<CoverageReportDto> {
    return this.reportsService.getCoverageReport(projectId);
  }

  @Get('defects')
  @ApiOperation({ summary: 'Get defects report' })
  @ApiOkResponse({
    description: 'Defects summary with linked test results',
    type: DefectsReportDto,
  })
  async getDefects(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<DefectsReportDto> {
    return this.reportsService.getDefectsReport(projectId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get test activity report' })
  @ApiOkResponse({
    description: 'Test activity report with daily and tester breakdown',
    type: ActivityReportDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for the report period (ISO format, e.g., 2024-01-01)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for the report period (ISO format, e.g., 2024-01-31)',
    example: '2024-01-31',
  })
  async getActivity(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ActivityReportDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getActivityReport(projectId, start, end);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get test execution and defect trends report' })
  @ApiOkResponse({
    description: 'Trends report with pass rate and defect trends over time',
    type: TrendsReportDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for the report period (ISO format, e.g., 2024-01-01)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for the report period (ISO format, e.g., 2024-01-31)',
    example: '2024-01-31',
  })
  async getTrends(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TrendsReportDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getTrends(projectId, start, end);
  }
}
