import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateRequirementsTable1737838700000
  implements MigrationInterface
{
  name = 'CreateRequirementsTable1737838700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'requirements',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'draft'",
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
        ],
      }),
      true,
    );

    // Create index on project_id for faster project-based queries
    await queryRunner.createIndex(
      'requirements',
      new TableIndex({
        name: 'IDX_REQUIREMENTS_PROJECT_ID',
        columnNames: ['project_id'],
      }),
    );

    // Create index on external_id for lookups by external system ID
    await queryRunner.createIndex(
      'requirements',
      new TableIndex({
        name: 'IDX_REQUIREMENTS_EXTERNAL_ID',
        columnNames: ['external_id'],
      }),
    );

    // Create index on status for filtering by status
    await queryRunner.createIndex(
      'requirements',
      new TableIndex({
        name: 'IDX_REQUIREMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    // Create foreign key to projects table
    await queryRunner.createForeignKey(
      'requirements',
      new TableForeignKey({
        name: 'FK_REQUIREMENTS_PROJECT_ID',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('requirements', 'FK_REQUIREMENTS_PROJECT_ID');
    await queryRunner.dropIndex('requirements', 'IDX_REQUIREMENTS_STATUS');
    await queryRunner.dropIndex('requirements', 'IDX_REQUIREMENTS_EXTERNAL_ID');
    await queryRunner.dropIndex('requirements', 'IDX_REQUIREMENTS_PROJECT_ID');
    await queryRunner.dropTable('requirements');
  }
}
