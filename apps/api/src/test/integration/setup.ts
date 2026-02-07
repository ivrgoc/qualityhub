/**
 * Integration test setup utilities.
 *
 * Creates a fully bootstrapped NestJS application for integration testing.
 * The database configuration is driven by environment variables that are set
 * before module compilation so the existing ConfigService/TypeORM async config
 * picks them up naturally -- no module overrides required.
 *
 * By default, tests connect to a PostgreSQL database named `qualityhub_test`
 * on localhost:5432. Override with the standard DATABASE_* / POSTGRES_*
 * environment variables.
 *
 * Before running integration tests, ensure the test database exists:
 *   createdb -U qualityhub qualityhub_test
 */

// ------------------------------------------------------------------
// Set environment variables BEFORE any NestJS / TypeORM imports so
// the ConfigModule picks up the test values.
// ------------------------------------------------------------------
process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = process.env.TEST_DATABASE_HOST || 'localhost';
process.env.DATABASE_PORT = process.env.TEST_DATABASE_PORT || '5432';
process.env.POSTGRES_USER = process.env.TEST_POSTGRES_USER || 'qualityhub';
process.env.POSTGRES_PASSWORD = process.env.TEST_POSTGRES_PASSWORD || 'qualityhub_secret';
process.env.POSTGRES_DB = process.env.TEST_POSTGRES_DB || 'qualityhub_test';
process.env.JWT_SECRET = 'integration-test-jwt-secret-key-min-16';
process.env.JWT_ACCESS_TOKEN_EXPIRY = '900';
process.env.JWT_REFRESH_TOKEN_EXPIRY = '604800';
process.env.STORAGE_TYPE = 'local';
process.env.UPLOAD_DIR = '/tmp/qualityhub-test-uploads';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

/**
 * Create and initialise the NestJS application for integration testing.
 *
 * The app is configured identically to the production bootstrap (global prefix,
 * validation pipe, exception filter) so that the tests exercise the same code
 * paths as real HTTP requests.
 */
export async function createIntegrationTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  // Ensure the schema is clean by synchronizing (dropSchema happens via TypeORM
  // synchronize on first connection). For subsequent test suites that reuse the
  // same DB, we truncate all tables in clearDatabase().
  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    await dataSource.synchronize(true); // true = dropBeforeSync
  }

  return app;
}

/**
 * Truncate all tables in the test database.
 *
 * Called between individual tests (in beforeEach) to ensure complete data
 * isolation. Tables are truncated in reverse-dependency order, using CASCADE
 * to handle any remaining FK constraints.
 */
export async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);

  // Truncate in reverse dependency order
  const tableNames = [
    'attachments',
    'requirement_coverages',
    'requirements',
    'test_results',
    'test_runs',
    'test_plan_entries',
    'test_plans',
    'milestones',
    'test_case_versions',
    'test_cases',
    'sections',
    'test_suites',
    'project_members',
    'projects',
    'refresh_tokens',
    'users',
    'organizations',
  ];

  for (const table of tableNames) {
    try {
      await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
    } catch {
      // Table might not exist in this schema version; ignore silently
    }
  }
}

/**
 * Helper that registers a user via the API and then logs in, returning
 * the access token, refresh token, and user object.
 *
 * Useful as a prerequisite for tests that need an authenticated user
 * but are not testing the auth flow itself.
 */
export async function registerAndLogin(
  app: INestApplication,
  overrides?: {
    email?: string;
    password?: string;
    name?: string;
    organizationName?: string;
  },
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    orgId: string;
  };
}> {
  const email = overrides?.email || `testuser-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = overrides?.password || 'SecurePassword123!';
  const name = overrides?.name || 'Test User';
  const organizationName = overrides?.organizationName || 'Test Org';

  // Register
  await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ email, password, name, organizationName })
    .expect(201);

  // Login
  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

  // Handle both wrapped ({ data: { ... } }) and unwrapped response shapes
  const body = loginRes.body.data || loginRes.body;

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    user: body.user,
  };
}

/**
 * Convenience wrapper around supertest that automatically injects the
 * Authorization: Bearer header into every request.
 */
export function authRequest(app: INestApplication, accessToken: string) {
  const server = app.getHttpServer();
  return {
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${accessToken}`),
    post: (url: string) =>
      request(server).post(url).set('Authorization', `Bearer ${accessToken}`),
    patch: (url: string) =>
      request(server).patch(url).set('Authorization', `Bearer ${accessToken}`),
    put: (url: string) =>
      request(server).put(url).set('Authorization', `Bearer ${accessToken}`),
    delete: (url: string) =>
      request(server).delete(url).set('Authorization', `Bearer ${accessToken}`),
  };
}
