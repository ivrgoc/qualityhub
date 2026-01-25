import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateTestCaseVersionsTable1737838200000 } from './1737838200000-CreateTestCaseVersionsTable';

describe('CreateTestCaseVersionsTable1737838200000', () => {
  let migration: CreateTestCaseVersionsTable1737838200000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateTestCaseVersionsTable1737838200000();
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
      expect(migration.name).toBe('CreateTestCaseVersionsTable1737838200000');
    });
  });

  describe('up', () => {
    it('should create the test_case_versions table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('test_case_versions');
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

    it('should create table with case_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const caseIdColumn = tableArg.columns.find(
        (col) => col.name === 'case_id',
      );

      expect(caseIdColumn).toBeDefined();
      expect(caseIdColumn?.type).toBe('uuid');
      expect(caseIdColumn?.isNullable).toBe(false);
    });

    it('should create table with version column as integer', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const versionColumn = tableArg.columns.find(
        (col) => col.name === 'version',
      );

      expect(versionColumn).toBeDefined();
      expect(versionColumn?.type).toBe('integer');
      expect(versionColumn?.isNullable).toBe(false);
    });

    it('should create table with data column as JSONB', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const dataColumn = tableArg.columns.find((col) => col.name === 'data');

      expect(dataColumn).toBeDefined();
      expect(dataColumn?.type).toBe('jsonb');
      expect(dataColumn?.isNullable).toBe(false);
    });

    it('should create table with changed_by column as UUID and nullable', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const changedByColumn = tableArg.columns.find(
        (col) => col.name === 'changed_by',
      );

      expect(changedByColumn).toBeDefined();
      expect(changedByColumn?.type).toBe('uuid');
      expect(changedByColumn?.isNullable).toBe(true);
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

    it('should create index on case_id column', async () => {
      await migration.up(mockQueryRunner);

      const caseIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_TEST_CASE_VERSIONS_CASE_ID',
      );
      expect(caseIdIndexCall).toBeDefined();
      const caseIdIndex = caseIdIndexCall?.[1] as TableIndex;
      expect(caseIdIndex.columnNames).toContain('case_id');
    });

    it('should create index on changed_by column', async () => {
      await migration.up(mockQueryRunner);

      const changedByIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_TEST_CASE_VERSIONS_CHANGED_BY',
      );
      expect(changedByIndexCall).toBeDefined();
      const changedByIndex = changedByIndexCall?.[1] as TableIndex;
      expect(changedByIndex.columnNames).toContain('changed_by');
    });

    it('should create unique index on case_id and version combination', async () => {
      await migration.up(mockQueryRunner);

      const uniqueIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name ===
          'IDX_TEST_CASE_VERSIONS_CASE_VERSION_UNIQUE',
      );
      expect(uniqueIndexCall).toBeDefined();
      const uniqueIndex = uniqueIndexCall?.[1] as TableIndex;
      expect(uniqueIndex.columnNames).toContain('case_id');
      expect(uniqueIndex.columnNames).toContain('version');
      expect(uniqueIndex.isUnique).toBe(true);
    });

    it('should create foreign key to test_cases table', async () => {
      await migration.up(mockQueryRunner);

      const caseIdFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name ===
          'FK_TEST_CASE_VERSIONS_CASE_ID',
      );
      expect(caseIdFkCall).toBeDefined();

      const fkArg = caseIdFkCall?.[1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_TEST_CASE_VERSIONS_CASE_ID');
      expect(fkArg.columnNames).toContain('case_id');
      expect(fkArg.referencedTableName).toBe('test_cases');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });

    it('should create foreign key to users table', async () => {
      await migration.up(mockQueryRunner);

      const changedByFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name ===
          'FK_TEST_CASE_VERSIONS_CHANGED_BY',
      );
      expect(changedByFkCall).toBeDefined();

      const fkArg = changedByFkCall?.[1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_TEST_CASE_VERSIONS_CHANGED_BY');
      expect(fkArg.columnNames).toContain('changed_by');
      expect(fkArg.referencedTableName).toBe('users');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('SET NULL');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to users', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_case_versions',
        'FK_TEST_CASE_VERSIONS_CHANGED_BY',
      );
    });

    it('should drop the foreign key to test_cases', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_case_versions',
        'FK_TEST_CASE_VERSIONS_CASE_ID',
      );
    });

    it('should drop the unique index on case_id and version', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_case_versions',
        'IDX_TEST_CASE_VERSIONS_CASE_VERSION_UNIQUE',
      );
    });

    it('should drop the index on changed_by column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_case_versions',
        'IDX_TEST_CASE_VERSIONS_CHANGED_BY',
      );
    });

    it('should drop the index on case_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_case_versions',
        'IDX_TEST_CASE_VERSIONS_CASE_ID',
      );
    });

    it('should drop the test_case_versions table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith(
        'test_case_versions',
      );
    });

    it('should drop in correct order: foreign keys, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropChangedByFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropCaseIdFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[1];
      const dropUniqueIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropChangedByIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropCaseIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[2];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropChangedByFKCallOrder).toBeLessThan(dropCaseIdFKCallOrder);
      expect(dropCaseIdFKCallOrder).toBeLessThan(dropUniqueIndexCallOrder);
      expect(dropUniqueIndexCallOrder).toBeLessThan(dropChangedByIndexCallOrder);
      expect(dropChangedByIndexCallOrder).toBeLessThan(dropCaseIdIndexCallOrder);
      expect(dropCaseIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
