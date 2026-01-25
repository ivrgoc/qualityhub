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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ description: 'Project created successfully' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiOkResponse({ description: 'List of all projects' })
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiOkResponse({ description: 'Project found' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findByIdOrFail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ description: 'Project updated successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiNoContentResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.delete(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiCreatedResponse({ description: 'Member added successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({ description: 'User is already a member' })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addProjectMemberDto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(id, addProjectMemberDto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a project' })
  @ApiOkResponse({ description: 'List of project members' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getMembers(id);
  }

  @Get(':id/members/:userId')
  @ApiOperation({ summary: 'Get a specific member of a project' })
  @ApiOkResponse({ description: 'Project member found' })
  @ApiNotFoundResponse({ description: 'Project or member not found' })
  async getMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.getMember(id, userId);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update a member role in a project' })
  @ApiOkResponse({ description: 'Member role updated successfully' })
  @ApiNotFoundResponse({ description: 'Project or member not found' })
  async updateMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateProjectMemberDto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMember(id, userId, updateProjectMemberDto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiNoContentResponse({ description: 'Member removed successfully' })
  @ApiNotFoundResponse({ description: 'Project or member not found' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeMember(id, userId);
  }
}
