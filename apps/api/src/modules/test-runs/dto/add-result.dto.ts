import {
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestStatus } from '../entities/test-result.entity';

export class AddResultDto {
  @ApiProperty({
    example: 'passed',
    enum: TestStatus,
    description: 'Result status',
  })
  @IsEnum(TestStatus)
  status: TestStatus;

  @ApiPropertyOptional({
    example: 'Test passed successfully with all assertions met',
    description: 'Comment or notes about the result',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @ApiPropertyOptional({
    example: 120,
    description: 'Time taken to execute in seconds',
    minimum: 0,
    maximum: 86400,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400)
  elapsedSeconds?: number;

  @ApiPropertyOptional({
    example: ['BUG-123', 'BUG-456'],
    description: 'Array of defect/bug identifiers',
    maxItems: 100,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  defects?: string[];
}
