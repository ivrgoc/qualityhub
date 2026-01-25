import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseTemplate, Priority } from '../entities/test-case.entity';
import { TestStepDto } from './test-step.dto';

export class CreateTestCaseDto {
  @ApiProperty({ example: 'Login with valid credentials' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ enum: TestCaseTemplate })
  @IsEnum(TestCaseTemplate)
  @IsOptional()
  templateType?: TestCaseTemplate;

  @ApiPropertyOptional({ example: 'User is on login page' })
  @IsString()
  @IsOptional()
  preconditions?: string;

  @ApiPropertyOptional({
    type: [TestStepDto],
    description: 'Array of test steps (max 100)',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayMaxSize(100)
  @Type(() => TestStepDto)
  steps?: TestStepDto[];

  @ApiPropertyOptional({ example: 'User is logged in successfully' })
  @IsString()
  @IsOptional()
  expectedResult?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  estimate?: number;
}
