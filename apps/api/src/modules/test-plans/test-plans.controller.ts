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
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { TestPlansService } from './test-plans.service';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';
import { CreateTestPlanEntryDto } from './dto/create-test-plan-entry.dto';
import { UpdateTestPlanEntryDto } from './dto/update-test-plan-entry.dto';
import { AddEntriesDto } from './dto/add-entries.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('test-plans')
@Controller('projects/:projectId/test-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestPlansController {
  constructor(private readonly testPlansService: TestPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test plan' })
  @ApiCreatedResponse({ description: 'Test plan created successfully' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTestPlanDto: CreateTestPlanDto,
  ) {
    return this.testPlansService.create(projectId, createTestPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test plans for a project' })
  @ApiOkResponse({ description: 'List of test plans' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.testPlansService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test plan by ID' })
  @ApiOkResponse({ description: 'Test plan found' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testPlansService.findByIdOrFail(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test plan' })
  @ApiOkResponse({ description: 'Test plan updated successfully' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestPlanDto: UpdateTestPlanDto,
  ) {
    return this.testPlansService.update(projectId, id, updateTestPlanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test plan' })
  @ApiNoContentResponse({ description: 'Test plan deleted successfully' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testPlansService.delete(projectId, id);
  }

  @Get(':id/milestone')
  @ApiOperation({ summary: 'Get test plan with milestone details' })
  @ApiOkResponse({ description: 'Test plan with milestone retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  async getWithMilestone(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testPlansService.findByIdWithMilestone(projectId, id);
  }

  @Get(':id/entries')
  @ApiOperation({ summary: 'Get all entries for a test plan' })
  @ApiOkResponse({ description: 'List of test plan entries' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  async getEntries(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testPlansService.getEntries(projectId, id);
  }

  @Post(':id/entries')
  @ApiOperation({ summary: 'Add a single entry to a test plan' })
  @ApiCreatedResponse({ description: 'Entry added successfully' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  @ApiConflictResponse({ description: 'Test case already in test plan' })
  async addEntry(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTestPlanEntryDto: CreateTestPlanEntryDto,
  ) {
    return this.testPlansService.addEntry(projectId, id, createTestPlanEntryDto);
  }

  @Post(':id/entries/bulk')
  @ApiOperation({ summary: 'Add multiple entries to a test plan' })
  @ApiCreatedResponse({ description: 'Entries added successfully' })
  @ApiNotFoundResponse({ description: 'Test plan not found' })
  async addEntries(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addEntriesDto: AddEntriesDto,
  ) {
    return this.testPlansService.addEntries(projectId, id, addEntriesDto.testCaseIds);
  }

  @Patch(':id/entries/:entryId')
  @ApiOperation({ summary: 'Update a test plan entry' })
  @ApiOkResponse({ description: 'Entry updated successfully' })
  @ApiNotFoundResponse({ description: 'Test plan or entry not found' })
  async updateEntry(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
    @Body() updateTestPlanEntryDto: UpdateTestPlanEntryDto,
  ) {
    return this.testPlansService.updateEntry(
      projectId,
      id,
      entryId,
      updateTestPlanEntryDto,
    );
  }

  @Delete(':id/entries/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an entry from a test plan' })
  @ApiNoContentResponse({ description: 'Entry removed successfully' })
  @ApiNotFoundResponse({ description: 'Test plan or entry not found' })
  async removeEntry(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
  ) {
    return this.testPlansService.removeEntry(projectId, id, entryId);
  }
}
