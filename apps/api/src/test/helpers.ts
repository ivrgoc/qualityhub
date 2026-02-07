import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/user.entity';
import { initTestDatabase, closeTestDatabase, resetTestDatabase } from './test-database';
import { resetAllCounters } from './factories';

/**
 * Create a fully configured NestJS test application
 */
export const createTestApp = async (): Promise<INestApplication> => {
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
    }),
  );

  await app.init();
  return app;
};

/**
 * Generate a valid JWT access token for a user
 */
export const generateAccessToken = (app: INestApplication, user: User): string => {
  const jwtService = app.get(JwtService);
  return jwtService.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
    },
    { expiresIn: '15m' },
  );
};

/**
 * Generate a valid JWT refresh token for a user
 */
export const generateRefreshToken = (app: INestApplication, user: User): string => {
  const jwtService = app.get(JwtService);
  return jwtService.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    { expiresIn: '7d' },
  );
};

/**
 * Make an authenticated request with supertest
 */
export const authenticatedRequest = (
  app: INestApplication,
  user: User,
) => {
  const token = generateAccessToken(app, user);
  const agent = request(app.getHttpServer());

  // Add auth header helper
  const withAuth = () => {
    return {
      get: (url: string) => agent.get(url).set('Authorization', `Bearer ${token}`),
      post: (url: string) => agent.post(url).set('Authorization', `Bearer ${token}`),
      put: (url: string) => agent.put(url).set('Authorization', `Bearer ${token}`),
      patch: (url: string) => agent.patch(url).set('Authorization', `Bearer ${token}`),
      delete: (url: string) => agent.delete(url).set('Authorization', `Bearer ${token}`),
    };
  };

  return Object.assign(agent, { withAuth });
};

/**
 * Setup function to be called in beforeAll
 */
export const setupTestEnvironment = async (): Promise<void> => {
  await initTestDatabase();
};

/**
 * Teardown function to be called in afterAll
 */
export const teardownTestEnvironment = async (): Promise<void> => {
  await closeTestDatabase();
};

/**
 * Reset function to be called in beforeEach
 */
export const resetTestEnvironment = async (): Promise<void> => {
  await resetTestDatabase();
  resetAllCounters();
};

/**
 * Extract response body with proper typing
 */
export const getResponseBody = <T>(response: request.Response): T => {
  return response.body as T;
};

/**
 * Expect a successful API response structure
 */
export const expectSuccessResponse = (
  response: request.Response,
  statusCode: number = 200,
): void => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('data');
  expect(response.body).toHaveProperty('timestamp');
};

/**
 * Expect an error API response structure
 */
export const expectErrorResponse = (
  response: request.Response,
  statusCode: number,
  message?: string,
): void => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('statusCode', statusCode);
  expect(response.body).toHaveProperty('message');
  if (message) {
    expect(response.body.message).toContain(message);
  }
};

/**
 * Wait for a specified number of milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generate a random string for unique test data
 */
export const randomString = (length: number = 8): string => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

/**
 * Generate a unique email for testing
 */
export const uniqueEmail = (): string => {
  return `test-${randomString()}@example.com`;
};
