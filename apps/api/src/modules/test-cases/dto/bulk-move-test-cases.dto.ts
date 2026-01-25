import {
  IsArray,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkMoveTestCasesDto {
  @ApiProperty({
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Array of test case IDs to move (1-100 items)',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  ids: string[];

  @ApiPropertyOptional({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Target section ID to move test cases to (null to move to root)',
  })
  @IsOptional()
  @IsUUID('4')
  targetSectionId?: string | null;
}
