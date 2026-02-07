import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createIntegrationTestApp,
  clearDatabase,
  registerAndLogin,
  authRequest,
} from './setup';

describe('Test Cases Integration Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let orgId: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    app = await createIntegrationTestApp();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);

    // Register, login, and create a project for each test
    const auth = await registerAndLogin(app);
    accessToken = auth.accessToken;
    orgId = auth.user.orgId;
    userId = auth.user.id;

    const projectRes = await authRequest(app, accessToken)
      .post('/api/v1/projects')
      .send({
        organizationId: orgId,
        name: 'Test Cases Project',
        description: 'Project for test case integration tests',
      })
      .expect(201);

    projectId = (projectRes.body.data || projectRes.body).id;
  });

  // ---------- Helper ----------

  function casesUrl(suffix = '') {
    return `/api/v1/projects/${projectId}/cases${suffix}`;
  }

  // ---------- Create Test Case ----------

  describe('POST /api/v1/projects/:projectId/cases', () => {
    it('should create a test case with minimal fields', async () => {
      const res = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Verify login page loads' })
        .expect(201);

      const tc = res.body.data || res.body;
      expect(tc).toBeDefined();
      expect(tc.id).toBeDefined();
      expect(tc.title).toBe('Verify login page loads');
      expect(tc.projectId).toBe(projectId);
      expect(tc.version).toBe(1);
      // Defaults
      expect(tc.templateType).toBe('steps');
      expect(tc.priority).toBe('medium');
    });

    it('should create a test case with all fields', async () => {
      const steps = [
        { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Page loads' },
        { stepNumber: 2, action: 'Enter credentials', expectedResult: 'Fields populated' },
        { stepNumber: 3, action: 'Click submit', expectedResult: 'User is logged in' },
      ];

      const res = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({
          title: 'Full Login Test',
          templateType: 'steps',
          preconditions: 'User has a valid account',
          steps,
          expectedResult: 'User sees the dashboard',
          priority: 'high',
          estimate: 10,
        })
        .expect(201);

      const tc = res.body.data || res.body;
      expect(tc.title).toBe('Full Login Test');
      expect(tc.templateType).toBe('steps');
      expect(tc.preconditions).toBe('User has a valid account');
      expect(tc.steps).toEqual(steps);
      expect(tc.expectedResult).toBe('User sees the dashboard');
      expect(tc.priority).toBe('high');
      expect(tc.estimate).toBe(10);
      expect(tc.version).toBe(1);
      expect(tc.createdBy).toBe(userId);
    });

    it('should reject a test case with a title that is too short', async () => {
      await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'AB' })
        .expect(400);
    });

    it('should reject a test case without authentication', async () => {
      await request(app.getHttpServer())
        .post(casesUrl())
        .send({ title: 'Unauthorized test case' })
        .expect(401);
    });

    it('should reject a test case with an invalid priority', async () => {
      await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Invalid priority test', priority: 'super-urgent' })
        .expect(400);
    });
  });

  // ---------- List Test Cases ----------

  describe('GET /api/v1/projects/:projectId/cases', () => {
    it('should return an empty list when no test cases exist', async () => {
      const res = await authRequest(app, accessToken)
        .get(casesUrl())
        .expect(200);

      const cases = res.body.data || res.body;
      expect(Array.isArray(cases)).toBe(true);
      expect(cases.length).toBe(0);
    });

    it('should return all test cases for the project', async () => {
      await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Test Case Alpha' })
        .expect(201);

      await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Test Case Beta' })
        .expect(201);

      const res = await authRequest(app, accessToken)
        .get(casesUrl())
        .expect(200);

      const cases = res.body.data || res.body;
      expect(cases.length).toBe(2);

      const titles = cases.map((c: any) => c.title);
      expect(titles).toContain('Test Case Alpha');
      expect(titles).toContain('Test Case Beta');
    });

    it('should not return test cases from other projects', async () => {
      // Create a test case in the current project
      await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Correct Project Case' })
        .expect(201);

      // Create a second project and a test case in it
      const project2Res = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({ organizationId: orgId, name: 'Other Project' })
        .expect(201);

      const project2Id = (project2Res.body.data || project2Res.body).id;

      await authRequest(app, accessToken)
        .post(`/api/v1/projects/${project2Id}/cases`)
        .send({ title: 'Other Project Case' })
        .expect(201);

      // List should only contain cases from the first project
      const res = await authRequest(app, accessToken)
        .get(casesUrl())
        .expect(200);

      const cases = res.body.data || res.body;
      expect(cases.length).toBe(1);
      expect(cases[0].title).toBe('Correct Project Case');
    });
  });

  // ---------- Get Test Case by ID ----------

  describe('GET /api/v1/projects/:projectId/cases/:id', () => {
    it('should return a test case by ID', async () => {
      const createRes = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Findable Test Case', priority: 'critical' })
        .expect(201);

      const created = createRes.body.data || createRes.body;

      const getRes = await authRequest(app, accessToken)
        .get(casesUrl(`/${created.id}`))
        .expect(200);

      const tc = getRes.body.data || getRes.body;
      expect(tc.id).toBe(created.id);
      expect(tc.title).toBe('Findable Test Case');
      expect(tc.priority).toBe('critical');
    });

    it('should return 404 for a non-existent test case', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .get(casesUrl(`/${fakeId}`))
        .expect(404);
    });
  });

  // ---------- Update Test Case ----------

  describe('PATCH /api/v1/projects/:projectId/cases/:id', () => {
    let testCaseId: string;

    beforeEach(async () => {
      const res = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({
          title: 'Original Title',
          preconditions: 'Original preconditions',
          priority: 'low',
          estimate: 5,
        })
        .expect(201);

      testCaseId = (res.body.data || res.body).id;
    });

    it('should update a test case title and bump version', async () => {
      const res = await authRequest(app, accessToken)
        .patch(casesUrl(`/${testCaseId}`))
        .send({ title: 'Updated Title' })
        .expect(200);

      const tc = res.body.data || res.body;
      expect(tc.title).toBe('Updated Title');
      expect(tc.version).toBe(2); // bumped from 1 to 2

      // Verify full state persisted correctly by re-fetching
      const getRes = await authRequest(app, accessToken)
        .get(casesUrl(`/${testCaseId}`))
        .expect(200);

      const fetched = getRes.body.data || getRes.body;
      expect(fetched.title).toBe('Updated Title');
      expect(fetched.preconditions).toBe('Original preconditions');
      expect(fetched.priority).toBe('low');
    });

    it('should update priority', async () => {
      const res = await authRequest(app, accessToken)
        .patch(casesUrl(`/${testCaseId}`))
        .send({ priority: 'critical' })
        .expect(200);

      const tc = res.body.data || res.body;
      expect(tc.priority).toBe('critical');
    });

    it('should update steps', async () => {
      const newSteps = [
        { stepNumber: 1, action: 'Open browser', expectedResult: 'Browser opens' },
      ];

      const res = await authRequest(app, accessToken)
        .patch(casesUrl(`/${testCaseId}`))
        .send({ steps: newSteps })
        .expect(200);

      const tc = res.body.data || res.body;
      expect(tc.steps).toEqual(newSteps);
    });

    it('should return 404 when updating a non-existent test case', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .patch(casesUrl(`/${fakeId}`))
        .send({ title: 'Ghost' })
        .expect(404);
    });
  });

  // ---------- Delete Test Case ----------

  describe('DELETE /api/v1/projects/:projectId/cases/:id', () => {
    let testCaseId: string;

    beforeEach(async () => {
      const res = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Deletable Test Case' })
        .expect(201);

      testCaseId = (res.body.data || res.body).id;
    });

    it('should soft-delete a test case', async () => {
      await authRequest(app, accessToken)
        .delete(casesUrl(`/${testCaseId}`))
        .expect(204);

      // Should no longer appear in list
      const listRes = await authRequest(app, accessToken)
        .get(casesUrl())
        .expect(200);

      const cases = listRes.body.data || listRes.body;
      expect(cases.length).toBe(0);
    });

    it('should return 404 for a non-existent test case', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .delete(casesUrl(`/${fakeId}`))
        .expect(404);
    });
  });

  // ---------- Version History ----------

  describe('GET /api/v1/projects/:projectId/cases/:id/history', () => {
    it('should track version history across updates', async () => {
      // Create
      const createRes = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Versioned Case', priority: 'low' })
        .expect(201);

      const tcId = (createRes.body.data || createRes.body).id;

      // Update twice
      await authRequest(app, accessToken)
        .patch(casesUrl(`/${tcId}`))
        .send({ title: 'Versioned Case v2' })
        .expect(200);

      await authRequest(app, accessToken)
        .patch(casesUrl(`/${tcId}`))
        .send({ title: 'Versioned Case v3', priority: 'high' })
        .expect(200);

      // Check history
      const historyRes = await authRequest(app, accessToken)
        .get(casesUrl(`/${tcId}/history`))
        .expect(200);

      const history = historyRes.body.data || historyRes.body;
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(3); // v1, v2, v3

      // History should be ordered by version descending
      expect(history[0].version).toBe(3);
      expect(history[1].version).toBe(2);
      expect(history[2].version).toBe(1);

      // Check version data snapshots
      expect(history[0].data.title).toBe('Versioned Case v3');
      expect(history[0].data.priority).toBe('high');
      expect(history[2].data.title).toBe('Versioned Case');
      expect(history[2].data.priority).toBe('low');
    });
  });

  // ---------- Bulk Create ----------

  describe('POST /api/v1/projects/:projectId/cases/bulk', () => {
    it('should bulk-create multiple test cases', async () => {
      const testCases = [
        { title: 'Bulk Case 1', priority: 'high' },
        { title: 'Bulk Case 2', priority: 'medium' },
        { title: 'Bulk Case 3', priority: 'low' },
      ];

      const res = await authRequest(app, accessToken)
        .post(casesUrl('/bulk'))
        .send({ testCases })
        .expect(201);

      const created = res.body.data || res.body;
      expect(Array.isArray(created)).toBe(true);
      expect(created.length).toBe(3);

      const titles = created.map((c: any) => c.title);
      expect(titles).toContain('Bulk Case 1');
      expect(titles).toContain('Bulk Case 2');
      expect(titles).toContain('Bulk Case 3');

      // All should have version 1
      created.forEach((c: any) => {
        expect(c.version).toBe(1);
        expect(c.projectId).toBe(projectId);
      });
    });

    it('should reject bulk create with empty array', async () => {
      await authRequest(app, accessToken)
        .post(casesUrl('/bulk'))
        .send({ testCases: [] })
        .expect(400);
    });

    it('should reject bulk create with invalid test case data', async () => {
      await authRequest(app, accessToken)
        .post(casesUrl('/bulk'))
        .send({ testCases: [{ title: 'OK' }, { title: 'AB' }] }) // second title too short
        .expect(400);
    });
  });

  // ---------- Bulk Delete ----------

  describe('DELETE /api/v1/projects/:projectId/cases/bulk', () => {
    it('should bulk-delete multiple test cases', async () => {
      // Create 3 test cases
      const ids: string[] = [];
      for (let i = 1; i <= 3; i++) {
        const res = await authRequest(app, accessToken)
          .post(casesUrl())
          .send({ title: `Bulk Delete Case ${i}` })
          .expect(201);
        ids.push((res.body.data || res.body).id);
      }

      // Delete the first two
      const deleteRes = await authRequest(app, accessToken)
        .delete(casesUrl('/bulk'))
        .send({ ids: [ids[0], ids[1]] })
        .expect(200);

      const result = deleteRes.body.data || deleteRes.body;
      expect(result.deleted).toContain(ids[0]);
      expect(result.deleted).toContain(ids[1]);
      expect(result.deleted.length).toBe(2);

      // List should only contain the third test case
      const listRes = await authRequest(app, accessToken)
        .get(casesUrl())
        .expect(200);

      const remaining = listRes.body.data || listRes.body;
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(ids[2]);
    });

    it('should report not-found IDs in bulk delete', async () => {
      const res = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({ title: 'Existing Case' })
        .expect(201);

      const existingId = (res.body.data || res.body).id;
      const fakeId = '00000000-0000-4000-a000-000000000000';

      const deleteRes = await authRequest(app, accessToken)
        .delete(casesUrl('/bulk'))
        .send({ ids: [existingId, fakeId] })
        .expect(200);

      const result = deleteRes.body.data || deleteRes.body;
      expect(result.deleted).toContain(existingId);
      expect(result.notFound).toContain(fakeId);
    });
  });

  // ---------- Full Flow ----------

  describe('Complete Test Case Flow', () => {
    it('should handle create -> list -> get -> update -> history -> delete', async () => {
      // 1. Create
      const createRes = await authRequest(app, accessToken)
        .post(casesUrl())
        .send({
          title: 'E2E Test Case',
          priority: 'medium',
          preconditions: 'User is logged in',
          expectedResult: 'Feature works',
          estimate: 15,
        })
        .expect(201);

      const created = createRes.body.data || createRes.body;
      expect(created.id).toBeDefined();
      expect(created.version).toBe(1);

      // 2. List
      const listRes = await authRequest(app, accessToken)
        .get(casesUrl())
        .expect(200);

      const cases = listRes.body.data || listRes.body;
      expect(cases.length).toBe(1);
      expect(cases[0].id).toBe(created.id);

      // 3. Get
      const getRes = await authRequest(app, accessToken)
        .get(casesUrl(`/${created.id}`))
        .expect(200);

      const fetched = getRes.body.data || getRes.body;
      expect(fetched.title).toBe('E2E Test Case');

      // 4. Update
      const updateRes = await authRequest(app, accessToken)
        .patch(casesUrl(`/${created.id}`))
        .send({ title: 'Updated E2E Test Case', priority: 'critical' })
        .expect(200);

      const updated = updateRes.body.data || updateRes.body;
      expect(updated.title).toBe('Updated E2E Test Case');
      expect(updated.version).toBe(2);

      // 5. History
      const historyRes = await authRequest(app, accessToken)
        .get(casesUrl(`/${created.id}/history`))
        .expect(200);

      const history = historyRes.body.data || historyRes.body;
      expect(history.length).toBe(2);

      // 6. Delete
      await authRequest(app, accessToken)
        .delete(casesUrl(`/${created.id}`))
        .expect(204);

      // 7. Verify
      await authRequest(app, accessToken)
        .get(casesUrl(`/${created.id}`))
        .expect(404);
    });
  });
});
