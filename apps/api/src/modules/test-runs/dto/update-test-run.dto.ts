import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestRunStatus } from '../entities/test-run.entity';

export class UpdateTestRunDto {
  @ApiPropertyOptional({ example: 'Sprint 1 Regression - Updated' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated regression tests description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: 'in_progress',
    enum: TestRunStatus,
    description: 'Current status of the test run',
  })
  @IsOptional()
  @IsEnum(TestRunStatus)
  status?: TestRunStatus;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Test plan ID to associate with this run',
  })
  @IsOptional()
  @IsUUID()
  testPlanId?: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'User ID assigned to this test run',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @ApiPropertyOptional({
    example: { environment: 'production', browser: 'firefox' },
    description: 'Configuration settings for the test run',
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
