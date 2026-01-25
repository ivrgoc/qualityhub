import { QueryRunner, Table, TableIndex } from 'typeorm';
import { CreateOrganizationsTable1737837600000 } from './1737837600000-CreateOrganizationsTable';

describe('CreateOrganizationsTable1737837600000', () => {
  let migration: CreateOrganizationsTable1737837600000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateOrganizationsTable1737837600000();
    mockQueryRunner = {
      createTable: jest.fn(),
      dropTable: jest.fn(),
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  describe('name', () => {
    it('should have the correct migration name', () => {
      expect(migration.name).toBe('CreateOrganizationsTable1737837600000');
    });
  });

  describe('up', () => {
    it('should create the organizations table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('organizations');
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

    it('should create table with name column', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const nameColumn = tableArg.columns.find((col) => col.name === 'name');

      expect(nameColumn).toBeDefined();
      expect(nameColumn?.type).toBe('varchar');
      expect(nameColumn?.length).toBe('255');
      expect(nameColumn?.isNullable).toBe(false);
    });

    it('should create table with slug column as unique', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const slugColumn = tableArg.columns.find((col) => col.name === 'slug');

      expect(slugColumn).toBeDefined();
      expect(slugColumn?.type).toBe('varchar');
      expect(slugColumn?.length).toBe('255');
      expect(slugColumn?.isNullable).toBe(false);
      expect(slugColumn?.isUnique).toBe(true);
    });

    it('should create table with plan column with default value', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const planColumn = tableArg.columns.find((col) => col.name === 'plan');

      expect(planColumn).toBeDefined();
      expect(planColumn?.type).toBe('varchar');
      expect(planColumn?.length).toBe('50');
      expect(planColumn?.isNullable).toBe(false);
      expect(planColumn?.default).toBe("'free'");
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

    it('should enable uuid-ossp extension', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      );
    });

    it('should create index on slug column', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createIndex).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.createIndex).toHaveBeenCalledWith(
        'organizations',
        expect.any(TableIndex),
      );

      const indexArg = mockQueryRunner.createIndex.mock
        .calls[0][1] as TableIndex;
      expect(indexArg.name).toBe('IDX_ORGANIZATIONS_SLUG');
      expect(indexArg.columnNames).toContain('slug');
    });
  });

  describe('down', () => {
    it('should drop the index on slug column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'organizations',
        'IDX_ORGANIZATIONS_SLUG',
      );
    });

    it('should drop the organizations table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('organizations');
    });

    it('should drop index before dropping table', async () => {
      await migration.down(mockQueryRunner);

      const dropIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
