import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequirementCoverageDetailDto {
  @ApiProperty({ example: 'req-123', description: 'Requirement ID' })
  requirementId: string;

  @ApiPropertyOptional({ example: 'JIRA-456', description: 'External requirement ID' })
  externalId: string | null;

  @ApiProperty({ example: 'User authentication', description: 'Requirement title' })
  title: string;

  @ApiProperty({ example: 'approved', description: 'Requirement status' })
  status: string;

  @ApiProperty({ example: 5, description: 'Number of linked test cases' })
  linkedTestCases: number;

  @ApiProperty({ example: true, description: 'Whether requirement is covered by at least one test case' })
  isCovered: boolean;
}

export class CoverageReportDto {
  @ApiProperty({ example: 'proj-123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ example: 25, description: 'Total number of requirements' })
  totalRequirements: number;

  @ApiProperty({ example: 20, description: 'Number of covered requirements' })
  coveredRequirements: number;

  @ApiProperty({ example: 5, description: 'Number of uncovered requirements' })
  uncoveredRequirements: number;

  @ApiProperty({ example: 80, description: 'Overall coverage percentage' })
  coveragePercentage: number;

  @ApiProperty({
    type: [RequirementCoverageDetailDto],
    description: 'Detailed coverage for each requirement',
  })
  requirements: RequirementCoverageDetailDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Report generation timestamp' })
  generatedAt: Date;
}
