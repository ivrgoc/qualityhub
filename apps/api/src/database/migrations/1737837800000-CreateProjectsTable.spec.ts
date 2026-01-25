import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateProjectsTable1737837800000 } from './1737837800000-CreateProjectsTable';

describe('CreateProjectsTable1737837800000', () => {
  let migration: CreateProjectsTable1737837800000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateProjectsTable1737837800000();
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
      expect(migration.name).toBe('CreateProjectsTable1737837800000');
    });
  });

  describe('up', () => {
    it('should create the projects table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('projects');
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

    it('should create table with org_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const orgIdColumn = tableArg.columns.find((col) => col.name === 'org_id');

      expect(orgIdColumn).toBeDefined();
      expect(orgIdColumn?.type).toBe('uuid');
      expect(orgIdColumn?.isNullable).toBe(false);
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

    it('should create table with settings column as nullable jsonb', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const settingsColumn = tableArg.columns.find(
        (col) => col.name === 'settings',
      );

      expect(settingsColumn).toBeDefined();
      expect(settingsColumn?.type).toBe('jsonb');
      expect(settingsColumn?.isNullable).toBe(true);
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

    it('should create table with deleted_at column as nullable timestamp', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const deletedAtColumn = tableArg.columns.find(
        (col) => col.name === 'deleted_at',
      );

      expect(deletedAtColumn).toBeDefined();
      expect(deletedAtColumn?.type).toBe('timestamp with time zone');
      expect(deletedAtColumn?.isNullable).toBe(true);
    });

    it('should create index on org_id column', async () => {
      await migration.up(mockQueryRunner);

      const orgIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_PROJECTS_ORG_ID',
      );
      expect(orgIdIndexCall).toBeDefined();
      const orgIdIndex = orgIdIndexCall?.[1] as TableIndex;
      expect(orgIdIndex.columnNames).toContain('org_id');
    });

    it('should create index on deleted_at column', async () => {
      await migration.up(mockQueryRunner);

      const deletedAtIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_PROJECTS_DELETED_AT',
      );
      expect(deletedAtIndexCall).toBeDefined();
      const deletedAtIndex = deletedAtIndexCall?.[1] as TableIndex;
      expect(deletedAtIndex.columnNames).toContain('deleted_at');
    });

    it('should create foreign key to organizations table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledWith(
        'projects',
        expect.any(TableForeignKey),
      );

      const fkArg = mockQueryRunner.createForeignKey.mock
        .calls[0][1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_PROJECTS_ORG_ID');
      expect(fkArg.columnNames).toContain('org_id');
      expect(fkArg.referencedTableName).toBe('organizations');
      expect(fkArg.referencedColumnNames).toContain('id');
      expect(fkArg.onDelete).toBe('CASCADE');
    });
  });

  describe('down', () => {
    it('should drop the foreign key to organizations', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropForeignKey).toHaveBeenCalledWith(
        'projects',
        'FK_PROJECTS_ORG_ID',
      );
    });

    it('should drop the index on deleted_at column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'projects',
        'IDX_PROJECTS_DELETED_AT',
      );
    });

    it('should drop the index on org_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'projects',
        'IDX_PROJECTS_ORG_ID',
      );
    });

    it('should drop the projects table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('projects');
    });

    it('should drop in correct order: foreign key, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropDeletedAtIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropOrgIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropFKCallOrder).toBeLessThan(dropDeletedAtIndexCallOrder);
      expect(dropDeletedAtIndexCallOrder).toBeLessThan(dropOrgIdIndexCallOrder);
      expect(dropOrgIdIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
