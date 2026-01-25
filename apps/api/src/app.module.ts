import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, jwtConfig, typeOrmAsyncConfig } from './config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TestCasesModule } from './modules/test-cases/test-cases.module';
import { TestRunsModule } from './modules/test-runs/test-runs.module';
import { TestSuitesModule } from './modules/test-suites/test-suites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    TestCasesModule,
    TestRunsModule,
    TestSuitesModule,
  ],
})
export class AppModule {}
