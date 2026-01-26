import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { Multer } from 'multer';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { Attachment, EntityType } from './entities/attachment.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

describe('AttachmentsController', () => {
  let controller: AttachmentsController;
  let service: jest.Mocked<AttachmentsService>;

  const mockAttachment: Attachment = {
    id: 'att-123',
    entityType: EntityType.TEST_CASE,
    entityId: 'tc-123',
    filename: 'screenshot.png',
    path: '2024/01/uuid-123.png',
    size: 102400,
    mimeType: 'image/png',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentsController],
      providers: [
        {
          provide: AttachmentsService,
          useValue: {
            create: jest.fn(),
            uploadAndCreate: jest.fn(),
            findAll: jest.fn(),
            findByEntity: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getFileBuffer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AttachmentsController>(AttachmentsController);
    service = module.get(AttachmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createAttachmentDto: CreateAttachmentDto = {
      entityType: EntityType.TEST_CASE,
      entityId: 'tc-123',
      filename: 'screenshot.png',
      path: '2024/01/uuid-123.png',
      size: 102400,
      mimeType: 'image/png',
    };

    it('should create a new attachment', async () => {
      const newAttachment = { ...mockAttachment, ...createAttachmentDto };
      service.create.mockResolvedValue(newAttachment);

      const result = await controller.create(createAttachmentDto);

      expect(service.create).toHaveBeenCalledWith(createAttachmentDto);
      expect(result).toEqual(newAttachment);
    });
  });

  describe('upload', () => {
    const mockFile = {
      buffer: globalThis.Buffer.from('test file content'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    } as Multer.File;

    it('should upload file and create attachment', async () => {
      const newAttachment = {
        ...mockAttachment,
        filename: 'test.png',
        size: 1024,
      };
      service.uploadAndCreate.mockResolvedValue(newAttachment);

      const result = await controller.upload(
        mockFile,
        EntityType.TEST_CASE,
        'tc-123',
      );

      expect(service.uploadAndCreate).toHaveBeenCalledWith(
        EntityType.TEST_CASE,
        'tc-123',
        {
          buffer: mockFile.buffer,
          originalname: mockFile.originalname,
          mimetype: mockFile.mimetype,
          size: mockFile.size,
        },
      );
      expect(result).toEqual(newAttachment);
    });
  });

  describe('findAll', () => {
    it('should return all attachments', async () => {
      const attachments = [mockAttachment];
      service.findAll.mockResolvedValue(attachments);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(attachments);
    });

    it('should return empty array when no attachments exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByEntity', () => {
    it('should return attachments for a specific entity', async () => {
      const attachments = [mockAttachment];
      service.findByEntity.mockResolvedValue(attachments);

      const result = await controller.findByEntity(EntityType.TEST_CASE, 'tc-123');

      expect(service.findByEntity).toHaveBeenCalledWith(
        EntityType.TEST_CASE,
        'tc-123',
      );
      expect(result).toEqual(attachments);
    });

    it('should return empty array when no attachments exist for entity', async () => {
      service.findByEntity.mockResolvedValue([]);

      const result = await controller.findByEntity(EntityType.TEST_CASE, 'tc-999');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return an attachment by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockAttachment);

      const result = await controller.findById('att-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('att-123');
      expect(result).toEqual(mockAttachment);
    });

    it('should throw NotFoundException when attachment not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Attachment with ID non-existent not found'),
      );

      await expect(controller.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('download', () => {
    it('should download attachment file', async () => {
      const fileBuffer = globalThis.Buffer.from('file content');
      service.getFileBuffer.mockResolvedValue({
        buffer: fileBuffer,
        attachment: mockAttachment,
      });

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.download('att-123', mockResponse);

      expect(service.getFileBuffer).toHaveBeenCalledWith('att-123');
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="screenshot.png"',
        'Content-Length': fileBuffer.length,
      });
      expect(mockResponse.send).toHaveBeenCalledWith(fileBuffer);
    });

    it('should throw NotFoundException when attachment not found', async () => {
      service.getFileBuffer.mockRejectedValue(
        new NotFoundException('Attachment with ID non-existent not found'),
      );

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.download('non-existent', mockResponse),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateAttachmentDto: UpdateAttachmentDto = {
      filename: 'renamed-screenshot.png',
    };

    it('should update an attachment', async () => {
      const updatedAttachment = {
        ...mockAttachment,
        filename: 'renamed-screenshot.png',
      };
      service.update.mockResolvedValue(updatedAttachment);

      const result = await controller.update('att-123', updateAttachmentDto);

      expect(service.update).toHaveBeenCalledWith('att-123', updateAttachmentDto);
      expect(result).toEqual(updatedAttachment);
      expect(result.filename).toBe('renamed-screenshot.png');
    });

    it('should throw NotFoundException when attachment not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Attachment with ID non-existent not found'),
      );

      await expect(
        controller.update('non-existent', updateAttachmentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an attachment', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('att-123');

      expect(service.delete).toHaveBeenCalledWith('att-123');
    });

    it('should throw NotFoundException when attachment not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Attachment with ID non-existent not found'),
      );

      await expect(controller.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
