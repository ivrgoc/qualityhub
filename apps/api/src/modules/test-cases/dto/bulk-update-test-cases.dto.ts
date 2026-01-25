import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTestCaseDto } from './update-test-case.dto';

export class BulkUpdateTestCaseItem extends UpdateTestCaseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;
}

export class BulkUpdateTestCasesDto {
  @ApiProperty({
    type: [BulkUpdateTestCaseItem],
    description: 'Array of test cases to update (1-100 items)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Type(() => BulkUpdateTestCaseItem)
  testCases: BulkUpdateTestCaseItem[];
}
