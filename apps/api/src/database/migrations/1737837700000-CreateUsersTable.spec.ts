import { QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { CreateUsersTable1737837700000 } from './1737837700000-CreateUsersTable';

describe('CreateUsersTable1737837700000', () => {
  let migration: CreateUsersTable1737837700000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateUsersTable1737837700000();
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
      expect(migration.name).toBe('CreateUsersTable1737837700000');
    });
  });

  describe('up', () => {
    it('should create the users table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('users');
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

    it('should create table with email column as unique', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const emailColumn = tableArg.columns.find((col) => col.name === 'email');

      expect(emailColumn).toBeDefined();
      expect(emailColumn?.type).toBe('varchar');
      expect(emailColumn?.length).toBe('255');
      expect(emailColumn?.isNullable).toBe(false);
      expect(emailColumn?.isUnique).toBe(true);
    });

    it('should create table with password_hash column', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const passwordHashColumn = tableArg.columns.find(
        (col) => col.name === 'password_hash',
      );

      expect(passwordHashColumn).toBeDefined();
      expect(passwordHashColumn?.type).toBe('varchar');
      expect(passwordHashColumn?.length).toBe('255');
      expect(passwordHashColumn?.isNullable).toBe(false);
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

    it('should create table with role column with default value', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const roleColumn = tableArg.columns.find((col) => col.name === 'role');

      expect(roleColumn).toBeDefined();
      expect(roleColumn?.type).toBe('varchar');
      expect(roleColumn?.length).toBe('50');
      expect(roleColumn?.isNullable).toBe(false);
      expect(roleColumn?.default).toBe("'tester'");
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

    it('should create index on email column', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createIndex).toHaveBeenCalledWith(
        'users',
        expect.any(TableIndex),
      );

      const emailIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_USERS_EMAIL',
      );
      expect(emailIndexCall).toBeDefined();
      const emailIndex = emailIndexCall?.[1] as TableIndex;
      expect(emailIndex.columnNames).toContain('email');
    });

    it('should create index on org_id column', async () => {
      await migration.up(mockQueryRunner);

      const orgIdIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_USERS_ORG_ID',
      );
      expect(orgIdIndexCall).toBeDefined();
      const orgIdIndex = orgIdIndexCall?.[1] as TableIndex;
      expect(orgIdIndex.columnNames).toContain('org_id');
    });

    it('should create foreign key to organizations table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.createForeignKey).toHaveBeenCalledWith(
        'users',
        expect.any(TableForeignKey),
      );

      const fkArg = mockQueryRunner.createForeignKey.mock
        .calls[0][1] as TableForeignKey;
      expect(fkArg.name).toBe('FK_USERS_ORG_ID');
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
        'users',
        'FK_USERS_ORG_ID',
      );
    });

    it('should drop the index on org_id column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'users',
        'IDX_USERS_ORG_ID',
      );
    });

    it('should drop the index on email column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'users',
        'IDX_USERS_EMAIL',
      );
    });

    it('should drop the users table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('users');
    });

    it('should drop in correct order: foreign key, indexes, then table', async () => {
      await migration.down(mockQueryRunner);

      const dropFKCallOrder =
        mockQueryRunner.dropForeignKey.mock.invocationCallOrder[0];
      const dropOrgIdIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropEmailIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropFKCallOrder).toBeLessThan(dropOrgIdIndexCallOrder);
      expect(dropOrgIdIndexCallOrder).toBeLessThan(dropEmailIndexCallOrder);
      expect(dropEmailIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
