import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestStatus } from '../entities/test-result.entity';

export class CreateTestResultDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Test case ID',
  })
  @IsUUID()
  testCaseId: string;

  @ApiPropertyOptional({
    example: 'passed',
    enum: TestStatus,
    description: 'Result status',
    default: TestStatus.UNTESTED,
  })
  @IsOptional()
  @IsEnum(TestStatus)
  status?: TestStatus;

  @ApiPropertyOptional({
    example: 'Test passed successfully with all assertions met',
    description: 'Comment or notes about the result',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @ApiPropertyOptional({
    example: 120,
    description: 'Time taken to execute in seconds',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedSeconds?: number;

  @ApiPropertyOptional({
    example: ['BUG-123', 'BUG-456'],
    description: 'Array of defect/bug identifiers',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defects?: string[];
}
