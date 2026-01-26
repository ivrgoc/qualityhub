import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../interfaces/storage.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

export type StorageType = 'local' | 's3';

export interface StorageModuleOptions {
  type?: StorageType;
}

@Module({})
export class StorageModule {
  static forRoot(options?: StorageModuleOptions): DynamicModule {
    const storageProvider = this.createStorageProvider(options?.type);

    return {
      module: StorageModule,
      imports: [ConfigModule],
      providers: [storageProvider, LocalStorageProvider, S3StorageProvider],
      exports: [STORAGE_PROVIDER, LocalStorageProvider, S3StorageProvider],
      global: true,
    };
  }

  static forRootAsync(): DynamicModule {
    const storageProvider: Provider = {
      provide: STORAGE_PROVIDER,
      useFactory: (
        configService: ConfigService,
        localProvider: LocalStorageProvider,
        s3Provider: S3StorageProvider,
      ) => {
        const storageType =
          configService.get<StorageType>('storage.type') ||
          (configService.get<string>('STORAGE_TYPE') as StorageType) ||
          'local';

        switch (storageType) {
          case 's3':
            return s3Provider;
          case 'local':
          default:
            return localProvider;
        }
      },
      inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
    };

    return {
      module: StorageModule,
      imports: [ConfigModule],
      providers: [storageProvider, LocalStorageProvider, S3StorageProvider],
      exports: [STORAGE_PROVIDER, LocalStorageProvider, S3StorageProvider],
      global: true,
    };
  }

  private static createStorageProvider(type?: StorageType): Provider {
    return {
      provide: STORAGE_PROVIDER,
      useFactory: (
        configService: ConfigService,
        localProvider: LocalStorageProvider,
        s3Provider: S3StorageProvider,
      ) => {
        const storageType =
          type ||
          configService.get<StorageType>('storage.type') ||
          (configService.get<string>('STORAGE_TYPE') as StorageType) ||
          'local';

        switch (storageType) {
          case 's3':
            return s3Provider;
          case 'local':
          default:
            return localProvider;
        }
      },
      inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
    };
  }
}
