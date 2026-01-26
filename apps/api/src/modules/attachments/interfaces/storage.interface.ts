export interface StoredFile {
  path: string;
  size: number;
  mimeType: string;
  originalFilename: string;
}

export interface UploadedFile {
  buffer: globalThis.Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface StorageProvider {
  /**
   * Save a file to storage
   * @param file The uploaded file to save
   * @returns Information about the stored file
   */
  saveFile(file: UploadedFile): Promise<StoredFile>;

  /**
   * Delete a file from storage
   * @param relativePath The relative path to the file
   */
  deleteFile(relativePath: string): Promise<void>;

  /**
   * Get a file from storage
   * @param relativePath The relative path to the file
   * @returns The file buffer
   */
  getFile(relativePath: string): Promise<globalThis.Buffer>;

  /**
   * Get the full path or URL for a file
   * @param relativePath The relative path to the file
   * @returns The full path (local) or URL (S3)
   */
  getFullPath(relativePath: string): string;

  /**
   * Check if a file exists in storage
   * @param relativePath The relative path to the file
   * @returns True if file exists
   */
  exists(relativePath: string): Promise<boolean>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
