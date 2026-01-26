import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type TestType = 'functional' | 'edge_case' | 'negative' | 'all';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export class GenerateTestsDto {
  @ApiProperty({
    description:
      'The requirement or feature description to generate tests from',
    minLength: 10,
    maxLength: 10000,
    example: 'User should be able to login with email and password',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  description!: string;

  @ApiPropertyOptional({
    description: 'Additional context about the application or feature',
    maxLength: 5000,
    example: 'This is a web application with JWT authentication',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  context?: string;

  @ApiPropertyOptional({
    description: 'Type of test cases to generate',
    enum: ['functional', 'edge_case', 'negative', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['functional', 'edge_case', 'negative', 'all'])
  test_type?: TestType = 'all';

  @ApiPropertyOptional({
    description: 'Maximum number of test cases to generate',
    minimum: 1,
    maximum: 20,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  max_tests?: number = 5;

  @ApiPropertyOptional({
    description: 'Priority level for generated test cases',
    enum: ['critical', 'high', 'medium', 'low'],
  })
  @IsOptional()
  @IsIn(['critical', 'high', 'medium', 'low'])
  priority?: Priority;
}

export class TestStepResponseDto {
  @ApiProperty({ description: 'Step number', minimum: 1 })
  step_number!: number;

  @ApiProperty({ description: 'The action to perform' })
  action!: string;

  @ApiProperty({ description: 'The expected result of the action' })
  expected_result!: string;
}

export class GeneratedTestCaseDto {
  @ApiProperty({ description: 'Test case title' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Preconditions that must be met before executing the test',
  })
  preconditions?: string;

  @ApiProperty({
    description: 'Test steps to execute',
    type: [TestStepResponseDto],
  })
  steps!: TestStepResponseDto[];

  @ApiProperty({ description: 'Overall expected result' })
  expected_result!: string;

  @ApiProperty({
    description: 'Test case priority',
    enum: ['critical', 'high', 'medium', 'low'],
  })
  priority!: Priority;

  @ApiProperty({
    description: 'Type of test case',
    enum: ['functional', 'edge_case', 'negative'],
  })
  test_type!: 'functional' | 'edge_case' | 'negative';
}

export class GenerateTestsResponseDto {
  @ApiProperty({
    description: 'Generated test cases',
    type: [GeneratedTestCaseDto],
  })
  test_cases!: GeneratedTestCaseDto[];

  @ApiProperty({
    description: 'Additional metadata about the generation',
    example: { provider: 'openai', model: 'gpt-4', tokens_used: 1500 },
  })
  metadata!: Record<string, unknown>;
}
