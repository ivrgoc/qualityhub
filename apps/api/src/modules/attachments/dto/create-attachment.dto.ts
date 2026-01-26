import {
  IsString,
  IsEnum,
  IsUUID,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from '../entities/attachment.entity';

export class CreateAttachmentDto {
  @ApiProperty({ enum: EntityType, example: EntityType.TEST_CASE })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ example: 'screenshot.png' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  filename: string;

  @ApiProperty({ example: '/uploads/2024/01/screenshot.png' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  path: string;

  @ApiProperty({ example: 102400 })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mimeType: string;
}
