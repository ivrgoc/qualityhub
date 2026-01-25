import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsObject,
  Matches,
} from 'class-validator';
import { OrganizationPlan } from '../entities/organization.entity';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OrganizationPlan)
  plan?: OrganizationPlan;
}
