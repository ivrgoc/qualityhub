import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddEntriesDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'Array of test case IDs to add to the test plan',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  testCaseIds: string[];
}
