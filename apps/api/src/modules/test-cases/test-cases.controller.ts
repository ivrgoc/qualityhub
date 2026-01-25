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
} from '@nestjs/swagger';
import { TestCasesService } from './test-cases.service';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { BulkCreateTestCasesDto } from './dto/bulk-create-test-cases.dto';
import { BulkUpdateTestCasesDto } from './dto/bulk-update-test-cases.dto';
import { BulkDeleteTestCasesDto } from './dto/bulk-delete-test-cases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('test-cases')
@Controller('projects/:projectId/cases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test case' })
  @ApiCreatedResponse({ description: 'Test case created successfully' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTestCaseDto: CreateTestCaseDto,
    @CurrentUser() user: User,
  ) {
    return this.testCasesService.create(projectId, createTestCaseDto, user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test cases for a project' })
  @ApiOkResponse({ description: 'List of test cases' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.testCasesService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test case by ID' })
  @ApiOkResponse({ description: 'Test case found' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testCasesService.findByIdOrFail(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test case' })
  @ApiOkResponse({ description: 'Test case updated successfully' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
    @CurrentUser() user: User,
  ) {
    return this.testCasesService.update(
      projectId,
      id,
      updateTestCaseDto,
      user?.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test case' })
  @ApiNoContentResponse({ description: 'Test case deleted successfully' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testCasesService.delete(projectId, id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get version history for a test case' })
  @ApiOkResponse({ description: 'List of test case versions' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  async getHistory(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testCasesService.getHistory(projectId, id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create test cases' })
  @ApiCreatedResponse({ description: 'Test cases created successfully' })
  async bulkCreate(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() bulkCreateDto: BulkCreateTestCasesDto,
    @CurrentUser() user: User,
  ) {
    return this.testCasesService.bulkCreate(
      projectId,
      bulkCreateDto.testCases,
      user?.id,
    );
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update test cases' })
  @ApiOkResponse({ description: 'Test cases updated successfully' })
  async bulkUpdate(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() bulkUpdateDto: BulkUpdateTestCasesDto,
    @CurrentUser() user: User,
  ) {
    return this.testCasesService.bulkUpdate(
      projectId,
      bulkUpdateDto.testCases,
      user?.id,
    );
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete test cases' })
  @ApiOkResponse({ description: 'Test cases deleted successfully' })
  async bulkDelete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() bulkDeleteDto: BulkDeleteTestCasesDto,
  ) {
    return this.testCasesService.bulkDelete(projectId, bulkDeleteDto.ids);
  }
}
