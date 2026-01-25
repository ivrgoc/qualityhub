import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateTestCasesTable1737838100000 } from './1737838100000-CreateTestCasesTable';

describe('CreateTestCasesTable1737838100000', () => {
  let migration: CreateTestCasesTable1737838100000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateTestCasesTable1737838100000();
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
      expect(migration.name).toBe('CreateTestCasesTable1737838100000');
    });
  });

  describe('up', () => {
    it('should create the test_cases table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('test_cases');
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

    it('should create table with section_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const sectionIdColumn = tableArg.columns.find(
        (col) => col.name === 'section_id',
      );

      expect(sectionIdColumn).toBeDefined();
      expect(sectionIdColumn?.type).toBe('uuid');
      expect(sectionIdColumn?.isNullable).toBe(false);
    });

    it('should create table with title column', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const titleColumn = tableArg.columns.find((col) => col.name === 'title');

      expect(titleColumn).toBeDefined();
      expect(titleColumn?.type).toBe('varchar');
      expect(titleColumn?.length).toBe('500');
      expect(titleColumn?.isNullable).toBe(false);
    });

    it('should create table with template_type column with default steps', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const templateTypeColumn = tableArg.columns.find(
        (col) => col.name === 'template_type',
      );

      expect(templateTypeColumn).toBeDefined();
      expect(templateTypeColumn?.type).toBe('varchar');
      expect(templateTypeColumn?.length).toBe('50');
      expect(templateTypeColumn?.isNullable).toBe(false);
      expect(templateTypeColumn?.default).toBe("'steps'");
    });

    it('should create table with steps column as JSONB', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const stepsColumn = tableArg.columns.find((col) => col.name === 'steps');

      expect(stepsColumn).toBeDefined();
      expect(stepsColumn?.type).toBe('jsonb');
      expect(stepsColumn?.isNullable).toBe(true);
    });

    it('should create table with priority column with default medium', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const priorityColumn = tableArg.columns.find(
        (col) => col.name === 'priority',
      );

      expect(priorityColumn).toBeDefined();
      expect(priorityColumn?.type).toBe('varchar');
      expect(priorityColumn?.length).toBe('20');
      expect(priorityColumn?.isNullable).toBe(false);
      expect(priorityColumn?.default).toBe("'medium'");
    });

    it('should create table with version column as integer with default 1', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const versionColumn = tableArg.columns.find(
        (col) => col.name === 'version',
      );

      expect(versionColumn).toBeDefined();
      expect(versionColumn?.type).toBe('integer');
      expect(versionColumn?.isNullable).toBe(false);
      expect(versionColumn?.default).toBe(1);
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

    it('should create index on section_id column', async () => {
      await migration.up(mockQueryRunner);

      const sectionIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_CASES_SECTION_ID',
      );
      expect(sectionIdIndexCall).toBeDefined();
      const sectionIdIndex = sectionIdIndexCall?.[1] as TableIndex;
      expect(sectionIdIndex.columnNames).toContain('section_id');
    });

    it('should create index on priority column', async () => {
      await migration.up(mockQueryRunner);

      const priorityIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_CASES_PRIORITY',
      );
      expect(priorityIndexCall).toBeDefined();
      const priorityIndex = priorityIndexCall?.[1] as TableIndex;
      expect(priorityIndex.columnNames).toContain('priority');
    });

    it('should create index on template_type column', async () => {
      await migration.up(mockQueryRunner);

      const templateTypeIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_TEST_CASES_TEMPLATE_TYPE',
      );
      expect(templateTypeIndexCall).toBeDefined();
      const templateTypeIndex = templateTypeIndexCall?.[1] as TableIndex;
      expect(templateTypeIndex.columnNames).toContain('template_type');
    });

    it('should create foreign key to sections table', async () => {
      await migration.up(mockQueryRunner);

      const sectionIdFkCall = mockQueryRunner.createForeignKey.mock.calls.find(
        (call) =>
          (call[1] as TableForeignKey).name === 'FK_TEST_CASES_SECTION_ID',
      );
      expect(sectionIdFkCall).toBeDefined();

      const fkArg = sectionIdFkCall?.[1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_TEST_CASES_SECTION_ID');
      expect(fkArg.columnNames).toContain('section_id');
      expect(fkArg.referencedTableName).toBe('sections');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to sections', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'test_cases',
        'FK_TEST_CASES_SECTION_ID',
      );
    });

    it('should drop the index on template_type column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_cases',
        'IDX_TEST_CASES_TEMPLATE_TYPE',
      );
    });

    it('should drop the index on priority column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_cases',
        'IDX_TEST_CASES_PRIORITY',
      );
    });

    it('should drop the index on section_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_cases',
        'IDX_TEST_CASES_SECTION_ID',
      );
    });

    it('should drop the test_cases table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('test_cases');
    });

    it('should drop in correct order: foreign key, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropTemplateTypeIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropPriorityIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropSectionIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[2];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropFKCallOrder).toBeLessThan(dropTemplateTypeIndexCallOrder);
      expect(dropTemplateTypeIndexCallOrder).toBeLessThan(
        dropPriorityIndexCallOrder,
      );
      expect(dropPriorityIndexCallOrder).toBeLessThan(
        dropSectionIdIndexCallOrder,
      );
      expect(dropSectionIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
