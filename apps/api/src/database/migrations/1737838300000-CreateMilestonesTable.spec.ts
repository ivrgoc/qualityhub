import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateMilestonesTable1737838300000 } from './1737838300000-CreateMilestonesTable';

describe('CreateMilestonesTable1737838300000', () => {
  let migration: CreateMilestonesTable1737838300000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateMilestonesTable1737838300000();
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
      expect(migration.name).toBe('CreateMilestonesTable1737838300000');
    });
  });

  describe('up', () => {
    it('should create the milestones table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('milestones');
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

    it('should create table with name column', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const nameColumn = tableArg.columns.find((col) => col.name === 'name');

      expect(nameColumn).toBeDefined();
      expect(nameColumn?.type).toBe('varchar');
      expect(nameColumn?.length).toBe('255');
      expect(nameColumn?.isNullable).toBe(false);
    });

    it('should create table with due_date column as nullable timestamp', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const dueDateColumn = tableArg.columns.find(
        (col) => col.name === 'due_date',
      );

      expect(dueDateColumn).toBeDefined();
      expect(dueDateColumn?.type).toBe('timestamp with time zone');
      expect(dueDateColumn?.isNullable).toBe(true);
    });

    it('should create table with is_completed column with default false', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const isCompletedColumn = tableArg.columns.find(
        (col) => col.name === 'is_completed',
      );

      expect(isCompletedColumn).toBeDefined();
      expect(isCompletedColumn?.type).toBe('boolean');
      expect(isCompletedColumn?.default).toBe(false);
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
        (call) => (call[1] as TableIndex).name === 'IDX_MILESTONES_PROJECT_ID',
      );
      expect(projectIdIndexCall).toBeDefined();
      const projectIdIndex = projectIdIndexCall?.[1] as TableIndex;
      expect(projectIdIndex.columnNames).toContain('project_id');
    });

    it('should create index on is_completed column', async () => {
      await migration.up(mockQueryRunner);

      const isCompletedIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_MILESTONES_IS_COMPLETED',
      );
      expect(isCompletedIndexCall).toBeDefined();
      const isCompletedIndex = isCompletedIndexCall?.[1] as TableIndex;
      expect(isCompletedIndex.columnNames).toContain('is_completed');
    });

    it('should create foreign key to projects table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledWith(
        'milestones',
        expect.any(TableForeignKey),
      );

      const fkArg = mockQueryRunner.createForeignKey.mock
        .calls[0][1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_MILESTONES_PROJECT_ID');
      expect(fkArg.columnNames).toContain('project_id');
      expect(fkArg.referencedTableName).toBe('projects');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to projects', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'milestones',
        'FK_MILESTONES_PROJECT_ID',
      );
    });

    it('should drop the index on is_completed column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'milestones',
        'IDX_MILESTONES_IS_COMPLETED',
      );
    });

    it('should drop the index on project_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'milestones',
        'IDX_MILESTONES_PROJECT_ID',
      );
    });

    it('should drop the milestones table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('milestones');
    });

    it('should drop in correct order: foreign key, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropIsCompletedIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropProjectIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropFKCallOrder).toBeLessThan(dropIsCompletedIndexCallOrder);
      expect(dropIsCompletedIndexCallOrder).toBeLessThan(
        dropProjectIdIndexCallOrder,
      );
      expect(dropProjectIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
