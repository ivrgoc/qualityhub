import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateTestRunsTable1737838500000 } from './1737838500000-CreateTestRunsTable';

describe('CreateTestRunsTable1737838500000', () => {
  let migration: CreateTestRunsTable1737838500000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateTestRunsTable1737838500000();
    mockQueryRunner = {
      createTable: jest.fn(),
      dropTable: jest.fn(),
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
      createForeignKey: jest.fn(),
      dropForeignKey: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  describe('name', () => {
    it('should have the correct migration name', () => {
      expect(migration.name).toBe('CreateTestRunsTable1737838500000');
    });
  });

  describe('up', () => {
    it('should create the test_runs table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('test_runs');
    });

    it('should create table with id column as UUID primary key', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const idColumn = tableArg.columns.find((col) => col.name === 'id');

      expect(idColumn).toBeDefined();
      expect(idColumn?.type).toBe('uuid');
      expect(idColumn?.isPrimary).toBe(true);
      expect(idColumn?.generationStrategy).toBe('uuid');
      expect(idColumn?.default).toBe('uuid_generate_v4()');
    });

    it('should create table with project_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const projectIdColumn = tableArg.columns.find(
        (col) => col.name === 'project_id',
      );

      expect(projectIdColumn).toBeDefined();
      expect(projectIdColumn?.type).toBe('uuid');
      expect(projectIdColumn?.isNullable).toBe(false);
    });

    it('should create table with plan_id column as nullable UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const planIdColumn = tableArg.columns.find(
        (col) => col.name === 'plan_id',
      );

      expect(planIdColumn).toBeDefined();
      expect(planIdColumn?.type).toBe('uuid');
      expect(planIdColumn?.isNullable).toBe(true);
    });

    it('should create table with name column', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const nameColumn = tableArg.columns.find((col) => col.name === 'name');

      expect(nameColumn).toBeDefined();
      expect(nameColumn?.type).toBe('varchar');
      expect(nameColumn?.length).toBe('255');
      expect(nameColumn?.isNullable).toBe(false);
    });

    it('should create table with config column as nullable JSONB', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const configColumn = tableArg.columns.find(
        (col) => col.name === 'config',
      );

      expect(configColumn).toBeDefined();
      expect(configColumn?.type).toBe('jsonb');
      expect(configColumn?.isNullable).toBe(true);
    });

    it('should create table with assignee_id column as nullable UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const assigneeIdColumn = tableArg.columns.find(
        (col) => col.name === 'assignee_id',
      );

      expect(assigneeIdColumn).toBeDefined();
      expect(assigneeIdColumn?.type).toBe('uuid');
      expect(assigneeIdColumn?.isNullable).toBe(true);
    });

    it('should create table with created_at column with default timestamp', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const createdAtColumn = tableArg.columns.find(
        (col) => col.name === 'created_at',
      );

      expect(createdAtColumn).toBeDefined();
      expect(createdAtColumn?.type).toBe('timestamp with time zone');
      expect(createdAtColumn?.default).toBe('CURRENT_TIMESTAMP');
    });

    it('should create table with updated_at column with default timestamp', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const updatedAtColumn = tableArg.columns.find(
        (col) => col.name === 'updated_at',
      );

      expect(updatedAtColumn).toBeDefined();
      expect(updatedAtColumn?.type).toBe('timestamp with time zone');
      expect(updatedAtColumn?.default).toBe('CURRENT_TIMESTAMP');
    });

    it('should create index on project_id column', async () => {
      await migration.up(mockQueryRunner);

      const projectIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RUNS_PROJECT_ID',
      );
      expect(projectIdIndexCall).toBeDefined();
      const projectIdIndex = projectIdIndexCall?.[1] as TableIndex;
      expect(projectIdIndex.columnNames).toContain('project_id');
    });

    it('should create index on plan_id column', async () => {
      await migration.up(mockQueryRunner);

      const planIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RUNS_PLAN_ID',
      );
      expect(planIdIndexCall).toBeDefined();
      const planIdIndex = planIdIndexCall?.[1] as TableIndex;
      expect(planIdIndex.columnNames).toContain('plan_id');
    });

    it('should create index on assignee_id column', async () => {
      await migration.up(mockQueryRunner);

      const assigneeIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RUNS_ASSIGNEE_ID',
      );
      expect(assigneeIdIndexCall).toBeDefined();
      const assigneeIdIndex = assigneeIdIndexCall?.[1] as TableIndex;
      expect(assigneeIdIndex.columnNames).toContain('assignee_id');
    });

    it('should create foreign key to projects table with CASCADE on delete', async () => {
      await migration.up(mockQueryRunner);

      const projectFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_RUNS_PROJECT_ID',
      );
      expect(projectFkCall).toBeDefined();

      const fkArg = projectFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('project_id');
      expect(fkArg.referencedTableName).toBe('projects');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });

    it('should create foreign key to test_plans table with SET NULL on delete', async () => {
      await migration.up(mockQueryRunner);

      const planFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) => (call[1] as TableForeignKey).name === 'FK_TEST_RUNS_PLAN_ID',
      );
      expect(planFkCall).toBeDefined();

      const fkArg = planFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('plan_id');
      expect(fkArg.referencedTableName).toBe('test_plans');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('SET NULL');
    });

    it('should create foreign key to users table with SET NULL on delete', async () => {
      await migration.up(mockQueryRunner);

      const assigneeFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_RUNS_ASSIGNEE_ID',
      );
      expect(assigneeFkCall).toBeDefined();

      const fkArg = assigneeFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('assignee_id');
      expect(fkArg.referencedTableName).toBe('users');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('SET NULL');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to users (assignee)', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_runs',
        'FK_TEST_RUNS_ASSIGNEE_ID',
      );
    });

    it('should drop the foreign key to test_plans', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_runs',
        'FK_TEST_RUNS_PLAN_ID',
      );
    });

    it('should drop the foreign key to projects', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_runs',
        'FK_TEST_RUNS_PROJECT_ID',
      );
    });

    it('should drop the index on assignee_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_runs',
        'IDX_TEST_RUNS_ASSIGNEE_ID',
      );
    });

    it('should drop the index on plan_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_runs',
        'IDX_TEST_RUNS_PLAN_ID',
      );
    });

    it('should drop the index on project_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_runs',
        'IDX_TEST_RUNS_PROJECT_ID',
      );
    });

    it('should drop the test_runs table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('test_runs');
    });

    it('should drop in correct order: foreign keys, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropAssigneeFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropPlanFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[1];
      const dropProjectFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[2];
      const dropAssigneeIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropPlanIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropProjectIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[2];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropAssigneeFKCallOrder).toBeLessThan(dropPlanFKCallOrder);
      expect(dropPlanFKCallOrder).toBeLessThan(dropProjectFKCallOrder);
      expect(dropProjectFKCallOrder).toBeLessThan(dropAssigneeIdIndexCallOrder);
      expect(dropAssigneeIdIndexCallOrder).toBeLessThan(
        dropPlanIdIndexCallOrder,
      );
      expect(dropPlanIdIndexCallOrder).toBeLessThan(dropProjectIdIndexCallOrder);
      expect(dropProjectIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
