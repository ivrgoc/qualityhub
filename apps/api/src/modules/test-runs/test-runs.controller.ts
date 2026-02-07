import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { TestRunsService } from './test-runs.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { UpdateTestRunDto } from './dto/update-test-run.dto';
import { CreateTestResultDto } from './dto/create-test-result.dto';
import { UpdateTestResultDto } from './dto/update-test-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('test-runs')
@Controller('projects/:projectId/runs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestRunsController {
  constructor(private readonly testRunsService: TestRunsService) {}

  // ============ Test Run Endpoints ============

  @Post()
  @ApiOperation({ summary: 'Create a new test run' })
  @ApiCreatedResponse({ description: 'Test run created successfully' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTestRunDto: CreateTestRunDto,
  ) {
    return this.testRunsService.create(projectId, createTestRunDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test runs for a project' })
  @ApiOkResponse({ description: 'List of test runs' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.testRunsService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test run by ID' })
  @ApiOkResponse({ description: 'Test run found' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.findByIdOrFail(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test run' })
  @ApiOkResponse({ description: 'Test run updated successfully' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestRunDto: UpdateTestRunDto,
  ) {
    return this.testRunsService.update(projectId, id, updateTestRunDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test run' })
  @ApiNoContentResponse({ description: 'Test run deleted successfully' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.delete(projectId, id);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a test run' })
  @ApiOkResponse({ description: 'Test run started' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async startRun(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.startRun(projectId, id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a test run' })
  @ApiOkResponse({ description: 'Test run completed' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async completeRun(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.completeRun(projectId, id);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a test run' })
  @ApiOkResponse({ description: 'Test run closed' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async closeRun(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.closeRun(projectId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get test run progress' })
  @ApiOkResponse({ description: 'Test run progress' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async getProgress(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.getProgress(projectId, id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get test run statistics' })
  @ApiOkResponse({ description: 'Test run statistics' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async getStatistics(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.getRunStatistics(projectId, id);
  }

  // ============ Test Result Endpoints ============

  @Get(':id/results')
  @ApiOperation({ summary: 'Get all results for a test run' })
  @ApiOkResponse({ description: 'List of test results' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  async getResults(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.getResults(projectId, id);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Add a test result to the run' })
  @ApiCreatedResponse({ description: 'Test result added successfully' })
  @ApiNotFoundResponse({ description: 'Test run not found' })
  @ApiConflictResponse({ description: 'Result for this test case already exists' })
  async addResult(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTestResultDto: CreateTestResultDto,
  ) {
    return this.testRunsService.addResult(projectId, id, createTestResultDto);
  }

  @Get(':id/results/:resultId')
  @ApiOperation({ summary: 'Get a specific test result' })
  @ApiOkResponse({ description: 'Test result found' })
  @ApiNotFoundResponse({ description: 'Test result not found' })
  async getResult(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('resultId', ParseUUIDPipe) resultId: string,
  ) {
    return this.testRunsService.findResultByIdOrFail(projectId, id, resultId);
  }

  @Patch(':id/results/:resultId')
  @ApiOperation({ summary: 'Update a test result' })
  @ApiOkResponse({ description: 'Test result updated successfully' })
  @ApiNotFoundResponse({ description: 'Test result not found' })
  async updateResult(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('resultId', ParseUUIDPipe) resultId: string,
    @Body() updateTestResultDto: UpdateTestResultDto,
  ) {
    return this.testRunsService.updateResult(projectId, id, resultId, updateTestResultDto);
  }

  @Delete(':id/results/:resultId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test result' })
  @ApiNoContentResponse({ description: 'Test result deleted successfully' })
  @ApiNotFoundResponse({ description: 'Test result not found' })
  async deleteResult(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('resultId', ParseUUIDPipe) resultId: string,
  ) {
    return this.testRunsService.deleteResult(projectId, id, resultId);
  }
}
