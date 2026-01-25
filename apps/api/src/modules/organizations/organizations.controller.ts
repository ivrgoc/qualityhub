import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiCreatedResponse({ description: 'Organization created successfully' })
  @ApiConflictResponse({ description: 'Organization with this slug already exists' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiOkResponse({ description: 'List of all organizations' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiOkResponse({ description: 'Organization found' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.findByIdOrFail(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiOkResponse({ description: 'Organization found' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.organizationsService.findBySlugOrFail(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization by ID' })
  @ApiOkResponse({ description: 'Organization updated successfully' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  @ApiConflictResponse({ description: 'Organization with this slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organization by ID' })
  @ApiNoContentResponse({ description: 'Organization deleted successfully' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.delete(id);
  }
}
