import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateSectionsTable1737838000000 } from './1737838000000-CreateSectionsTable';

describe('CreateSectionsTable1737838000000', () => {
  let migration: CreateSectionsTable1737838000000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateSectionsTable1737838000000();
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
      expect(migration.name).toBe('CreateSectionsTable1737838000000');
    });
  });

  describe('up', () => {
    it('should create the sections table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('sections');
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

    it('should create table with suite_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const suiteIdColumn = tableArg.columns.find(
        (col) => col.name === 'suite_id',
      );

      expect(suiteIdColumn).toBeDefined();
      expect(suiteIdColumn?.type).toBe('uuid');
      expect(suiteIdColumn?.isNullable).toBe(false);
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

    it('should create table with parent_id column as nullable UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const parentIdColumn = tableArg.columns.find(
        (col) => col.name === 'parent_id',
      );

      expect(parentIdColumn).toBeDefined();
      expect(parentIdColumn?.type).toBe('uuid');
      expect(parentIdColumn?.isNullable).toBe(true);
    });

    it('should create table with position column as integer with default 0', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const positionColumn = tableArg.columns.find(
        (col) => col.name === 'position',
      );

      expect(positionColumn).toBeDefined();
      expect(positionColumn?.type).toBe('integer');
      expect(positionColumn?.isNullable).toBe(false);
      expect(positionColumn?.default).toBe(0);
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

    it('should create index on suite_id column', async () => {
      await migration.up(mockQueryRunner);

      const suiteIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_SECTIONS_SUITE_ID',
      );
      expect(suiteIdIndexCall).toBeDefined();
      const suiteIdIndex = suiteIdIndexCall?.[1] as TableIndex;
      expect(suiteIdIndex.columnNames).toContain('suite_id');
    });

    it('should create index on parent_id column', async () => {
      await migration.up(mockQueryRunner);

      const parentIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_SECTIONS_PARENT_ID',
      );
      expect(parentIdIndexCall).toBeDefined();
      const parentIdIndex = parentIdIndexCall?.[1] as TableIndex;
      expect(parentIdIndex.columnNames).toContain('parent_id');
    });

    it('should create foreign key to test_suites table', async () => {
      await migration.up(mockQueryRunner);

      const suiteIdFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) => (call[1] as TableForeignKey).name === 'FK_SECTIONS_SUITE_ID',
      );
      expect(suiteIdFkCall).toBeDefined();

      const fkArg = suiteIdFkCall?.[1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_SECTIONS_SUITE_ID');
      expect(fkArg.columnNames).toContain('suite_id');
      expect(fkArg.referencedTableName).toBe('test_suites');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });

    it('should create self-referencing foreign key for parent_id', async () => {
      await migration.up(mockQueryRunner);

      const parentIdFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) => (call[1] as TableForeignKey).name === 'FK_SECTIONS_PARENT_ID',
      );
      expect(parentIdFkCall).toBeDefined();

      const fkArg = parentIdFkCall?.[1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_SECTIONS_PARENT_ID');
      expect(fkArg.columnNames).toContain('parent_id');
      expect(fkArg.referencedTableName).toBe('sections');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });
  });

  describe('down', () => {
    it('should drop the foreign key for parent_id', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'sections',
        'FK_SECTIONS_PARENT_ID',
      );
    });

    it('should drop the foreign key to test_suites', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'sections',
        'FK_SECTIONS_SUITE_ID',
      );
    });

    it('should drop the index on parent_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'sections',
        'IDX_SECTIONS_PARENT_ID',
      );
    });

    it('should drop the index on suite_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'sections',
        'IDX_SECTIONS_SUITE_ID',
      );
    });

    it('should drop the sections table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('sections');
    });

    it('should drop in correct order: foreign keys, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropParentFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropSuiteFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[1];
      const dropParentIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropSuiteIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropParentFKCallOrder).toBeLessThan(dropSuiteFKCallOrder);
      expect(dropSuiteFKCallOrder).toBeLessThan(dropParentIdIndexCallOrder);
      expect(dropParentIdIndexCallOrder).toBeLessThan(dropSuiteIdIndexCallOrder);
      expect(dropSuiteIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
