import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TestRun } from '../test-runs/entities/test-run.entity';
import { TestResult } from '../test-runs/entities/test-result.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Requirement } from '../requirements/entities/requirement.entity';
import { RequirementCoverage } from '../requirements/entities/requirement-coverage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestRun,
      TestResult,
      TestCase,
      Requirement,
      RequirementCoverage,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
