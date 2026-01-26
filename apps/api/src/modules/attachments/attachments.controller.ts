import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Multer } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { EntityType } from './entities/attachment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('attachments')
@Controller('attachments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an attachment record' })
  @ApiCreatedResponse({ description: 'Attachment created successfully' })
  async create(
    @Body() createAttachmentDto: CreateAttachmentDto,
  ) {
    return this.attachmentsService.create(createAttachmentDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file and create attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string', enum: Object.values(EntityType) },
        entityId: { type: 'string', format: 'uuid' },
      },
      required: ['file', 'entityType', 'entityId'],
    },
  })
  @ApiCreatedResponse({ description: 'File uploaded successfully' })
  async upload(
    @UploadedFile() file: Multer.File,
    @Body('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @Body('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.attachmentsService.uploadAndCreate(entityType, entityId, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all attachments' })
  @ApiOkResponse({ description: 'List of attachments' })
  async findAll() {
    return this.attachmentsService.findAll();
  }

  @Get('by-entity')
  @ApiOperation({ summary: 'Get attachments for a specific entity' })
  @ApiQuery({ name: 'entityType', enum: EntityType })
  @ApiQuery({ name: 'entityId', type: 'string' })
  @ApiOkResponse({ description: 'List of attachments for the entity' })
  async findByEntity(
    @Query('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @Query('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.attachmentsService.findByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attachment by ID' })
  @ApiOkResponse({ description: 'Attachment found' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.findByIdOrFail(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download attachment file' })
  @ApiOkResponse({ description: 'File downloaded' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { buffer, attachment } = await this.attachmentsService.getFileBuffer(id);

    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attachment metadata' })
  @ApiOkResponse({ description: 'Attachment updated successfully' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ) {
    return this.attachmentsService.update(id, updateAttachmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete attachment' })
  @ApiNoContentResponse({ description: 'Attachment deleted successfully' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.delete(id);
  }
}
