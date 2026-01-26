import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';
import { LocalStorageProvider } from './local-storage.provider';
import { UploadedFile } from '../interfaces/storage.interface';

const mockWriteFile = jest.fn().mockResolvedValue(undefined);
const mockUnlink = jest.fn().mockResolvedValue(undefined);
const mockReadFile = jest
  .fn()
  .mockResolvedValue(globalThis.Buffer.from('test content'));
const mockExistsSync = jest.fn().mockReturnValue(true);
const mockMkdirSync = jest.fn().mockReturnValue(undefined);

jest.mock('fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
  promises: {
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    unlink: (...args: unknown[]) => mockUnlink(...args),
    readFile: (...args: unknown[]) => mockReadFile(...args),
  },
}));

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: () => 'mocked-uuid-123',
}));

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;
  let configService: jest.Mocked<ConfigService>;

  const mockUploadDir = './test-uploads';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockExistsSync.mockReturnValue(true);
    mockMkdirSync.mockReturnValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(globalThis.Buffer.from('test content'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStorageProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (
                key === 'storage.local.uploadDir' ||
                key === 'UPLOAD_DIR'
              ) {
                return mockUploadDir;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<LocalStorageProvider>(LocalStorageProvider);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('constructor', () => {
    it('should use configured upload directory', () => {
      expect(configService.get).toHaveBeenCalledWith('storage.local.uploadDir');
    });

    it('should create upload directory if it does not exist', async () => {
      mockExistsSync.mockReturnValueOnce(false);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocalStorageProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(mockUploadDir),
            },
          },
        ],
      }).compile();

      module.get<LocalStorageProvider>(LocalStorageProvider);

      expect(mockMkdirSync).toHaveBeenCalledWith(mockUploadDir, {
        recursive: true,
      });
    });
  });

  describe('saveFile', () => {
    const validFile: UploadedFile = {
      buffer: globalThis.Buffer.from('test file content'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    };

    it('should save file and return stored file info', async () => {
      mockExistsSync.mockReturnValue(true);

      const result = await provider.saveFile(validFile);

      expect(mockWriteFile).toHaveBeenCalled();
      expect(result.mimeType).toBe('image/png');
      expect(result.size).toBe(1024);
      expect(result.originalFilename).toBe('test.png');
      expect(result.path).toContain('mocked-uuid-123.png');
    });

    it('should create subdirectory with year/month structure when it does not exist', async () => {
      mockExistsSync.mockImplementation((p: string) => {
        if (typeof p === 'string' && p.includes('/')) {
          return false;
        }
        return true;
      });

      await provider.saveFile(validFile);

      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('test-uploads'),
        { recursive: true },
      );
    });

    it('should throw BadRequestException for file exceeding max size', async () => {
      const largeFile: UploadedFile = {
        ...validFile,
        size: 60 * 1024 * 1024, // 60MB
      };

      await expect(provider.saveFile(largeFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(provider.saveFile(largeFile)).rejects.toThrow(
        'File size exceeds maximum allowed size of 50MB',
      );
    });

    it('should throw BadRequestException for disallowed mime type', async () => {
      const invalidFile: UploadedFile = {
        ...validFile,
        mimetype: 'application/x-executable',
      };

      await expect(provider.saveFile(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(provider.saveFile(invalidFile)).rejects.toThrow(
        'File type application/x-executable is not allowed',
      );
    });

    it('should allow all supported mime types', async () => {
      const supportedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/json',
        'application/xml',
        'application/zip',
        'video/mp4',
        'video/webm',
      ];

      for (const mimeType of supportedTypes) {
        mockExistsSync.mockReturnValue(true);
        mockWriteFile.mockResolvedValue(undefined);
        const file: UploadedFile = { ...validFile, mimetype: mimeType };

        await expect(provider.saveFile(file)).resolves.toBeDefined();
      }
    });
  });

  describe('deleteFile', () => {
    it('should delete file if it exists', async () => {
      mockExistsSync.mockReturnValue(true);

      await provider.deleteFile('2024/01/test.png');

      expect(mockUnlink).toHaveBeenCalledWith(
        path.join(mockUploadDir, '2024/01/test.png'),
      );
    });

    it('should not throw error if file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(
        provider.deleteFile('2024/01/non-existent.png'),
      ).resolves.not.toThrow();
      expect(mockUnlink).not.toHaveBeenCalled();
    });
  });

  describe('getFile', () => {
    it('should return file buffer if file exists', async () => {
      const fileContent = globalThis.Buffer.from('file content');
      mockExistsSync.mockReturnValue(true);
      mockReadFile.mockResolvedValue(fileContent);

      const result = await provider.getFile('2024/01/test.png');

      expect(result).toEqual(fileContent);
      expect(mockReadFile).toHaveBeenCalledWith(
        path.join(mockUploadDir, '2024/01/test.png'),
      );
    });

    it('should throw BadRequestException if file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(
        provider.getFile('2024/01/non-existent.png'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        provider.getFile('2024/01/non-existent.png'),
      ).rejects.toThrow('File not found');
    });
  });

  describe('getFullPath', () => {
    it('should return full path for relative path', () => {
      const result = provider.getFullPath('2024/01/test.png');

      expect(result).toBe(path.join(mockUploadDir, '2024/01/test.png'));
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      mockExistsSync.mockReturnValue(true);

      const result = await provider.exists('2024/01/test.png');

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await provider.exists('2024/01/non-existent.png');

      expect(result).toBe(false);
    });
  });
});
