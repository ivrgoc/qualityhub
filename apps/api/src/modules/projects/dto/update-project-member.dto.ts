import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '../entities/project-member.entity';

export class UpdateProjectMemberDto {
  @ApiProperty({ enum: ProjectRole, example: ProjectRole.LEAD })
  @IsEnum(ProjectRole)
  role: ProjectRole;
}
