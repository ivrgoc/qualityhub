import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import {
  StorageProvider,
  STORAGE_PROVIDER,
  UploadedFile,
} from './interfaces/storage.interface';

describe('StorageService', () => {
  let service: StorageService;
  let mockProvider: jest.Mocked<StorageProvider>;

  beforeEach(async () => {
    mockProvider = {
      saveFile: jest.fn(),
      deleteFile: jest.fn(),
      getFile: jest.fn(),
      getFullPath: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: STORAGE_PROVIDER,
          useValue: mockProvider,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    const validFile: UploadedFile = {
      buffer: globalThis.Buffer.from('test file content'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    };

    it('should delegate to storage provider', async () => {
      const storedFile = {
        path: '2024/01/mocked-uuid.png',
        size: 1024,
        mimeType: 'image/png',
        originalFilename: 'test.png',
      };
      mockProvider.saveFile.mockResolvedValue(storedFile);

      const result = await service.saveFile(validFile);

      expect(mockProvider.saveFile).toHaveBeenCalledWith(validFile);
      expect(result).toEqual(storedFile);
    });
  });

  describe('deleteFile', () => {
    it('should delegate to storage provider', async () => {
      mockProvider.deleteFile.mockResolvedValue(undefined);

      await service.deleteFile('2024/01/test.png');

      expect(mockProvider.deleteFile).toHaveBeenCalledWith('2024/01/test.png');
    });
  });

  describe('getFile', () => {
    it('should delegate to storage provider', async () => {
      const fileContent = globalThis.Buffer.from('file content');
      mockProvider.getFile.mockResolvedValue(fileContent);

      const result = await service.getFile('2024/01/test.png');

      expect(mockProvider.getFile).toHaveBeenCalledWith('2024/01/test.png');
      expect(result).toEqual(fileContent);
    });
  });

  describe('getFullPath', () => {
    it('should delegate to storage provider', () => {
      mockProvider.getFullPath.mockReturnValue('./uploads/2024/01/test.png');

      const result = service.getFullPath('2024/01/test.png');

      expect(mockProvider.getFullPath).toHaveBeenCalledWith('2024/01/test.png');
      expect(result).toBe('./uploads/2024/01/test.png');
    });
  });

  describe('exists', () => {
    it('should delegate to storage provider', async () => {
      mockProvider.exists.mockResolvedValue(true);

      const result = await service.exists('2024/01/test.png');

      expect(mockProvider.exists).toHaveBeenCalledWith('2024/01/test.png');
      expect(result).toBe(true);
    });
  });
});
