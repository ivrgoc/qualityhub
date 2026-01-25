import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TestStepDto {
  @ApiProperty({
    example: 1,
    description: 'Step number/order in the test case',
  })
  @IsNumber()
  @Min(1)
  stepNumber: number;

  @ApiProperty({
    example: 'Enter valid username and password',
    description: 'Action to perform in this step',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  action: string;

  @ApiPropertyOptional({
    example: 'Login form is displayed',
    description: 'Expected result after performing the action',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  expectedResult?: string;

  @ApiPropertyOptional({
    example: 'Use test credentials from config',
    description: 'Additional data or notes for this step',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  data?: string;
}
