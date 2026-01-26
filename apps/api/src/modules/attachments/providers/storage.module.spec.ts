import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageModule } from './storage.module';
import { STORAGE_PROVIDER } from '../interfaces/storage.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

// Mock fs module for LocalStorageProvider
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(globalThis.Buffer.from('test')),
  },
}));

// Mock S3 client
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
}));

describe('StorageModule', () => {
  const createMockConfigService = (config: Record<string, string>) => ({
    get: jest.fn().mockImplementation((key: string) => config[key]),
  });

  describe('forRoot with local storage', () => {
    let module: TestingModule;

    beforeEach(async () => {
      const mockConfig = createMockConfigService({
        'storage.local.uploadDir': './test-uploads',
        UPLOAD_DIR: './test-uploads',
      });

      module = await Test.createTestingModule({
        imports: [StorageModule.forRoot({ type: 'local' })],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfig)
        .compile();
    });

    it('should provide LocalStorageProvider as STORAGE_PROVIDER', async () => {
      const storageProvider = module.get(STORAGE_PROVIDER);
      expect(storageProvider).toBeInstanceOf(LocalStorageProvider);
    });
  });

  describe('forRoot with s3 storage', () => {
    let module: TestingModule;

    beforeEach(async () => {
      const mockConfig = createMockConfigService({
        'storage.s3.bucket': 'test-bucket',
        'storage.s3.region': 'us-east-1',
        'storage.local.uploadDir': './test-uploads',
        UPLOAD_DIR: './test-uploads',
      });

      module = await Test.createTestingModule({
        imports: [StorageModule.forRoot({ type: 's3' })],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfig)
        .compile();
    });

    it('should provide S3StorageProvider as STORAGE_PROVIDER', async () => {
      const storageProvider = module.get(STORAGE_PROVIDER);
      expect(storageProvider).toBeInstanceOf(S3StorageProvider);
    });
  });

  describe('forRootAsync', () => {
    it('should use local storage when STORAGE_TYPE is local', async () => {
      const mockConfig = createMockConfigService({
        'storage.type': 'local',
        STORAGE_TYPE: 'local',
        'storage.local.uploadDir': './test-uploads',
        UPLOAD_DIR: './test-uploads',
      });

      const module = await Test.createTestingModule({
        imports: [StorageModule.forRootAsync()],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfig)
        .compile();

      const storageProvider = module.get(STORAGE_PROVIDER);
      expect(storageProvider).toBeInstanceOf(LocalStorageProvider);
    });

    it('should use s3 storage when STORAGE_TYPE is s3', async () => {
      const mockConfig = createMockConfigService({
        'storage.type': 's3',
        STORAGE_TYPE: 's3',
        'storage.s3.bucket': 'test-bucket',
        'storage.s3.region': 'us-east-1',
        'storage.local.uploadDir': './test-uploads',
        UPLOAD_DIR: './test-uploads',
      });

      const module = await Test.createTestingModule({
        imports: [StorageModule.forRootAsync()],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfig)
        .compile();

      const storageProvider = module.get(STORAGE_PROVIDER);
      expect(storageProvider).toBeInstanceOf(S3StorageProvider);
    });

    it('should default to local storage when STORAGE_TYPE is not set', async () => {
      const mockConfig = createMockConfigService({
        'storage.local.uploadDir': './test-uploads',
        UPLOAD_DIR: './test-uploads',
      });

      const module = await Test.createTestingModule({
        imports: [StorageModule.forRootAsync()],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfig)
        .compile();

      const storageProvider = module.get(STORAGE_PROVIDER);
      expect(storageProvider).toBeInstanceOf(LocalStorageProvider);
    });
  });
});
