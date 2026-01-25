import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateTestPlansTable1737838400000 } from './1737838400000-CreateTestPlansTable';

describe('CreateTestPlansTable1737838400000', () => {
  let migration: CreateTestPlansTable1737838400000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateTestPlansTable1737838400000();
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
      expect(migration.name).toBe('CreateTestPlansTable1737838400000');
    });
  });

  describe('up', () => {
    it('should create the test_plans table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('test_plans');
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

    it('should create table with milestone_id column as nullable UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const milestoneIdColumn = tableArg.columns.find(
        (col) => col.name === 'milestone_id',
      );

      expect(milestoneIdColumn).toBeDefined();
      expect(milestoneIdColumn?.type).toBe('uuid');
      expect(milestoneIdColumn?.isNullable).toBe(true);
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

    it('should create index on project_id column', async () => {
      await migration.up(mockQueryRunner);

      const projectIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_PLANS_PROJECT_ID',
      );
      expect(projectIdIndexCall).toBeDefined();
      const projectIdIndex = projectIdIndexCall?.[1] as TableIndex;
      expect(projectIdIndex.columnNames).toContain('project_id');
    });

    it('should create index on milestone_id column', async () => {
      await migration.up(mockQueryRunner);

      const milestoneIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_PLANS_MILESTONE_ID',
      );
      expect(milestoneIdIndexCall).toBeDefined();
      const milestoneIdIndex = milestoneIdIndexCall?.[1] as TableIndex;
      expect(milestoneIdIndex.columnNames).toContain('milestone_id');
    });

    it('should create foreign key to projects table', async () => {
      await migration.up(mockQueryRunner);

      const projectFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_PLANS_PROJECT_ID',
      );
      expect(projectFkCall).toBeDefined();

      const fkArg = projectFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('project_id');
      expect(fkArg.referencedTableName).toBe('projects');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });

    it('should create foreign key to milestones table with SET NULL on delete', async () => {
      await migration.up(mockQueryRunner);

      const milestoneFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_PLANS_MILESTONE_ID',
      );
      expect(milestoneFkCall).toBeDefined();

      const fkArg = milestoneFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('milestone_id');
      expect(fkArg.referencedTableName).toBe('milestones');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('SET NULL');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to milestones', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_plans',
        'FK_TEST_PLANS_MILESTONE_ID',
      );
    });

    it('should drop the foreign key to projects', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_plans',
        'FK_TEST_PLANS_PROJECT_ID',
      );
    });

    it('should drop the index on milestone_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_plans',
        'IDX_TEST_PLANS_MILESTONE_ID',
      );
    });

    it('should drop the index on project_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_plans',
        'IDX_TEST_PLANS_PROJECT_ID',
      );
    });

    it('should drop the test_plans table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('test_plans');
    });

    it('should drop in correct order: foreign keys, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropMilestoneFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropProjectFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[1];
      const dropMilestoneIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropProjectIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropMilestoneFKCallOrder).toBeLessThan(dropProjectFKCallOrder);
      expect(dropProjectFKCallOrder).toBeLessThan(dropMilestoneIdIndexCallOrder);
      expect(dropMilestoneIdIndexCallOrder).toBeLessThan(
        dropProjectIdIndexCallOrder,
      );
      expect(dropProjectIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
