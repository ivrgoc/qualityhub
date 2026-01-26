import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { Attachment, EntityType } from './entities/attachment.entity';
import { StorageService } from './storage.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let attachmentRepository: jest.Mocked<Repository<Attachment>>;
  let storageService: jest.Mocked<StorageService>;

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
      providers: [
        AttachmentsService,
        {
          provide: getRepositoryToken(Attachment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            saveFile: jest.fn(),
            deleteFile: jest.fn(),
            getFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    attachmentRepository = module.get(getRepositoryToken(Attachment));
    storageService = module.get(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      attachmentRepository.create.mockReturnValue(newAttachment);
      attachmentRepository.save.mockResolvedValue(newAttachment);

      const result = await service.create(createAttachmentDto);

      expect(attachmentRepository.create).toHaveBeenCalledWith(createAttachmentDto);
      expect(attachmentRepository.save).toHaveBeenCalledWith(newAttachment);
      expect(result).toEqual(newAttachment);
    });
  });

  describe('uploadAndCreate', () => {
    const mockFile = {
      buffer: globalThis.Buffer.from('test file content'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    };

    it('should upload file and create attachment', async () => {
      const storedFile = {
        path: '2024/01/uuid-new.png',
        size: 1024,
        mimeType: 'image/png',
        originalFilename: 'test.png',
      };
      const newAttachment = {
        ...mockAttachment,
        filename: 'test.png',
        path: storedFile.path,
        size: storedFile.size,
      };

      storageService.saveFile.mockResolvedValue(storedFile);
      attachmentRepository.create.mockReturnValue(newAttachment);
      attachmentRepository.save.mockResolvedValue(newAttachment);

      const result = await service.uploadAndCreate(
        EntityType.TEST_CASE,
        'tc-123',
        mockFile,
      );

      expect(storageService.saveFile).toHaveBeenCalledWith(mockFile);
      expect(attachmentRepository.create).toHaveBeenCalledWith({
        entityType: EntityType.TEST_CASE,
        entityId: 'tc-123',
        filename: storedFile.originalFilename,
        path: storedFile.path,
        size: storedFile.size,
        mimeType: storedFile.mimeType,
      });
      expect(attachmentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newAttachment);
    });
  });

  describe('findAll', () => {
    it('should return all attachments', async () => {
      const attachments = [mockAttachment];
      attachmentRepository.find.mockResolvedValue(attachments);

      const result = await service.findAll();

      expect(attachmentRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(attachments);
    });

    it('should return empty array when no attachments exist', async () => {
      attachmentRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByEntity', () => {
    it('should return attachments for a specific entity', async () => {
      const attachments = [mockAttachment];
      attachmentRepository.find.mockResolvedValue(attachments);

      const result = await service.findByEntity(EntityType.TEST_CASE, 'tc-123');

      expect(attachmentRepository.find).toHaveBeenCalledWith({
        where: { entityType: EntityType.TEST_CASE, entityId: 'tc-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(attachments);
    });

    it('should return empty array when no attachments exist for entity', async () => {
      attachmentRepository.find.mockResolvedValue([]);

      const result = await service.findByEntity(EntityType.TEST_CASE, 'tc-999');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find an attachment by id', async () => {
      attachmentRepository.findOne.mockResolvedValue(mockAttachment);

      const result = await service.findById('att-123');

      expect(attachmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'att-123' },
      });
      expect(result).toEqual(mockAttachment);
    });

    it('should return null when attachment not found', async () => {
      attachmentRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find an attachment by id', async () => {
      attachmentRepository.findOne.mockResolvedValue(mockAttachment);

      const result = await service.findByIdOrFail('att-123');

      expect(result).toEqual(mockAttachment);
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        'Attachment with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const updateAttachmentDto: UpdateAttachmentDto = {
      filename: 'renamed-screenshot.png',
    };

    it('should update an existing attachment', async () => {
      const existingAttachment = { ...mockAttachment };
      const updatedAttachment = {
        ...existingAttachment,
        filename: 'renamed-screenshot.png',
      };
      attachmentRepository.findOne.mockResolvedValue({ ...existingAttachment });
      attachmentRepository.save.mockResolvedValue(updatedAttachment);

      const result = await service.update('att-123', updateAttachmentDto);

      expect(attachmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'att-123' },
      });
      expect(attachmentRepository.save).toHaveBeenCalled();
      expect(result.filename).toBe('renamed-screenshot.png');
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateAttachmentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an attachment and its file', async () => {
      attachmentRepository.findOne.mockResolvedValue(mockAttachment);
      storageService.deleteFile.mockResolvedValue(undefined);
      attachmentRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.delete('att-123');

      expect(attachmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'att-123' },
      });
      expect(storageService.deleteFile).toHaveBeenCalledWith(mockAttachment.path);
      expect(attachmentRepository.delete).toHaveBeenCalledWith('att-123');
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteByEntity', () => {
    it('should delete all attachments for an entity', async () => {
      const attachments = [
        mockAttachment,
        { ...mockAttachment, id: 'att-124', path: '2024/01/uuid-124.png' },
      ];
      attachmentRepository.find.mockResolvedValue(attachments);
      storageService.deleteFile.mockResolvedValue(undefined);
      attachmentRepository.delete.mockResolvedValue({ affected: 2 } as DeleteResult);

      await service.deleteByEntity(EntityType.TEST_CASE, 'tc-123');

      expect(attachmentRepository.find).toHaveBeenCalledWith({
        where: { entityType: EntityType.TEST_CASE, entityId: 'tc-123' },
        order: { createdAt: 'DESC' },
      });
      expect(storageService.deleteFile).toHaveBeenCalledTimes(2);
      expect(attachmentRepository.delete).toHaveBeenCalledWith({
        entityType: EntityType.TEST_CASE,
        entityId: 'tc-123',
      });
    });

    it('should handle case when no attachments exist for entity', async () => {
      attachmentRepository.find.mockResolvedValue([]);
      attachmentRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await service.deleteByEntity(EntityType.TEST_CASE, 'tc-999');

      expect(storageService.deleteFile).not.toHaveBeenCalled();
      expect(attachmentRepository.delete).toHaveBeenCalledWith({
        entityType: EntityType.TEST_CASE,
        entityId: 'tc-999',
      });
    });
  });

  describe('getFileBuffer', () => {
    it('should return file buffer and attachment', async () => {
      const fileBuffer = globalThis.Buffer.from('file content');
      attachmentRepository.findOne.mockResolvedValue(mockAttachment);
      storageService.getFile.mockResolvedValue(fileBuffer);

      const result = await service.getFileBuffer('att-123');

      expect(attachmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'att-123' },
      });
      expect(storageService.getFile).toHaveBeenCalledWith(mockAttachment.path);
      expect(result.buffer).toEqual(fileBuffer);
      expect(result.attachment).toEqual(mockAttachment);
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findOne.mockResolvedValue(null);

      await expect(service.getFileBuffer('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
