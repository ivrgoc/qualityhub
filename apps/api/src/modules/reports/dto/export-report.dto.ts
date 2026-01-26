import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ReportType {
  SUMMARY = 'summary',
  COVERAGE = 'coverage',
  DEFECTS = 'defects',
  ACTIVITY = 'activity',
  TRENDS = 'trends',
}

export class ExportReportQueryDto {
  @ApiProperty({
    enum: ReportType,
    description: 'Type of report to export',
    example: ReportType.SUMMARY,
  })
  @IsEnum(ReportType)
  type!: ReportType;

  @ApiPropertyOptional({
    description: 'Start date for date-ranged reports (activity, trends)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for date-ranged reports (activity, trends)',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
