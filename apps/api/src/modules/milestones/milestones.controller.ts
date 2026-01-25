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
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('milestones')
@Controller('projects/:projectId/milestones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new milestone' })
  @ApiCreatedResponse({ description: 'Milestone created successfully' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(projectId, createMilestoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all milestones for a project' })
  @ApiOkResponse({ description: 'List of milestones' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.milestonesService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a milestone by ID' })
  @ApiOkResponse({ description: 'Milestone found' })
  @ApiNotFoundResponse({ description: 'Milestone not found' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.milestonesService.findByIdOrFail(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiOkResponse({ description: 'Milestone updated successfully' })
  @ApiNotFoundResponse({ description: 'Milestone not found' })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.update(projectId, id, updateMilestoneDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiNoContentResponse({ description: 'Milestone deleted successfully' })
  @ApiNotFoundResponse({ description: 'Milestone not found' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.milestonesService.delete(projectId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get milestone progress' })
  @ApiOkResponse({ description: 'Milestone progress retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Milestone not found' })
  async getProgress(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.milestonesService.getProgress(projectId, id);
  }

  @Get(':id/test-plans')
  @ApiOperation({ summary: 'Get milestone with test plans' })
  @ApiOkResponse({ description: 'Milestone with test plans retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Milestone not found' })
  async getWithTestPlans(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.milestonesService.findByIdWithTestPlans(projectId, id);
  }
}
