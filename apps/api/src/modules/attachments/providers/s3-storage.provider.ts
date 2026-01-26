import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';
import { Readable } from 'stream';
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
export class S3StorageProvider implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.region =
      this.configService.get<string>('storage.s3.region') ||
      this.configService.get<string>('AWS_REGION') ||
      'us-east-1';

    this.bucket =
      this.configService.get<string>('storage.s3.bucket') ||
      this.configService.get<string>('AWS_S3_BUCKET') ||
      '';

    this.endpoint =
      this.configService.get<string>('storage.s3.endpoint') ||
      this.configService.get<string>('AWS_S3_ENDPOINT');

    const accessKeyId =
      this.configService.get<string>('storage.s3.accessKeyId') ||
      this.configService.get<string>('AWS_ACCESS_KEY_ID');

    const secretAccessKey =
      this.configService.get<string>('storage.s3.secretAccessKey') ||
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: this.region,
    };

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    if (this.endpoint) {
      clientConfig.endpoint = this.endpoint;
      clientConfig.forcePathStyle = true; // Required for MinIO and other S3-compatible services
    }

    this.s3Client = new S3Client(clientConfig);

    if (!this.bucket) {
      this.logger.warn(
        'S3 bucket not configured. Set AWS_S3_BUCKET environment variable.',
      );
    }
  }

  async saveFile(file: UploadedFile): Promise<StoredFile> {
    this.validateFile(file);

    if (!this.bucket) {
      throw new BadRequestException('S3 bucket not configured');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const ext = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;
    const key = `${year}/${month}/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalFilename: encodeURIComponent(file.originalname),
      },
    });

    await this.s3Client.send(command);

    return {
      path: key,
      size: file.size,
      mimeType: file.mimetype,
      originalFilename: file.originalname,
    };
  }

  async deleteFile(relativePath: string): Promise<void> {
    if (!this.bucket) {
      throw new BadRequestException('S3 bucket not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: relativePath,
    });

    await this.s3Client.send(command);
  }

  async getFile(relativePath: string): Promise<globalThis.Buffer> {
    if (!this.bucket) {
      throw new BadRequestException('S3 bucket not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: relativePath,
    });

    try {
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new BadRequestException('File not found');
      }

      return this.streamToBuffer(response.Body as Readable);
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') {
        throw new BadRequestException('File not found');
      }
      throw error;
    }
  }

  getFullPath(relativePath: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${relativePath}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${relativePath}`;
  }

  async exists(relativePath: string): Promise<boolean> {
    if (!this.bucket) {
      return false;
    }

    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: relativePath,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  private async streamToBuffer(
    stream: Readable,
  ): Promise<globalThis.Buffer> {
    const chunks: globalThis.Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as globalThis.Buffer);
    }
    return globalThis.Buffer.concat(chunks);
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
