import { QueryRunner, Table, TableIndex } from 'typeorm';
import { CreateAttachmentsTable1737838800000 } from './1737838800000-CreateAttachmentsTable';

describe('CreateAttachmentsTable1737838800000', () => {
  let migration: CreateAttachmentsTable1737838800000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new CreateAttachmentsTable1737838800000();
    mockQueryRunner = {
      createTable: jest.fn(),
      dropTable: jest.fn(),
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  describe('name', () => {
    it('should have the correct migration name', () => {
      expect(migration.name).toBe('CreateAttachmentsTable1737838800000');
    });
  });

  describe('up', () => {
    it('should create the attachments table', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createTable).toHaveBeenCalledTimes(1);
      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      expect(tableArg.name).toBe('attachments');
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

    it('should create table with entity_type column as varchar', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const entityTypeColumn = tableArg.columns.find(
        (col) => col.name === 'entity_type',
      );

      expect(entityTypeColumn).toBeDefined();
      expect(entityTypeColumn?.type).toBe('varchar');
      expect(entityTypeColumn?.length).toBe('50');
      expect(entityTypeColumn?.isNullable).toBe(false);
    });

    it('should create table with entity_id column as UUID', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const entityIdColumn = tableArg.columns.find(
        (col) => col.name === 'entity_id',
      );

      expect(entityIdColumn).toBeDefined();
      expect(entityIdColumn?.type).toBe('uuid');
      expect(entityIdColumn?.isNullable).toBe(false);
    });

    it('should create table with filename column as varchar', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const filenameColumn = tableArg.columns.find(
        (col) => col.name === 'filename',
      );

      expect(filenameColumn).toBeDefined();
      expect(filenameColumn?.type).toBe('varchar');
      expect(filenameColumn?.length).toBe('255');
      expect(filenameColumn?.isNullable).toBe(false);
    });

    it('should create table with path column as varchar', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const pathColumn = tableArg.columns.find((col) => col.name === 'path');

      expect(pathColumn).toBeDefined();
      expect(pathColumn?.type).toBe('varchar');
      expect(pathColumn?.length).toBe('1000');
      expect(pathColumn?.isNullable).toBe(false);
    });

    it('should create table with size column as bigint', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const sizeColumn = tableArg.columns.find((col) => col.name === 'size');

      expect(sizeColumn).toBeDefined();
      expect(sizeColumn?.type).toBe('bigint');
      expect(sizeColumn?.isNullable).toBe(false);
    });

    it('should create table with mime_type column as varchar', async () => {
      await migration.up(mockQueryRunner);

      const tableArg = mockQueryRunner.createTable.mock.calls[0][0] as Table;
      const mimeTypeColumn = tableArg.columns.find(
        (col) => col.name === 'mime_type',
      );

      expect(mimeTypeColumn).toBeDefined();
      expect(mimeTypeColumn?.type).toBe('varchar');
      expect(mimeTypeColumn?.length).toBe('100');
      expect(mimeTypeColumn?.isNullable).toBe(false);
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

    it('should create composite index on entity_type and entity_id columns', async () => {
      await migration.up(mockQueryRunner);

      const entityIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_ATTACHMENTS_ENTITY',
      );
      expect(entityIndexCall).toBeDefined();
      const entityIndex = entityIndexCall?.[1] as TableIndex;
      expect(entityIndex.columnNames).toContain('entity_type');
      expect(entityIndex.columnNames).toContain('entity_id');
    });

    it('should create index on mime_type column', async () => {
      await migration.up(mockQueryRunner);

      const mimeTypeIndexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_ATTACHMENTS_MIME_TYPE',
      );
      expect(mimeTypeIndexCall).toBeDefined();
      const mimeTypeIndex = mimeTypeIndexCall?.[1] as TableIndex;
      expect(mimeTypeIndex.columnNames).toContain('mime_type');
    });
  });

  describe('down', () => {
    it('should drop the index on mime_type column', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'attachments',
        'IDX_ATTACHMENTS_MIME_TYPE',
      );
    });

    it('should drop the composite index on entity columns', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'attachments',
        'IDX_ATTACHMENTS_ENTITY',
      );
    });

    it('should drop the attachments table', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropTable).toHaveBeenCalledWith('attachments');
    });

    it('should drop in correct order: indexes then table', async () => {
      await migration.down(mockQueryRunner);

      const dropMimeTypeIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[0];
      const dropEntityIndexCallOrder =
        mockQueryRunner.dropIndex.mock.invocationCallOrder[1];
      const dropTableCallOrder =
        mockQueryRunner.dropTable.mock.invocationCallOrder[0];

      expect(dropMimeTypeIndexCallOrder).toBeLessThan(dropEntityIndexCallOrder);
      expect(dropEntityIndexCallOrder).toBeLessThan(dropTableCallOrder);
    });
  });
});
