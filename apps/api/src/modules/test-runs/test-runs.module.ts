import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestRunsController } from './test-runs.controller';
import { TestRunsService } from './test-runs.service';
import { TestRun } from './entities/test-run.entity';
import { TestResult } from './entities/test-result.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestRun, TestResult]),
    NotificationsModule,
  ],
  controllers: [TestRunsController],
  providers: [TestRunsService],
  exports: [TestRunsService, TypeOrmModule],
})
export class TestRunsModule {}
