import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createIntegrationTestApp,
  clearDatabase,
  authRequest,
} from './setup';

describe('Auth Integration Tests', () => {
  let app: INestApplication;

  const testUser = {
    email: 'auth-test@example.com',
    password: 'SecurePassword123!',
    name: 'Auth Test User',
    organizationName: 'Auth Test Org',
  };

  beforeAll(async () => {
    app = await createIntegrationTestApp();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);
  });

  // ---------- Registration ----------

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      // The register endpoint returns the created user (without tokens)
      expect(res.body).toBeDefined();
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.name).toBe(testUser.name);
      expect(res.body.role).toBe('org_admin');
      // Password hash should never be exposed
      expect(res.body.passwordHash).toBeUndefined();
      expect(res.body.password).toBeUndefined();
    });

    it('should reject registration with duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      // Duplicate attempt
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.message).toContain('already registered');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'not-an-email' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...testUser, password: 'short' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject registration with missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'missing@example.com' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  // ---------- Login ----------

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.orgId).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should reject login with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email })
        .expect(400);
    });
  });

  // ---------- Get Me (profile) ----------

  describe('GET /api/v1/auth/me', () => {
    it('should return the current user profile with a valid token', async () => {
      // Register + login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const accessToken = loginRes.body.accessToken;

      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meRes.body).toBeDefined();
      // The /me endpoint returns the user entity (may be wrapped or not)
      const user = meRes.body.data || meRes.body;
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(user.id).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should reject requests with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });
  });

  // ---------- Refresh Token ----------

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new tokens when given a valid refresh token', async () => {
      // Register + login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const refreshToken = loginRes.body.refreshToken;

      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body).toBeDefined();
      expect(refreshRes.body.accessToken).toBeDefined();
      expect(refreshRes.body.refreshToken).toBeDefined();
      expect(typeof refreshRes.body.accessToken).toBe('string');
      expect(typeof refreshRes.body.refreshToken).toBe('string');
      // The new access token should be usable to access protected endpoints
      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${refreshRes.body.accessToken}`)
        .expect(200);
      expect(meRes.body.email).toBe(testUser.email);
    });

    it('should reject an already-used (rotated) refresh token', async () => {
      // Register + login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const refreshToken = loginRes.body.refreshToken;

      // First refresh succeeds
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Second refresh with the same token should fail (token rotation)
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should reject an invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.value' })
        .expect(401);
    });

    it('should reject when refreshToken is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  // ---------- Logout ----------

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully and invalidate the refresh token', async () => {
      // Register + login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const { accessToken, refreshToken } = loginRes.body;

      // Logout
      const logoutRes = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(logoutRes.body).toBeDefined();
      expect(logoutRes.body.message || logoutRes.body.data?.message).toContain(
        'Logged out',
      );

      // Attempting to refresh with the invalidated token should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should reject logout without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'any-token' })
        .expect(401);
    });
  });

  // ---------- Full Auth Flow ----------

  describe('Complete Auth Flow', () => {
    it('should handle register -> login -> me -> refresh -> logout', async () => {
      // 1. Register
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerRes.body.email).toBe(testUser.email);

      // 2. Login
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const { accessToken, refreshToken, user } = loginRes.body;
      expect(user.email).toBe(testUser.email);

      // 3. Get profile
      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const profile = meRes.body.data || meRes.body;
      expect(profile.email).toBe(testUser.email);

      // 4. Refresh token
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshRes.body.accessToken;
      const newRefreshToken = refreshRes.body.refreshToken;
      expect(newAccessToken).toBeDefined();

      // 5. Verify new access token works
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // 6. Logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ refreshToken: newRefreshToken })
        .expect(200);

      // 7. Refresh with invalidated token should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(401);
    });
  });
});
