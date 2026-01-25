import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestSuiteDto {
  @ApiProperty({ example: 'Login Module Tests' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Test suite for login functionality' })
  @IsString()
  @IsOptional()
  description?: string;
}
