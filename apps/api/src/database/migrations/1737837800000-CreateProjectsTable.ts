import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateProjectsTable1737837800000 implements MigrationInterface {
  name = 'CreateProjectsTable1737837800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'org_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create index on org_id for faster organization-based queries
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_ORG_ID',
        columnNames: ['org_id'],
      }),
    );

    // Create index on deleted_at for soft delete filtering
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );

    // Create foreign key to organizations table
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        name: 'FK_PROJECTS_ORG_ID',
        columnNames: ['org_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('projects', 'FK_PROJECTS_ORG_ID');
    await queryRunner.dropIndex('projects', 'IDX_PROJECTS_DELETED_AT');
    await queryRunner.dropIndex('projects', 'IDX_PROJECTS_ORG_ID');
    await queryRunner.dropTable('projects');
  }
}
