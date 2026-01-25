import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateTestResultsTable1737838600000 } from './1737838600000-CreateTestResultsTable';

describe('CreateTestResultsTable1737838600000', () => {
  let migration: CreateTestResultsTable1737838600000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateTestResultsTable1737838600000();
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
      expect(migration.name).toBe('CreateTestResultsTable1737838600000');
    });
  });

  describe('up', () => {
    it('should create the test_results table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('test_results');
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

    it('should create table with run_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const runIdColumn = tableArg.columns.find(
        (col) => col.name === 'run_id',
      );

      expect(runIdColumn).toBeDefined();
      expect(runIdColumn?.type).toBe('uuid');
      expect(runIdColumn?.isNullable).toBe(false);
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

    it('should create table with status column as varchar', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const statusColumn = tableArg.columns.find(
        (col) => col.name === 'status',
      );

      expect(statusColumn).toBeDefined();
      expect(statusColumn?.type).toBe('varchar');
      expect(statusColumn?.length).toBe('50');
      expect(statusColumn?.isNullable).toBe(false);
    });

    it('should create table with comment column as nullable text', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const commentColumn = tableArg.columns.find(
        (col) => col.name === 'comment',
      );

      expect(commentColumn).toBeDefined();
      expect(commentColumn?.type).toBe('text');
      expect(commentColumn?.isNullable).toBe(true);
    });

    it('should create table with elapsed column as nullable integer', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const elapsedColumn = tableArg.columns.find(
        (col) => col.name === 'elapsed',
      );

      expect(elapsedColumn).toBeDefined();
      expect(elapsedColumn?.type).toBe('integer');
      expect(elapsedColumn?.isNullable).toBe(true);
    });

    it('should create table with defects column as nullable JSONB', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const defectsColumn = tableArg.columns.find(
        (col) => col.name === 'defects',
      );

      expect(defectsColumn).toBeDefined();
      expect(defectsColumn?.type).toBe('jsonb');
      expect(defectsColumn?.isNullable).toBe(true);
    });

    it('should create table with executed_at column as nullable timestamp', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const executedAtColumn = tableArg.columns.find(
        (col) => col.name === 'executed_at',
      );

      expect(executedAtColumn).toBeDefined();
      expect(executedAtColumn?.type).toBe('timestamp with time zone');
      expect(executedAtColumn?.isNullable).toBe(true);
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

    it('should create index on run_id column', async () => {
      await migration.up(mockQueryRunner);

      const runIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RESULTS_RUN_ID',
      );
      expect(runIdIndexCall).toBeDefined();
      const runIdIndex = runIdIndexCall?.[1] as TableIndex;
      expect(runIdIndex.columnNames).toContain('run_id');
    });

    it('should create index on case_id column', async () => {
      await migration.up(mockQueryRunner);

      const caseIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RESULTS_CASE_ID',
      );
      expect(caseIdIndexCall).toBeDefined();
      const caseIdIndex = caseIdIndexCall?.[1] as TableIndex;
      expect(caseIdIndex.columnNames).toContain('case_id');
    });

    it('should create index on status column', async () => {
      await migration.up(mockQueryRunner);

      const statusIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RESULTS_STATUS',
      );
      expect(statusIndexCall).toBeDefined();
      const statusIndex = statusIndexCall?.[1] as TableIndex;
      expect(statusIndex.columnNames).toContain('status');
    });

    it('should create foreign key to test_runs table with CASCADE on delete', async () => {
      await migration.up(mockQueryRunner);

      const runFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_RESULTS_RUN_ID',
      );
      expect(runFkCall).toBeDefined();

      const fkArg = runFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('run_id');
      expect(fkArg.referencedTableName).toBe('test_runs');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });

    it('should create foreign key to test_cases table with CASCADE on delete', async () => {
      await migration.up(mockQueryRunner);

      const caseFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_RESULTS_CASE_ID',
      );
      expect(caseFkCall).toBeDefined();

      const fkArg = caseFkCall?.[1] as TableForeignKey;
      expect(fkArg.columnNames).toContain('case_id');
      expect(fkArg.referencedTableName).toBe('test_cases');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to test_cases', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_results',
        'FK_TEST_RESULTS_CASE_ID',
      );
    });

    it('should drop the foreign key to test_runs', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_results',
        'FK_TEST_RESULTS_RUN_ID',
      );
    });

    it('should drop the index on status column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_results',
        'IDX_TEST_RESULTS_STATUS',
      );
    });

    it('should drop the index on case_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_results',
        'IDX_TEST_RESULTS_CASE_ID',
      );
    });

    it('should drop the index on run_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_results',
        'IDX_TEST_RESULTS_RUN_ID',
      );
    });

    it('should drop the test_results table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('test_results');
    });

    it('should drop in correct order: foreign keys, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropCaseFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropRunFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[1];
      const dropStatusIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropCaseIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropRunIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[2];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropCaseFKCallOrder).toBeLessThan(dropRunFKCallOrder);
      expect(dropRunFKCallOrder).toBeLessThan(dropStatusIndexCallOrder);
      expect(dropStatusIndexCallOrder).toBeLessThan(dropCaseIdIndexCallOrder);
      expect(dropCaseIdIndexCallOrder).toBeLessThan(dropRunIdIndexCallOrder);
      expect(dropRunIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
