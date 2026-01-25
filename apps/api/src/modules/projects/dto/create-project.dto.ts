import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: 'My Project' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Project description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: { theme: 'dark' } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
