import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 'Updated Section Name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Parent section ID for nested sections',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'Position within the parent (or root if no parent)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
