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
} from '@nestjs/swagger';
import { TestSuitesService } from './test-suites.service';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('test-suites')
@Controller('projects/:projectId/suites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestSuitesController {
  constructor(private readonly testSuitesService: TestSuitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test suite' })
  @ApiCreatedResponse({ description: 'Test suite created successfully' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTestSuiteDto: CreateTestSuiteDto,
  ) {
    return this.testSuitesService.create(projectId, createTestSuiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test suites for a project' })
  @ApiOkResponse({ description: 'List of test suites' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.testSuitesService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test suite by ID' })
  @ApiOkResponse({ description: 'Test suite found' })
  @ApiNotFoundResponse({ description: 'Test suite not found' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testSuitesService.findByIdOrFail(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test suite' })
  @ApiOkResponse({ description: 'Test suite updated successfully' })
  @ApiNotFoundResponse({ description: 'Test suite not found' })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestSuiteDto: UpdateTestSuiteDto,
  ) {
    return this.testSuitesService.update(projectId, id, updateTestSuiteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test suite' })
  @ApiNoContentResponse({ description: 'Test suite deleted successfully' })
  @ApiNotFoundResponse({ description: 'Test suite not found' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testSuitesService.delete(projectId, id);
  }

  @Post(':suiteId/sections')
  @ApiOperation({ summary: 'Create a new section in a test suite' })
  @ApiCreatedResponse({ description: 'Section created successfully' })
  @ApiNotFoundResponse({ description: 'Test suite not found' })
  async createSection(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('suiteId', ParseUUIDPipe) suiteId: string,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    return this.testSuitesService.createSection(
      projectId,
      suiteId,
      createSectionDto,
    );
  }

  @Get(':suiteId/sections')
  @ApiOperation({ summary: 'Get all sections in a test suite' })
  @ApiOkResponse({ description: 'List of sections' })
  @ApiNotFoundResponse({ description: 'Test suite not found' })
  async findSections(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('suiteId', ParseUUIDPipe) suiteId: string,
  ) {
    return this.testSuitesService.findSectionsBySuite(projectId, suiteId);
  }

  @Get(':suiteId/sections/:sectionId')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiOkResponse({ description: 'Section found' })
  @ApiNotFoundResponse({ description: 'Section not found' })
  async findSectionById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('suiteId', ParseUUIDPipe) suiteId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ) {
    return this.testSuitesService.findSectionByIdOrFail(
      projectId,
      suiteId,
      sectionId,
    );
  }

  @Patch(':suiteId/sections/:sectionId')
  @ApiOperation({ summary: 'Update a section' })
  @ApiOkResponse({ description: 'Section updated successfully' })
  @ApiNotFoundResponse({ description: 'Section not found' })
  async updateSection(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('suiteId', ParseUUIDPipe) suiteId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.testSuitesService.updateSection(
      projectId,
      suiteId,
      sectionId,
      updateSectionDto,
    );
  }

  @Delete(':suiteId/sections/:sectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a section' })
  @ApiNoContentResponse({ description: 'Section deleted successfully' })
  @ApiNotFoundResponse({ description: 'Section not found' })
  async deleteSection(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('suiteId', ParseUUIDPipe) suiteId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ) {
    return this.testSuitesService.deleteSection(projectId, suiteId, sectionId);
  }
}
