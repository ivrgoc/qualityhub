import {
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestStatus } from '../entities/test-result.entity';

export class UpdateTestResultDto {
  @ApiPropertyOptional({
    example: 'failed',
    enum: TestStatus,
    description: 'Result status',
  })
  @IsOptional()
  @IsEnum(TestStatus)
  status?: TestStatus;

  @ApiPropertyOptional({
    example: 'Test failed due to timeout',
    description: 'Comment or notes about the result',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @ApiPropertyOptional({
    example: 180,
    description: 'Time taken to execute in seconds',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedSeconds?: number;

  @ApiPropertyOptional({
    example: ['BUG-789'],
    description: 'Array of defect/bug identifiers',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defects?: string[];
}
