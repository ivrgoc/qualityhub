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
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { AddCoverageDto } from './dto/add-coverage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('requirements')
@Controller('projects/:projectId/requirements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  // ============ Requirement Endpoints ============

  @Post()
  @ApiOperation({ summary: 'Create a new requirement' })
  @ApiCreatedResponse({ description: 'Requirement created successfully' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createRequirementDto: CreateRequirementDto,
  ) {
    return this.requirementsService.create(projectId, createRequirementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requirements for a project' })
  @ApiOkResponse({ description: 'List of requirements' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.requirementsService.findAllByProject(projectId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get coverage statistics for all requirements in a project' })
  @ApiOkResponse({ description: 'Project coverage statistics' })
  async getProjectStatistics(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.requirementsService.getProjectCoverageStatistics(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a requirement by ID' })
  @ApiOkResponse({ description: 'Requirement found' })
  @ApiNotFoundResponse({ description: 'Requirement not found' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requirementsService.findByIdOrFail(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a requirement' })
  @ApiOkResponse({ description: 'Requirement updated successfully' })
  @ApiNotFoundResponse({ description: 'Requirement not found' })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequirementDto: UpdateRequirementDto,
  ) {
    return this.requirementsService.update(projectId, id, updateRequirementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a requirement' })
  @ApiNoContentResponse({ description: 'Requirement deleted successfully' })
  @ApiNotFoundResponse({ description: 'Requirement not found' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requirementsService.delete(projectId, id);
  }

  // ============ Coverage Endpoints ============

  @Get(':id/coverage')
  @ApiOperation({ summary: 'Get all test case coverages for a requirement' })
  @ApiOkResponse({ description: 'List of coverage entries' })
  @ApiNotFoundResponse({ description: 'Requirement not found' })
  async getCoverage(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requirementsService.getCoverage(projectId, id);
  }

  @Post(':id/coverage')
  @ApiOperation({ summary: 'Add test case coverage to a requirement' })
  @ApiCreatedResponse({ description: 'Coverage entries added successfully' })
  @ApiNotFoundResponse({ description: 'Requirement not found' })
  async addCoverage(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addCoverageDto: AddCoverageDto,
  ) {
    return this.requirementsService.addCoverage(projectId, id, addCoverageDto.testCaseIds);
  }

  @Delete(':id/coverage/:testCaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove test case coverage from a requirement' })
  @ApiNoContentResponse({ description: 'Coverage removed successfully' })
  @ApiNotFoundResponse({ description: 'Requirement or coverage not found' })
  async removeCoverage(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('testCaseId', ParseUUIDPipe) testCaseId: string,
  ) {
    return this.requirementsService.removeCoverage(projectId, id, testCaseId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get coverage statistics for a requirement' })
  @ApiOkResponse({ description: 'Requirement coverage statistics' })
  @ApiNotFoundResponse({ description: 'Requirement not found' })
  async getStatistics(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requirementsService.getCoverageStatistics(projectId, id);
  }
}
