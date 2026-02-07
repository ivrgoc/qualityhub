import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createIntegrationTestApp,
  clearDatabase,
  registerAndLogin,
  authRequest,
} from './setup';

describe('Test Runs Integration Tests', () => {
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

    // Register, login, and create a project
    const auth = await registerAndLogin(app);
    accessToken = auth.accessToken;
    orgId = auth.user.orgId;
    userId = auth.user.id;

    const projectRes = await authRequest(app, accessToken)
      .post('/api/v1/projects')
      .send({
        organizationId: orgId,
        name: 'Test Runs Project',
      })
      .expect(201);

    projectId = (projectRes.body.data || projectRes.body).id;
  });

  // ---------- Helpers ----------

  function runsUrl(suffix = '') {
    return `/api/v1/projects/${projectId}/runs${suffix}`;
  }

  function casesUrl(suffix = '') {
    return `/api/v1/projects/${projectId}/cases${suffix}`;
  }

  async function createTestCase(title: string): Promise<string> {
    const res = await authRequest(app, accessToken)
      .post(casesUrl())
      .send({ title, priority: 'medium' })
      .expect(201);
    return (res.body.data || res.body).id;
  }

  async function createTestRun(name: string): Promise<string> {
    const res = await authRequest(app, accessToken)
      .post(runsUrl())
      .send({ name })
      .expect(201);
    return (res.body.data || res.body).id;
  }

  // ---------- Create Test Run ----------

  describe('POST /api/v1/projects/:projectId/runs', () => {
    it('should create a test run with minimal fields', async () => {
      const res = await authRequest(app, accessToken)
        .post(runsUrl())
        .send({ name: 'Sprint 1 Regression' })
        .expect(201);

      const run = res.body.data || res.body;
      expect(run).toBeDefined();
      expect(run.id).toBeDefined();
      expect(run.name).toBe('Sprint 1 Regression');
      expect(run.projectId).toBe(projectId);
      expect(run.status).toBe('not_started');
      expect(run.startedAt).toBeNull();
      expect(run.completedAt).toBeNull();
    });

    it('should create a test run with all optional fields', async () => {
      const config = { environment: 'staging', browser: 'chrome' };

      const res = await authRequest(app, accessToken)
        .post(runsUrl())
        .send({
          name: 'Full Config Run',
          description: 'A detailed test run',
          config,
          assigneeId: userId,
        })
        .expect(201);

      const run = res.body.data || res.body;
      expect(run.name).toBe('Full Config Run');
      expect(run.description).toBe('A detailed test run');
      expect(run.config).toEqual(config);
      expect(run.assigneeId).toBe(userId);
    });

    it('should reject a test run with a name that is too short', async () => {
      await authRequest(app, accessToken)
        .post(runsUrl())
        .send({ name: 'AB' })
        .expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post(runsUrl())
        .send({ name: 'Unauthenticated Run' })
        .expect(401);
    });
  });

  // ---------- List Test Runs ----------

  describe('GET /api/v1/projects/:projectId/runs', () => {
    it('should return an empty list when no test runs exist', async () => {
      const res = await authRequest(app, accessToken)
        .get(runsUrl())
        .expect(200);

      const runs = res.body.data || res.body;
      expect(Array.isArray(runs)).toBe(true);
      expect(runs.length).toBe(0);
    });

    it('should return all test runs for the project', async () => {
      await createTestRun('Run A');
      await createTestRun('Run B');

      const res = await authRequest(app, accessToken)
        .get(runsUrl())
        .expect(200);

      const runs = res.body.data || res.body;
      expect(runs.length).toBe(2);
      const names = runs.map((r: any) => r.name);
      expect(names).toContain('Run A');
      expect(names).toContain('Run B');
    });
  });

  // ---------- Get Test Run by ID ----------

  describe('GET /api/v1/projects/:projectId/runs/:id', () => {
    it('should return a test run by ID', async () => {
      const runId = await createTestRun('Findable Run');

      const res = await authRequest(app, accessToken)
        .get(runsUrl(`/${runId}`))
        .expect(200);

      const run = res.body.data || res.body;
      expect(run.id).toBe(runId);
      expect(run.name).toBe('Findable Run');
    });

    it('should return 404 for a non-existent test run', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .get(runsUrl(`/${fakeId}`))
        .expect(404);
    });
  });

  // ---------- Update Test Run ----------

  describe('PATCH /api/v1/projects/:projectId/runs/:id', () => {
    it('should update a test run name', async () => {
      const runId = await createTestRun('Original Run');

      const res = await authRequest(app, accessToken)
        .patch(runsUrl(`/${runId}`))
        .send({ name: 'Updated Run' })
        .expect(200);

      const run = res.body.data || res.body;
      expect(run.name).toBe('Updated Run');
    });

    it('should update status to in_progress and set startedAt', async () => {
      const runId = await createTestRun('Status Run');

      const res = await authRequest(app, accessToken)
        .patch(runsUrl(`/${runId}`))
        .send({ status: 'in_progress' })
        .expect(200);

      const run = res.body.data || res.body;
      expect(run.status).toBe('in_progress');
      expect(run.startedAt).toBeDefined();
      expect(run.startedAt).not.toBeNull();
    });
  });

  // ---------- Delete Test Run ----------

  describe('DELETE /api/v1/projects/:projectId/runs/:id', () => {
    it('should soft-delete a test run', async () => {
      const runId = await createTestRun('Deletable Run');

      await authRequest(app, accessToken)
        .delete(runsUrl(`/${runId}`))
        .expect(204);

      await authRequest(app, accessToken)
        .get(runsUrl(`/${runId}`))
        .expect(404);
    });
  });

  // ---------- Start / Complete / Close ----------

  describe('Test Run Lifecycle', () => {
    it('should start a test run', async () => {
      const runId = await createTestRun('Lifecycle Run');

      const res = await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/start`))
        .expect(200);

      const run = res.body.data || res.body;
      expect(run.status).toBe('in_progress');
      expect(run.startedAt).not.toBeNull();
    });

    it('should complete a test run', async () => {
      const runId = await createTestRun('Completable Run');

      // Start first
      await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/start`))
        .expect(200);

      // Complete
      const res = await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/complete`))
        .expect(200);

      const run = res.body.data || res.body;
      expect(run.status).toBe('completed');
      expect(run.completedAt).not.toBeNull();
    });

    it('should close a test run', async () => {
      const runId = await createTestRun('Closable Run');

      const res = await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/close`))
        .expect(200);

      const run = res.body.data || res.body;
      expect(run.status).toBe('completed');
      expect(run.completedAt).not.toBeNull();
    });
  });

  // ---------- Test Results ----------

  describe('Test Results', () => {
    let runId: string;
    let testCaseId1: string;
    let testCaseId2: string;
    let testCaseId3: string;

    beforeEach(async () => {
      // Create test cases and a run
      testCaseId1 = await createTestCase('Login Test');
      testCaseId2 = await createTestCase('Logout Test');
      testCaseId3 = await createTestCase('Profile Test');
      runId = await createTestRun('Results Run');
    });

    describe('POST /runs/:id/results', () => {
      it('should add a test result to the run', async () => {
        const res = await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({
            testCaseId: testCaseId1,
            status: 'passed',
            comment: 'All assertions passed',
            elapsedSeconds: 120,
          })
          .expect(201);

        const result = res.body.data || res.body;
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.testRunId).toBe(runId);
        expect(result.testCaseId).toBe(testCaseId1);
        expect(result.status).toBe('passed');
        expect(result.comment).toBe('All assertions passed');
        expect(result.elapsedSeconds).toBe(120);
        expect(result.executedAt).not.toBeNull();
      });

      it('should add a result with untested status (no executedAt)', async () => {
        const res = await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({
            testCaseId: testCaseId1,
            status: 'untested',
          })
          .expect(201);

        const result = res.body.data || res.body;
        expect(result.status).toBe('untested');
        expect(result.executedAt).toBeNull();
      });

      it('should reject duplicate results for the same test case', async () => {
        // Add first result
        await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId1, status: 'passed' })
          .expect(201);

        // Duplicate
        await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId1, status: 'failed' })
          .expect(409);
      });

      it('should add results with defects', async () => {
        const res = await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({
            testCaseId: testCaseId1,
            status: 'failed',
            comment: 'Button not clickable',
            defects: ['BUG-123', 'BUG-456'],
          })
          .expect(201);

        const result = res.body.data || res.body;
        expect(result.status).toBe('failed');
        expect(result.defects).toEqual(['BUG-123', 'BUG-456']);
      });
    });

    describe('GET /runs/:id/results', () => {
      it('should return all results for a test run', async () => {
        // Add 3 results
        await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId1, status: 'passed' })
          .expect(201);

        await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId2, status: 'failed' })
          .expect(201);

        await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId3, status: 'untested' })
          .expect(201);

        const res = await authRequest(app, accessToken)
          .get(runsUrl(`/${runId}/results`))
          .expect(200);

        const results = res.body.data || res.body;
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(3);

        const statuses = results.map((r: any) => r.status);
        expect(statuses).toContain('passed');
        expect(statuses).toContain('failed');
        expect(statuses).toContain('untested');
      });

      it('should return an empty list when no results exist', async () => {
        const res = await authRequest(app, accessToken)
          .get(runsUrl(`/${runId}/results`))
          .expect(200);

        const results = res.body.data || res.body;
        expect(results.length).toBe(0);
      });
    });

    describe('PATCH /runs/:id/results/:resultId', () => {
      it('should update a test result status', async () => {
        const addRes = await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId1, status: 'untested' })
          .expect(201);

        const resultId = (addRes.body.data || addRes.body).id;

        const updateRes = await authRequest(app, accessToken)
          .patch(runsUrl(`/${runId}/results/${resultId}`))
          .send({ status: 'passed', comment: 'Retested and passed' })
          .expect(200);

        const result = updateRes.body.data || updateRes.body;
        expect(result.status).toBe('passed');
        expect(result.comment).toBe('Retested and passed');
        expect(result.executedAt).not.toBeNull();
      });
    });

    describe('DELETE /runs/:id/results/:resultId', () => {
      it('should delete a test result', async () => {
        const addRes = await authRequest(app, accessToken)
          .post(runsUrl(`/${runId}/results`))
          .send({ testCaseId: testCaseId1, status: 'passed' })
          .expect(201);

        const resultId = (addRes.body.data || addRes.body).id;

        await authRequest(app, accessToken)
          .delete(runsUrl(`/${runId}/results/${resultId}`))
          .expect(204);

        // Should be gone
        await authRequest(app, accessToken)
          .get(runsUrl(`/${runId}/results/${resultId}`))
          .expect(404);
      });
    });
  });

  // ---------- Progress & Statistics ----------

  describe('Progress and Statistics', () => {
    let runId: string;

    beforeEach(async () => {
      // Create test cases
      const tc1 = await createTestCase('TC 1');
      const tc2 = await createTestCase('TC 2');
      const tc3 = await createTestCase('TC 3');
      const tc4 = await createTestCase('TC 4');

      // Create run
      runId = await createTestRun('Stats Run');

      // Add results
      await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/results`))
        .send({ testCaseId: tc1, status: 'passed' })
        .expect(201);

      await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/results`))
        .send({ testCaseId: tc2, status: 'passed' })
        .expect(201);

      await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/results`))
        .send({ testCaseId: tc3, status: 'failed' })
        .expect(201);

      await authRequest(app, accessToken)
        .post(runsUrl(`/${runId}/results`))
        .send({ testCaseId: tc4, status: 'untested' })
        .expect(201);
    });

    describe('GET /runs/:id/progress', () => {
      it('should return progress for a test run', async () => {
        const res = await authRequest(app, accessToken)
          .get(runsUrl(`/${runId}/progress`))
          .expect(200);

        const progress = res.body.data || res.body;
        expect(progress.testRunId).toBe(runId);
        expect(progress.total).toBe(4);
        expect(progress.executed).toBe(3); // passed + failed
        expect(progress.remaining).toBe(1); // untested
        expect(progress.progressPercentage).toBe(75); // 3/4 * 100
      });
    });

    describe('GET /runs/:id/statistics', () => {
      it('should return detailed statistics for a test run', async () => {
        const res = await authRequest(app, accessToken)
          .get(runsUrl(`/${runId}/statistics`))
          .expect(200);

        const stats = res.body.data || res.body;
        expect(stats.total).toBe(4);
        expect(stats.passed).toBe(2);
        expect(stats.failed).toBe(1);
        expect(stats.untested).toBe(1);
        expect(stats.blocked).toBe(0);
        expect(stats.skipped).toBe(0);
        expect(stats.retest).toBe(0);
        // passRate = passed / executed * 100 = 2/3 * 100 = 67
        expect(stats.passRate).toBe(67);
      });
    });
  });

  // ---------- Full Flow ----------

  describe('Complete Test Run Flow', () => {
    it('should handle create project -> create cases -> create run -> add results -> progress -> complete', async () => {
      // 1. Create test cases
      const tc1 = await createTestCase('Login');
      const tc2 = await createTestCase('Logout');
      const tc3 = await createTestCase('Dashboard');

      // 2. Create run
      const createRunRes = await authRequest(app, accessToken)
        .post(runsUrl())
        .send({
          name: 'Sprint 1 Regression',
          description: 'Full regression for sprint 1',
          config: { environment: 'staging' },
        })
        .expect(201);

      const run = createRunRes.body.data || createRunRes.body;
      expect(run.status).toBe('not_started');

      // 3. Start the run
      const startRes = await authRequest(app, accessToken)
        .post(runsUrl(`/${run.id}/start`))
        .expect(200);

      expect((startRes.body.data || startRes.body).status).toBe('in_progress');

      // 4. Add results
      await authRequest(app, accessToken)
        .post(runsUrl(`/${run.id}/results`))
        .send({ testCaseId: tc1, status: 'passed', elapsedSeconds: 30 })
        .expect(201);

      await authRequest(app, accessToken)
        .post(runsUrl(`/${run.id}/results`))
        .send({
          testCaseId: tc2,
          status: 'failed',
          comment: 'Logout button not visible',
          defects: ['BUG-42'],
          elapsedSeconds: 60,
        })
        .expect(201);

      await authRequest(app, accessToken)
        .post(runsUrl(`/${run.id}/results`))
        .send({ testCaseId: tc3, status: 'passed', elapsedSeconds: 45 })
        .expect(201);

      // 5. Check progress
      const progressRes = await authRequest(app, accessToken)
        .get(runsUrl(`/${run.id}/progress`))
        .expect(200);

      const progress = progressRes.body.data || progressRes.body;
      expect(progress.total).toBe(3);
      expect(progress.executed).toBe(3);
      expect(progress.remaining).toBe(0);
      expect(progress.progressPercentage).toBe(100);

      // 6. Check statistics
      const statsRes = await authRequest(app, accessToken)
        .get(runsUrl(`/${run.id}/statistics`))
        .expect(200);

      const stats = statsRes.body.data || statsRes.body;
      expect(stats.total).toBe(3);
      expect(stats.passed).toBe(2);
      expect(stats.failed).toBe(1);
      // passRate = 2/3 * 100 = 67
      expect(stats.passRate).toBe(67);

      // 7. Get results list
      const resultsRes = await authRequest(app, accessToken)
        .get(runsUrl(`/${run.id}/results`))
        .expect(200);

      const results = resultsRes.body.data || resultsRes.body;
      expect(results.length).toBe(3);

      // 8. Complete the run
      const completeRes = await authRequest(app, accessToken)
        .post(runsUrl(`/${run.id}/complete`))
        .expect(200);

      const completed = completeRes.body.data || completeRes.body;
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).not.toBeNull();

      // 9. Verify the run is marked as completed
      const finalRes = await authRequest(app, accessToken)
        .get(runsUrl(`/${run.id}`))
        .expect(200);

      const finalRun = finalRes.body.data || finalRes.body;
      expect(finalRun.status).toBe('completed');
    });
  });
});
