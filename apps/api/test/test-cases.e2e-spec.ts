import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Organization } from '../src/modules/organizations/entities/organization.entity';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { Project } from '../src/modules/projects/entities/project.entity';
import {
  TestCase,
  TestCaseTemplate,
  Priority,
} from '../src/modules/test-cases/entities/test-case.entity';
import * as bcrypt from 'bcrypt';

describe('TestCasesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testOrganization: Organization;
  let testUser: User;
  let testProject: Project;
  let accessToken: string;

  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dataSource.query('TRUNCATE TABLE test_case_versions CASCADE');
    await dataSource.query('TRUNCATE TABLE test_cases CASCADE');
    await dataSource.query('TRUNCATE TABLE projects CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await dataSource.query('TRUNCATE TABLE organizations CASCADE');

    // Create test organization
    const orgRepository = dataSource.getRepository(Organization);
    testOrganization = await orgRepository.save({
      name: 'Test Organization',
      slug: 'test-org',
    });

    // Create test user
    const userRepository = dataSource.getRepository(User);
    const passwordHash = await bcrypt.hash(testPassword, 10);
    testUser = await userRepository.save({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      role: UserRole.TESTER,
      organizationId: testOrganization.id,
    });

    // Create test project
    const projectRepository = dataSource.getRepository(Project);
    testProject = await projectRepository.save({
      name: 'Test Project',
      description: 'A test project',
      organizationId: testOrganization.id,
    });

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testPassword,
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/projects/:projectId/cases', () => {
    const createTestCaseDto = {
      title: 'Login with valid credentials',
      templateType: TestCaseTemplate.STEPS,
      preconditions: 'User has a valid account',
      steps: [
        { step: 'Navigate to login page', expectedResult: 'Login page displayed' },
        { step: 'Enter valid credentials', expectedResult: 'Credentials entered' },
        { step: 'Click login button', expectedResult: 'User logged in' },
      ],
      expectedResult: 'User is authenticated',
      priority: Priority.HIGH,
      estimate: 5,
    };

    it('should create a test case successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTestCaseDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', createTestCaseDto.title);
      expect(response.body).toHaveProperty('templateType', createTestCaseDto.templateType);
      expect(response.body).toHaveProperty('priority', createTestCaseDto.priority);
      expect(response.body).toHaveProperty('version', 1);
      expect(response.body).toHaveProperty('projectId', testProject.id);
      expect(response.body).toHaveProperty('createdBy', testUser.id);
    });

    it('should create a BDD test case', async () => {
      const bddTestCase = {
        title: 'User login scenario',
        templateType: TestCaseTemplate.BDD,
        steps: [
          {
            step: `Feature: User Login
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be logged in successfully`,
            expectedResult: '',
          },
        ],
        priority: Priority.MEDIUM,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bddTestCase);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('templateType', TestCaseTemplate.BDD);
    });

    it('should return 400 for missing title', async () => {
      const { title, ...dtoWithoutTitle } = createTestCaseDto;
      void title;
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dtoWithoutTitle);

      expect(response.status).toBe(400);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases`)
        .send(createTestCaseDto);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid project ID format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects/invalid-id/cases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTestCaseDto);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/projects/:projectId/cases', () => {
    let testCase1: TestCase;
    let testCase2: TestCase;

    beforeEach(async () => {
      const testCaseRepository = dataSource.getRepository(TestCase);
      testCase1 = await testCaseRepository.save({
        title: 'Test Case 1',
        projectId: testProject.id,
        priority: Priority.HIGH,
        createdBy: testUser.id,
      });
      testCase2 = await testCaseRepository.save({
        title: 'Test Case 2',
        projectId: testProject.id,
        priority: Priority.LOW,
        createdBy: testUser.id,
      });
    });

    it('should return all test cases for a project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.map((tc: TestCase) => tc.id)).toContain(testCase1.id);
      expect(response.body.map((tc: TestCase) => tc.id)).toContain(testCase2.id);
    });

    it('should return empty array for project with no test cases', async () => {
      const projectRepository = dataSource.getRepository(Project);
      const emptyProject = await projectRepository.save({
        name: 'Empty Project',
        organizationId: testOrganization.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${emptyProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/projects/:projectId/cases/:id', () => {
    let testCase: TestCase;

    beforeEach(async () => {
      const testCaseRepository = dataSource.getRepository(TestCase);
      testCase = await testCaseRepository.save({
        title: 'Test Case',
        templateType: TestCaseTemplate.STEPS,
        preconditions: 'Some preconditions',
        steps: [{ step: 'Step 1', expectedResult: 'Result 1' }],
        projectId: testProject.id,
        priority: Priority.MEDIUM,
        createdBy: testUser.id,
      });
    });

    it('should return a test case by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testCase.id);
      expect(response.body).toHaveProperty('title', testCase.title);
      expect(response.body).toHaveProperty('preconditions', testCase.preconditions);
      expect(response.body).toHaveProperty('steps');
    });

    it('should return 404 for non-existent test case', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid test case ID format', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/invalid-id`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/projects/:projectId/cases/:id', () => {
    let testCase: TestCase;

    beforeEach(async () => {
      const testCaseRepository = dataSource.getRepository(TestCase);
      testCase = await testCaseRepository.save({
        title: 'Original Title',
        projectId: testProject.id,
        priority: Priority.LOW,
        version: 1,
        createdBy: testUser.id,
      });
    });

    it('should update a test case successfully', async () => {
      const updateDto = {
        title: 'Updated Title',
        priority: Priority.CRITICAL,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/projects/${testProject.id}/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', updateDto.title);
      expect(response.body).toHaveProperty('priority', updateDto.priority);
      expect(response.body).toHaveProperty('version', 2); // Version incremented
    });

    it('should return 404 for non-existent test case', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/projects/${testProject.id}/cases/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
    });

    it('should allow partial updates', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/projects/${testProject.id}/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ preconditions: 'New preconditions' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preconditions', 'New preconditions');
      expect(response.body).toHaveProperty('title', testCase.title); // Unchanged
    });
  });

  describe('DELETE /api/v1/projects/:projectId/cases/:id', () => {
    let testCase: TestCase;

    beforeEach(async () => {
      const testCaseRepository = dataSource.getRepository(TestCase);
      testCase = await testCaseRepository.save({
        title: 'Test Case to Delete',
        projectId: testProject.id,
        createdBy: testUser.id,
      });
    });

    it('should delete a test case successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${testProject.id}/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);

      // Verify deletion (soft delete - should not be found)
      const findResponse = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(findResponse.status).toBe(404);
    });

    it('should return 404 for non-existent test case', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${testProject.id}/cases/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/projects/:projectId/cases/:id/history', () => {
    let testCase: TestCase;

    beforeEach(async () => {
      const testCaseRepository = dataSource.getRepository(TestCase);
      testCase = await testCaseRepository.save({
        title: 'Test Case',
        projectId: testProject.id,
        version: 1,
        createdBy: testUser.id,
      });

      // Make an update to create version history
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${testProject.id}/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' });
    });

    it('should return version history for a test case', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${testCase.id}/history`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Should have at least one version entry from the update
    });

    it('should return 404 for non-existent test case', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${nonExistentId}/history`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/projects/:projectId/cases/bulk', () => {
    it('should create multiple test cases at once', async () => {
      const bulkCreateDto = {
        testCases: [
          { title: 'Bulk Test 1', priority: Priority.HIGH },
          { title: 'Bulk Test 2', priority: Priority.MEDIUM },
          { title: 'Bulk Test 3', priority: Priority.LOW },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases/bulk`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkCreateDto);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(response.body[0]).toHaveProperty('title', 'Bulk Test 1');
      expect(response.body[1]).toHaveProperty('title', 'Bulk Test 2');
      expect(response.body[2]).toHaveProperty('title', 'Bulk Test 3');
    });

    it('should return 400 for empty test cases array', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases/bulk`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ testCases: [] });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/projects/:projectId/cases/bulk', () => {
    let testCase1: TestCase;
    let testCase2: TestCase;

    beforeEach(async () => {
      const testCaseRepository = dataSource.getRepository(TestCase);
      testCase1 = await testCaseRepository.save({
        title: 'Test 1',
        projectId: testProject.id,
        createdBy: testUser.id,
      });
      testCase2 = await testCaseRepository.save({
        title: 'Test 2',
        projectId: testProject.id,
        createdBy: testUser.id,
      });
    });

    it('should delete multiple test cases at once', async () => {
      const bulkDeleteDto = {
        ids: [testCase1.id, testCase2.id],
      };

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${testProject.id}/cases/bulk`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkDeleteDto);

      expect(response.status).toBe(200);

      // Verify both are deleted
      const listResponse = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(listResponse.body.length).toBe(0);
    });
  });

  describe('Complete Test Case Workflow', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProject.id}/cases`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Workflow Test Case',
          priority: Priority.MEDIUM,
        });

      expect(createResponse.status).toBe(201);
      const testCaseId = createResponse.body.id;

      // Read
      const readResponse = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.title).toBe('Workflow Test Case');

      // Update
      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/v1/projects/${testProject.id}/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Workflow Test',
          priority: Priority.CRITICAL,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Workflow Test');
      expect(updateResponse.body.version).toBe(2);

      // Check history
      const historyResponse = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${testCaseId}/history`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(historyResponse.status).toBe(200);

      // Delete
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${testProject.id}/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(204);

      // Verify deleted
      const verifyResponse = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProject.id}/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(verifyResponse.status).toBe(404);
    });
  });
});
