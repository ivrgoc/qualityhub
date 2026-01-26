import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  StorageProvider,
  StoredFile,
  UploadedFile,
} from '../interfaces/storage.interface';

const ALLOWED_MIME_TYPES = [
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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('storage.local.uploadDir') ||
      this.configService.get<string>('UPLOAD_DIR') ||
      './uploads';
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: UploadedFile): Promise<StoredFile> {
    this.validateFile(file);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const subDir = path.join(this.uploadDir, String(year), month);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(subDir, uniqueFilename);

    await fs.promises.writeFile(filePath, file.buffer);

    const relativePath = path.relative(this.uploadDir, filePath);

    return {
      path: relativePath,
      size: file.size,
      mimeType: file.mimetype,
      originalFilename: file.originalname,
    };
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, relativePath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async getFile(relativePath: string): Promise<globalThis.Buffer> {
    const fullPath = path.join(this.uploadDir, relativePath);

    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException('File not found');
    }

    return fs.promises.readFile(fullPath);
  }

  getFullPath(relativePath: string): string {
    return path.join(this.uploadDir, relativePath);
  }

  async exists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, relativePath);
    return fs.existsSync(fullPath);
  }

  private validateFile(file: UploadedFile): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }
  }
}
