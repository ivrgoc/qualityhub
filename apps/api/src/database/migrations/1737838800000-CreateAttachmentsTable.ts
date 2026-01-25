import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateAttachmentsTable1737838800000 implements MigrationInterface {
  name = 'CreateAttachmentsTable1737838800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'path',
            type: 'varchar',
            length: '1000',
            isNullable: false,
          },
          {
            name: 'size',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create composite index on entity_type and entity_id for polymorphic lookups
    await queryRunner.createIndex(
      'attachments',
      new TableIndex({
        name: 'IDX_ATTACHMENTS_ENTITY',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    // Create index on mime_type for filtering by file type
    await queryRunner.createIndex(
      'attachments',
      new TableIndex({
        name: 'IDX_ATTACHMENTS_MIME_TYPE',
        columnNames: ['mime_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('attachments', 'IDX_ATTACHMENTS_MIME_TYPE');
    await queryRunner.dropIndex('attachments', 'IDX_ATTACHMENTS_ENTITY');
    await queryRunner.dropTable('attachments');
  }
}
