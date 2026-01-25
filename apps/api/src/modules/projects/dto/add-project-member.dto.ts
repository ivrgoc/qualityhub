import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRole } from '../entities/project-member.entity';

export class AddProjectMemberDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ enum: ProjectRole, example: ProjectRole.TESTER })
  @IsOptional()
  @IsEnum(ProjectRole)
  role?: ProjectRole;
}
