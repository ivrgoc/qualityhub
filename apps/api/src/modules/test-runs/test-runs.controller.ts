import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestRunsService } from './test-runs.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('test-runs')
@Controller('projects/:projectId/runs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestRunsController {
  constructor(private readonly testRunsService: TestRunsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test run' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTestRunDto: CreateTestRunDto,
  ) {
    return this.testRunsService.create(projectId, createTestRunDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test runs for a project' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.testRunsService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test run by ID' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.findById(projectId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test run' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testRunsService.delete(projectId, id);
  }
}
