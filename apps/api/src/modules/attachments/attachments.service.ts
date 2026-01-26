import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment, EntityType } from './entities/attachment.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { StorageService, UploadedFile } from './storage.service';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly storageService: StorageService,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const attachment = this.attachmentRepository.create(createAttachmentDto);
    return this.attachmentRepository.save(attachment);
  }

  async uploadAndCreate(
    entityType: EntityType,
    entityId: string,
    file: UploadedFile,
  ): Promise<Attachment> {
    const storedFile = await this.storageService.saveFile(file);

    const attachment = this.attachmentRepository.create({
      entityType,
      entityId,
      filename: storedFile.originalFilename,
      path: storedFile.path,
      size: storedFile.size,
      mimeType: storedFile.mimeType,
    });

    return this.attachmentRepository.save(attachment);
  }

  async findAll(): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Attachment | null> {
    return this.attachmentRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<Attachment> {
    const attachment = await this.findById(id);
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }
    return attachment;
  }

  async update(
    id: string,
    updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment> {
    const attachment = await this.findByIdOrFail(id);
    Object.assign(attachment, updateAttachmentDto);
    return this.attachmentRepository.save(attachment);
  }

  async delete(id: string): Promise<void> {
    const attachment = await this.findByIdOrFail(id);

    await this.storageService.deleteFile(attachment.path);

    await this.attachmentRepository.delete(attachment.id);
  }

  async deleteByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    const attachments = await this.findByEntity(entityType, entityId);

    for (const attachment of attachments) {
      await this.storageService.deleteFile(attachment.path);
    }

    await this.attachmentRepository.delete({ entityType, entityId });
  }

  async getFileBuffer(id: string): Promise<{ buffer: globalThis.Buffer; attachment: Attachment }> {
    const attachment = await this.findByIdOrFail(id);
    const buffer = await this.storageService.getFile(attachment.path);
    return { buffer, attachment };
  }
}
