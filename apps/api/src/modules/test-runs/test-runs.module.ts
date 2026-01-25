import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestRunsController } from './test-runs.controller';
import { TestRunsService } from './test-runs.service';
import { TestRun } from './entities/test-run.entity';
import { TestResult } from './entities/test-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestRun, TestResult])],
  controllers: [TestRunsController],
  providers: [TestRunsService],
  exports: [TestRunsService, TypeOrmModule],
})
export class TestRunsModule {}
