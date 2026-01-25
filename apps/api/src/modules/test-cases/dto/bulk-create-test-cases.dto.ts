import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTestCaseDto } from './create-test-case.dto';

export class BulkCreateTestCasesDto {
  @ApiProperty({
    type: [CreateTestCaseDto],
    description: 'Array of test cases to create (1-100 items)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Type(() => CreateTestCaseDto)
  testCases: CreateTestCaseDto[];
}
