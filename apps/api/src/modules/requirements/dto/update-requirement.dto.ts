import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequirementSource, RequirementStatus } from '../entities/requirement.entity';

export class UpdateRequirementDto {
  @ApiPropertyOptional({ example: 'User should be able to reset password' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({
    example: 'The user should be able to reset their password via email link',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({
    example: 'PROJ-123',
    description: 'External ID from source system (e.g., Jira ticket ID)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalId?: string;

  @ApiPropertyOptional({
    enum: RequirementSource,
    example: RequirementSource.JIRA,
    description: 'Source system for this requirement',
  })
  @IsEnum(RequirementSource)
  @IsOptional()
  source?: RequirementSource;

  @ApiPropertyOptional({
    enum: RequirementStatus,
    example: RequirementStatus.APPROVED,
    description: 'Status of the requirement',
  })
  @IsEnum(RequirementStatus)
  @IsOptional()
  status?: RequirementStatus;

  @ApiPropertyOptional({
    example: { priority: 'high', component: 'auth' },
    description: 'Custom fields for additional metadata',
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}
