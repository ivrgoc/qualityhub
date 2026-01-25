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
import { TestCasesService } from './test-cases.service';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
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
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTestCaseDto: CreateTestCaseDto,
    @CurrentUser() user: User,
  ) {
    return this.testCasesService.create(projectId, createTestCaseDto, user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test cases for a project' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.testCasesService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test case by ID' })
  async findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testCasesService.findById(projectId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test case' })
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.testCasesService.delete(projectId, id);
  }
}
