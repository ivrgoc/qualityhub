import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateRequirementsTable1737838700000 } from './1737838700000-CreateRequirementsTable';

describe('CreateRequirementsTable1737838700000', () => {
  let migration: CreateRequirementsTable1737838700000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateRequirementsTable1737838700000();
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
      expect(migration.name).toBe('CreateRequirementsTable1737838700000');
    });
  });

  describe('up', () => {
    it('should create the requirements table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('requirements');
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

    it('should create table with external_id column as nullable varchar', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const externalIdColumn = tableArg.columns.find(
        (col) => col.name === 'external_id',
      );

      expect(externalIdColumn).toBeDefined();
      expect(externalIdColumn?.type).toBe('varchar');
      expect(externalIdColumn?.length).toBe('255');
      expect(externalIdColumn?.isNullable).toBe(true);
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

    it('should create table with status column with default draft', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const statusColumn = tableArg.columns.find(
        (col) => col.name === 'status',
      );

      expect(statusColumn).toBeDefined();
      expect(statusColumn?.type).toBe('varchar');
      expect(statusColumn?.length).toBe('50');
      expect(statusColumn?.isNullable).toBe(false);
      expect(statusColumn?.default).toBe("'draft'");
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
        (call) => (call[1] as TableIndex).name === 'IDX_REQUIREMENTS_PROJECT_ID',
      );
      expect(projectIdIndexCall).toBeDefined();
      const projectIdIndex = projectIdIndexCall?.[1] as TableIndex;
      expect(projectIdIndex.columnNames).toContain('project_id');
    });

    it('should create index on external_id column', async () => {
      await migration.up(mockQueryRunner);

      const externalIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_REQUIREMENTS_EXTERNAL_ID',
      );
      expect(externalIdIndexCall).toBeDefined();
      const externalIdIndex = externalIdIndexCall?.[1] as TableIndex;
      expect(externalIdIndex.columnNames).toContain('external_id');
    });

    it('should create index on status column', async () => {
      await migration.up(mockQueryRunner);

      const statusIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_REQUIREMENTS_STATUS',
      );
      expect(statusIndexCall).toBeDefined();
      const statusIndex = statusIndexCall?.[1] as TableIndex;
      expect(statusIndex.columnNames).toContain('status');
    });

    it('should create foreign key to projects table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledWith(
        'requirements',
        expect.any(TableForeignKey),
      );

      const fkArg = mockQueryRunner.createForeignKey.mock
        .calls[0][1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_REQUIREMENTS_PROJECT_ID');
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
        'requirements',
        'FK_REQUIREMENTS_PROJECT_ID',
      );
    });

    it('should drop the index on status column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'requirements',
        'IDX_REQUIREMENTS_STATUS',
      );
    });

    it('should drop the index on external_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'requirements',
        'IDX_REQUIREMENTS_EXTERNAL_ID',
      );
    });

    it('should drop the index on project_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'requirements',
        'IDX_REQUIREMENTS_PROJECT_ID',
      );
    });

    it('should drop the requirements table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('requirements');
    });

    it('should drop in correct order: foreign key, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropStatusIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropExternalIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropProjectIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[2];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropFKCallOrder).toBeLessThan(dropStatusIndexCallOrder);
      expect(dropStatusIndexCallOrder).toBeLessThan(dropExternalIdIndexCallOrder);
      expect(dropExternalIdIndexCallOrder).toBeLessThan(
        dropProjectIdIndexCallOrder,
      );
      expect(dropProjectIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
