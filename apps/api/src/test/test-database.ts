import { DataSource, DataSourceOptions } from 'typeorm';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { User } from '../modules/users/entities/user.entity';
import { RefreshToken } from '../modules/users/entities/refresh-token.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { ProjectMember } from '../modules/projects/entities/project-member.entity';
import { TestSuite } from '../modules/test-suites/entities/test-suite.entity';
import { Section } from '../modules/test-suites/entities/section.entity';
import { TestCase } from '../modules/test-cases/entities/test-case.entity';
import { TestCaseVersion } from '../modules/test-cases/entities/test-case-version.entity';
import { Milestone } from '../modules/milestones/entities/milestone.entity';
import { TestPlan } from '../modules/test-plans/entities/test-plan.entity';
import { TestPlanEntry } from '../modules/test-plans/entities/test-plan-entry.entity';
import { TestRun } from '../modules/test-runs/entities/test-run.entity';
import { TestResult } from '../modules/test-runs/entities/test-result.entity';
import { Requirement } from '../modules/requirements/entities/requirement.entity';
import { RequirementCoverage } from '../modules/requirements/entities/requirement-coverage.entity';
import { Attachment } from '../modules/attachments/entities/attachment.entity';

/**
 * Get the list of all entities for testing
 */
export const getTestEntities = () => [
  Organization,
  User,
  RefreshToken,
  Project,
  ProjectMember,
  TestSuite,
  Section,
  TestCase,
  TestCaseVersion,
  Milestone,
  TestPlan,
  TestPlanEntry,
  TestRun,
  TestResult,
  Requirement,
  RequirementCoverage,
  Attachment,
];

/**
 * Test database configuration options
 */
export const getTestDatabaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.TEST_DATABASE_HOST || 'localhost',
  port: parseInt(process.env.TEST_DATABASE_PORT || '5432', 10),
  username: process.env.TEST_POSTGRES_USER || 'qualityhub',
  password: process.env.TEST_POSTGRES_PASSWORD || 'qualityhub_secret',
  database: process.env.TEST_POSTGRES_DB || 'qualityhub_test',
  entities: getTestEntities(),
  synchronize: true,
  dropSchema: true,
  logging: false,
});

let testDataSource: DataSource | null = null;

/**
 * Initialize the test database connection
 */
export const initTestDatabase = async (): Promise<DataSource> => {
  if (testDataSource && testDataSource.isInitialized) {
    return testDataSource;
  }

  testDataSource = new DataSource(getTestDatabaseConfig());
  await testDataSource.initialize();
  return testDataSource;
};

/**
 * Close the test database connection
 */
export const closeTestDatabase = async (): Promise<void> => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
    testDataSource = null;
  }
};

/**
 * Get the test data source (must be initialized first)
 */
export const getTestDataSource = (): DataSource => {
  if (!testDataSource || !testDataSource.isInitialized) {
    throw new Error('Test database not initialized. Call initTestDatabase() first.');
  }
  return testDataSource;
};

/**
 * Clear all data from the test database
 * Respects foreign key constraints by deleting in correct order
 */
export const clearTestDatabase = async (): Promise<void> => {
  const dataSource = getTestDataSource();

  // Delete in reverse order of dependencies
  const entities = [
    'Attachment',
    'RequirementCoverage',
    'Requirement',
    'TestResult',
    'TestRun',
    'TestPlanEntry',
    'TestPlan',
    'Milestone',
    'TestCaseVersion',
    'TestCase',
    'Section',
    'TestSuite',
    'ProjectMember',
    'Project',
    'RefreshToken',
    'User',
    'Organization',
  ];

  for (const entityName of entities) {
    const repository = dataSource.getRepository(entityName);
    await repository.query(`TRUNCATE TABLE "${repository.metadata.tableName}" CASCADE`);
  }
};

/**
 * Reset sequences to start IDs from 1
 */
export const resetSequences = async (): Promise<void> => {
  const dataSource = getTestDataSource();
  const queryRunner = dataSource.createQueryRunner();

  try {
    const sequences = await queryRunner.query(`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
    `);

    for (const seq of sequences) {
      await queryRunner.query(`ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH 1`);
    }
  } finally {
    await queryRunner.release();
  }
};

/**
 * Clean up and reset the test database for a fresh test run
 */
export const resetTestDatabase = async (): Promise<void> => {
  await clearTestDatabase();
  await resetSequences();
};
