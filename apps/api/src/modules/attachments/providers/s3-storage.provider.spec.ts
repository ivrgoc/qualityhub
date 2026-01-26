import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { S3StorageProvider } from './s3-storage.provider';
import { UploadedFile } from '../interfaces/storage.interface';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => ({
      type: 'PutObjectCommand',
      ...params,
    })),
    GetObjectCommand: jest.fn().mockImplementation((params) => ({
      type: 'GetObjectCommand',
      ...params,
    })),
    DeleteObjectCommand: jest.fn().mockImplementation((params) => ({
      type: 'DeleteObjectCommand',
      ...params,
    })),
    HeadObjectCommand: jest.fn().mockImplementation((params) => ({
      type: 'HeadObjectCommand',
      ...params,
    })),
  };
});

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: () => 'mocked-uuid-123',
}));

describe('S3StorageProvider', () => {
  let provider: S3StorageProvider;

  const mockBucket = 'test-bucket';
  const mockRegion = 'us-east-1';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, string> = {
                'storage.s3.bucket': mockBucket,
                'storage.s3.region': mockRegion,
                'storage.s3.accessKeyId': 'test-access-key',
                'storage.s3.secretAccessKey': 'test-secret-key',
                AWS_S3_BUCKET: mockBucket,
                AWS_REGION: mockRegion,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<S3StorageProvider>(S3StorageProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('saveFile', () => {
    const validFile: UploadedFile = {
      buffer: globalThis.Buffer.from('test file content'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    };

    it('should save file to S3 and return stored file info', async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.saveFile(validFile);

      expect(mockSend).toHaveBeenCalled();
      expect(result.mimeType).toBe('image/png');
      expect(result.size).toBe(1024);
      expect(result.originalFilename).toBe('test.png');
      expect(result.path).toContain('mocked-uuid-123.png');
    });

    it('should use year/month path structure', async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.saveFile(validFile);

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      expect(result.path).toContain(`${year}/${month}/`);
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
  });

  describe('deleteFile', () => {
    it('should delete file from S3', async () => {
      mockSend.mockResolvedValue({});

      await provider.deleteFile('2024/01/test.png');

      expect(mockSend).toHaveBeenCalled();
      const command = mockSend.mock.calls[0][0];
      expect(command.type).toBe('DeleteObjectCommand');
      expect(command.Bucket).toBe(mockBucket);
      expect(command.Key).toBe('2024/01/test.png');
    });
  });

  describe('getFile', () => {
    it('should return file buffer from S3', async () => {
      const fileContent = globalThis.Buffer.from('file content');
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield fileContent;
        },
      };
      mockSend.mockResolvedValue({ Body: mockStream });

      const result = await provider.getFile('2024/01/test.png');

      expect(result).toEqual(fileContent);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should throw BadRequestException if file does not exist', async () => {
      const error = new Error('NoSuchKey');
      (error as { name: string }).name = 'NoSuchKey';
      mockSend.mockRejectedValue(error);

      await expect(provider.getFile('2024/01/non-existent.png')).rejects.toThrow(
        BadRequestException,
      );
      await expect(provider.getFile('2024/01/non-existent.png')).rejects.toThrow(
        'File not found',
      );
    });

    it('should throw BadRequestException if Body is empty', async () => {
      mockSend.mockResolvedValue({ Body: null });

      await expect(
        provider.getFile('2024/01/test.png'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFullPath', () => {
    it('should return S3 URL for relative path', () => {
      const result = provider.getFullPath('2024/01/test.png');

      expect(result).toBe(
        `https://${mockBucket}.s3.${mockRegion}.amazonaws.com/2024/01/test.png`,
      );
    });
  });

  describe('exists', () => {
    it('should return true if file exists in S3', async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.exists('2024/01/test.png');

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return false if file does not exist in S3', async () => {
      const error = new Error('NoSuchKey');
      (error as { name: string }).name = 'NoSuchKey';
      mockSend.mockRejectedValue(error);

      const result = await provider.exists('2024/01/non-existent.png');

      expect(result).toBe(false);
    });
  });
});

describe('S3StorageProvider without bucket configured', () => {
  let provider: S3StorageProvider;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    provider = module.get<S3StorageProvider>(S3StorageProvider);
  });

  it('should throw BadRequestException when saving without bucket configured', async () => {
    const file: UploadedFile = {
      buffer: globalThis.Buffer.from('test'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    };

    await expect(provider.saveFile(file)).rejects.toThrow(BadRequestException);
    await expect(provider.saveFile(file)).rejects.toThrow(
      'S3 bucket not configured',
    );
  });

  it('should throw BadRequestException when deleting without bucket configured', async () => {
    await expect(provider.deleteFile('test.png')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when getting without bucket configured', async () => {
    await expect(provider.getFile('test.png')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return false for exists without bucket configured', async () => {
    const result = await provider.exists('test.png');
    expect(result).toBe(false);
  });
});
