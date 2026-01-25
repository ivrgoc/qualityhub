import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateTestSuitesTable1737837900000 } from './1737837900000-CreateTestSuitesTable';

describe('CreateTestSuitesTable1737837900000', () => {
  let migration: CreateTestSuitesTable1737837900000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateTestSuitesTable1737837900000();
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
      expect(migration.name).toBe('CreateTestSuitesTable1737837900000');
    });
  });

  describe('up', () => {
    it('should create the test_suites table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('test_suites');
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

    it('should create table with description column as nullable text', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const descriptionColumn = tableArg.columns.find(
        (col) => col.name === 'description',
      );

      expect(descriptionColumn).toBeDefined();
      expect(descriptionColumn?.type).toBe('text');
      expect(descriptionColumn?.isNullable).toBe(true);
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
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_SUITES_PROJECT_ID',
      );
      expect(projectIdIndexCall).toBeDefined();
      const projectIdIndex = projectIdIndexCall?.[1] as TableIndex;
      expect(projectIdIndex.columnNames).toContain('project_id');
    });

    it('should create foreign key to projects table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledWith(
        'test_suites',
        expect.any(TableForeignKey),
      );

      const fkArg = mockQueryRunner.createForeignKey.mock
        .calls[0][1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_TEST_SUITES_PROJECT_ID');
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
        'test_suites',
        'FK_TEST_SUITES_PROJECT_ID',
      );
    });

    it('should drop the index on project_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_suites',
        'IDX_TEST_SUITES_PROJECT_ID',
      );
    });

    it('should drop the test_suites table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('test_suites');
    });

    it('should drop in correct order: foreign key, index, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropFKCallOrder).toBeLessThan(dropIndexCallOrder);
      expect(dropIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
