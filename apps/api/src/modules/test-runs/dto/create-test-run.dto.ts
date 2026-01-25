import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestRunDto {
  @ApiProperty({ example: 'Sprint 1 Regression' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Regression tests for Sprint 1 release' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
