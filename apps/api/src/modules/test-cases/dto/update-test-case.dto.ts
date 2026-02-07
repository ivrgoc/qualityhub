import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsUUID,
  IsObject,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseTemplate, Priority } from '../entities/test-case.entity';
import { TestStepDto } from './test-step.dto';

export class UpdateTestCaseDto {
  @ApiPropertyOptional({ example: 'Login with valid credentials' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ enum: TestCaseTemplate })
  @IsOptional()
  @IsEnum(TestCaseTemplate)
  templateType?: TestCaseTemplate;

  @ApiPropertyOptional({ example: 'User is on login page' })
  @IsOptional()
  @IsString()
  preconditions?: string;

  @ApiPropertyOptional({
    type: [TestStepDto],
    description: 'Array of test steps (max 100)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(100)
  @Type(() => TestStepDto)
  steps?: TestStepDto[];

  @ApiPropertyOptional({ example: 'User is logged in successfully' })
  @IsOptional()
  @IsString()
  expectedResult?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  estimate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}
