import { ApiProperty } from '@nestjs/swagger';

export class CoverageWidgetDto {
  @ApiProperty({ example: 25, description: 'Total number of requirements' })
  totalRequirements: number;

  @ApiProperty({ example: 20, description: 'Number of covered requirements' })
  coveredRequirements: number;

  @ApiProperty({ example: 5, description: 'Number of uncovered requirements' })
  uncoveredRequirements: number;

  @ApiProperty({ example: 80, description: 'Coverage percentage' })
  coveragePercentage: number;

  @ApiProperty({ example: 150, description: 'Total test cases linked to requirements' })
  linkedTestCases: number;
}
