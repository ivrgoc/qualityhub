import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttachmentDto {
  @ApiPropertyOptional({ example: 'renamed-screenshot.png' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  filename?: string;
}
