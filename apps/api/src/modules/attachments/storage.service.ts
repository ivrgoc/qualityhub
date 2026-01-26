import { Injectable, Inject } from '@nestjs/common';
import {
  StorageProvider,
  StoredFile,
  UploadedFile,
  STORAGE_PROVIDER,
} from './interfaces/storage.interface';

// Re-export types for backward compatibility
export { StoredFile, UploadedFile } from './interfaces/storage.interface';

/**
 * StorageService is a facade that delegates to the configured storage provider.
 * It maintains backward compatibility while allowing the underlying storage
 * implementation to be swapped between local filesystem and S3.
 */
@Injectable()
export class StorageService implements StorageProvider {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async saveFile(file: UploadedFile): Promise<StoredFile> {
    return this.storageProvider.saveFile(file);
  }

  async deleteFile(relativePath: string): Promise<void> {
    return this.storageProvider.deleteFile(relativePath);
  }

  async getFile(relativePath: string): Promise<globalThis.Buffer> {
    return this.storageProvider.getFile(relativePath);
  }

  getFullPath(relativePath: string): string {
    return this.storageProvider.getFullPath(relativePath);
  }

  async exists(relativePath: string): Promise<boolean> {
    return this.storageProvider.exists(relativePath);
  }
}
