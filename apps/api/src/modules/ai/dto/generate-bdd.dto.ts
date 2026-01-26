import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateBddDto {
  @ApiProperty({
    description: 'Description of the feature to generate BDD scenarios for',
    minLength: 10,
    maxLength: 10000,
    example:
      'As a user, I want to reset my password so that I can regain access to my account',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  feature_description!: string;

  @ApiPropertyOptional({
    description: 'Additional context about the application or feature',
    maxLength: 5000,
    example: 'Password reset requires email verification',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  context?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of scenarios to generate',
    minimum: 1,
    maximum: 10,
    default: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  max_scenarios?: number = 3;

  @ApiPropertyOptional({
    description: 'Whether to include Scenario Outline examples',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  include_examples?: boolean = true;
}

export class BddScenarioDto {
  @ApiProperty({ description: 'Scenario name' })
  name!: string;

  @ApiProperty({
    description: 'Given steps (preconditions)',
    type: [String],
  })
  given!: string[];

  @ApiProperty({
    description: 'When steps (actions)',
    type: [String],
  })
  when!: string[];

  @ApiProperty({
    description: 'Then steps (expected outcomes)',
    type: [String],
  })
  then!: string[];

  @ApiPropertyOptional({
    description: 'Examples for Scenario Outline',
    type: 'array',
    items: { type: 'object' },
  })
  examples?: Record<string, unknown>[];

  @ApiPropertyOptional({
    description: 'Scenario tags (e.g., @smoke, @regression)',
    type: [String],
  })
  tags?: string[];
}

export class GenerateBddResponseDto {
  @ApiProperty({ description: 'Name of the feature' })
  feature_name!: string;

  @ApiProperty({ description: 'Description of the feature' })
  feature_description!: string;

  @ApiProperty({
    description: 'Generated BDD scenarios',
    type: [BddScenarioDto],
  })
  scenarios!: BddScenarioDto[];

  @ApiProperty({ description: 'Complete Gherkin feature file content' })
  gherkin!: string;

  @ApiProperty({
    description: 'Additional metadata about the generation',
    example: { provider: 'openai', model: 'gpt-4', tokens_used: 1200 },
  })
  metadata!: Record<string, unknown>;
}
