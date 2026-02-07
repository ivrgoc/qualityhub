import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createIntegrationTestApp,
  clearDatabase,
  registerAndLogin,
  authRequest,
} from './setup';

describe('Projects Integration Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let orgId: string;
  let userId: string;

  beforeAll(async () => {
    app = await createIntegrationTestApp();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);

    // Create a fresh authenticated user for each test
    const auth = await registerAndLogin(app);
    accessToken = auth.accessToken;
    orgId = auth.user.orgId;
    userId = auth.user.id;
  });

  // ---------- Create Project ----------

  describe('POST /api/v1/projects', () => {
    it('should create a project successfully', async () => {
      const res = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'My First Project',
          description: 'A test project for integration testing',
        })
        .expect(201);

      const project = res.body.data || res.body;
      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.name).toBe('My First Project');
      expect(project.description).toBe(
        'A test project for integration testing',
      );
      expect(project.organizationId).toBe(orgId);
    });

    it('should create a project with settings', async () => {
      const settings = { theme: 'dark', notifications: true };

      const res = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'Project With Settings',
          settings,
        })
        .expect(201);

      const project = res.body.data || res.body;
      expect(project.settings).toEqual(settings);
    });

    it('should reject creating a project without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'Unauthorized Project',
        })
        .expect(401);
    });

    it('should reject creating a project with a name that is too short', async () => {
      await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'AB', // less than 3 chars
        })
        .expect(400);
    });

    it('should reject creating a project without a name', async () => {
      await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
        })
        .expect(400);
    });

    it('should reject creating a project without organizationId', async () => {
      await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          name: 'Missing Org Project',
        })
        .expect(400);
    });
  });

  // ---------- List Projects ----------

  describe('GET /api/v1/projects', () => {
    it('should return an empty list when no projects exist', async () => {
      const res = await authRequest(app, accessToken)
        .get('/api/v1/projects')
        .expect(200);

      const projects = res.body.data || res.body;
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });

    it('should return all created projects', async () => {
      // Create two projects
      await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({ organizationId: orgId, name: 'Project Alpha' })
        .expect(201);

      await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({ organizationId: orgId, name: 'Project Beta' })
        .expect(201);

      const res = await authRequest(app, accessToken)
        .get('/api/v1/projects')
        .expect(200);

      const projects = res.body.data || res.body;
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(2);

      const names = projects.map((p: any) => p.name);
      expect(names).toContain('Project Alpha');
      expect(names).toContain('Project Beta');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(401);
    });
  });

  // ---------- Get Project by ID ----------

  describe('GET /api/v1/projects/:id', () => {
    it('should return a project by ID', async () => {
      const createRes = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'Findable Project',
          description: 'Can be found by ID',
        })
        .expect(201);

      const created = createRes.body.data || createRes.body;

      const getRes = await authRequest(app, accessToken)
        .get(`/api/v1/projects/${created.id}`)
        .expect(200);

      const project = getRes.body.data || getRes.body;
      expect(project.id).toBe(created.id);
      expect(project.name).toBe('Findable Project');
      expect(project.description).toBe('Can be found by ID');
    });

    it('should return 404 for a non-existent project', async () => {
      const fakeUuid = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .get(`/api/v1/projects/${fakeUuid}`)
        .expect(404);
    });

    it('should return 400 for an invalid UUID', async () => {
      await authRequest(app, accessToken)
        .get('/api/v1/projects/not-a-uuid')
        .expect(400);
    });
  });

  // ---------- Update Project ----------

  describe('PATCH /api/v1/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const res = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'Original Name',
          description: 'Original description',
        })
        .expect(201);

      projectId = (res.body.data || res.body).id;
    });

    it('should update a project name', async () => {
      const res = await authRequest(app, accessToken)
        .patch(`/api/v1/projects/${projectId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      const project = res.body.data || res.body;
      expect(project.name).toBe('Updated Name');

      // Verify persisted state by re-fetching
      const getRes = await authRequest(app, accessToken)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      const fetched = getRes.body.data || getRes.body;
      expect(fetched.name).toBe('Updated Name');
      expect(fetched.description).toBe('Original description');
    });

    it('should update a project description', async () => {
      const res = await authRequest(app, accessToken)
        .patch(`/api/v1/projects/${projectId}`)
        .send({ description: 'Updated description' })
        .expect(200);

      const project = res.body.data || res.body;
      expect(project.description).toBe('Updated description');

      // Verify persisted state by re-fetching
      const getRes = await authRequest(app, accessToken)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      const fetched = getRes.body.data || getRes.body;
      expect(fetched.description).toBe('Updated description');
      expect(fetched.name).toBe('Original Name');
    });

    it('should update project settings', async () => {
      const newSettings = { featureFlags: { darkMode: true } };

      const res = await authRequest(app, accessToken)
        .patch(`/api/v1/projects/${projectId}`)
        .send({ settings: newSettings })
        .expect(200);

      const project = res.body.data || res.body;
      expect(project.settings).toEqual(newSettings);
    });

    it('should return 404 when updating a non-existent project', async () => {
      const fakeUuid = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .patch(`/api/v1/projects/${fakeUuid}`)
        .send({ name: 'Ghost Project' })
        .expect(404);
    });

    it('should reject update with name that is too short', async () => {
      await authRequest(app, accessToken)
        .patch(`/api/v1/projects/${projectId}`)
        .send({ name: 'AB' })
        .expect(400);
    });
  });

  // ---------- Delete Project ----------

  describe('DELETE /api/v1/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const res = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'Deletable Project',
        })
        .expect(201);

      projectId = (res.body.data || res.body).id;
    });

    it('should soft-delete a project', async () => {
      await authRequest(app, accessToken)
        .delete(`/api/v1/projects/${projectId}`)
        .expect(204);

      // Project should no longer be found (soft-deleted)
      await authRequest(app, accessToken)
        .get(`/api/v1/projects/${projectId}`)
        .expect(404);
    });

    it('should return 404 when deleting a non-existent project', async () => {
      const fakeUuid = '00000000-0000-4000-a000-000000000000';

      await authRequest(app, accessToken)
        .delete(`/api/v1/projects/${fakeUuid}`)
        .expect(404);
    });

    it('should not include deleted projects in the list', async () => {
      // Create a second project
      await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({ organizationId: orgId, name: 'Remaining Project' })
        .expect(201);

      // Delete the first one
      await authRequest(app, accessToken)
        .delete(`/api/v1/projects/${projectId}`)
        .expect(204);

      // List should only contain the remaining project
      const listRes = await authRequest(app, accessToken)
        .get('/api/v1/projects')
        .expect(200);

      const projects = listRes.body.data || listRes.body;
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe('Remaining Project');
    });
  });

  // ---------- Full CRUD Flow ----------

  describe('Complete CRUD Flow', () => {
    it('should handle create -> list -> get -> update -> delete', async () => {
      // 1. Create
      const createRes = await authRequest(app, accessToken)
        .post('/api/v1/projects')
        .send({
          organizationId: orgId,
          name: 'CRUD Project',
          description: 'Testing full CRUD',
          settings: { version: 1 },
        })
        .expect(201);

      const created = createRes.body.data || createRes.body;
      expect(created.id).toBeDefined();
      expect(created.name).toBe('CRUD Project');

      // 2. List (should contain the project)
      const listRes = await authRequest(app, accessToken)
        .get('/api/v1/projects')
        .expect(200);

      const projects = listRes.body.data || listRes.body;
      expect(projects.length).toBeGreaterThanOrEqual(1);
      expect(projects.some((p: any) => p.id === created.id)).toBe(true);

      // 3. Get by ID
      const getRes = await authRequest(app, accessToken)
        .get(`/api/v1/projects/${created.id}`)
        .expect(200);

      const fetched = getRes.body.data || getRes.body;
      expect(fetched.id).toBe(created.id);
      expect(fetched.name).toBe('CRUD Project');

      // 4. Update
      const updateRes = await authRequest(app, accessToken)
        .patch(`/api/v1/projects/${created.id}`)
        .send({
          name: 'Updated CRUD Project',
          description: 'Updated description',
          settings: { version: 2 },
        })
        .expect(200);

      const updated = updateRes.body.data || updateRes.body;
      expect(updated.name).toBe('Updated CRUD Project');
      expect(updated.description).toBe('Updated description');
      expect(updated.settings).toEqual({ version: 2 });

      // 5. Verify update persisted
      const verifyRes = await authRequest(app, accessToken)
        .get(`/api/v1/projects/${created.id}`)
        .expect(200);

      const verified = verifyRes.body.data || verifyRes.body;
      expect(verified.name).toBe('Updated CRUD Project');

      // 6. Delete
      await authRequest(app, accessToken)
        .delete(`/api/v1/projects/${created.id}`)
        .expect(204);

      // 7. Verify deletion
      await authRequest(app, accessToken)
        .get(`/api/v1/projects/${created.id}`)
        .expect(404);
    });
  });
});
