import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Health status of the API',
    example: 'ok',
  })
  status!: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
  })
  version!: string;
}
