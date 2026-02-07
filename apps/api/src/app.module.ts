import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import {
  databaseConfig,
  jwtConfig,
  storageConfig,
  typeOrmAsyncConfig,
} from './config';
import { StorageModule } from './modules/attachments/providers';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TestCasesModule } from './modules/test-cases/test-cases.module';
import { TestRunsModule } from './modules/test-runs/test-runs.module';
import { TestSuitesModule } from './modules/test-suites/test-suites.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { TestPlansModule } from './modules/test-plans/test-plans.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, jwtConfig, storageConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    StorageModule.forRootAsync(),
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    TestCasesModule,
    TestRunsModule,
    TestSuitesModule,
    MilestonesModule,
    TestPlansModule,
    RequirementsModule,
    ReportsModule,
    DashboardModule,
    AttachmentsModule,
    AiModule,
    NotificationsModule,
  ],
  providers:
    process.env.NODE_ENV === 'test'
      ? []
      : [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
