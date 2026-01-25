import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateMilestonesTable1737838300000 implements MigrationInterface {
  name = 'CreateMilestonesTable1737838300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'milestones',
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
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'due_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            default: false,
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
      'milestones',
      new TableIndex({
        name: 'IDX_MILESTONES_PROJECT_ID',
        columnNames: ['project_id'],
      }),
    );

    // Create index on is_completed for filtering by completion status
    await queryRunner.createIndex(
      'milestones',
      new TableIndex({
        name: 'IDX_MILESTONES_IS_COMPLETED',
        columnNames: ['is_completed'],
      }),
    );

    // Create foreign key to projects table
    await queryRunner.createForeignKey(
      'milestones',
      new TableForeignKey({
        name: 'FK_MILESTONES_PROJECT_ID',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('milestones', 'FK_MILESTONES_PROJECT_ID');
    await queryRunner.dropIndex('milestones', 'IDX_MILESTONES_IS_COMPLETED');
    await queryRunner.dropIndex('milestones', 'IDX_MILESTONES_PROJECT_ID');
    await queryRunner.dropTable('milestones');
  }
}
