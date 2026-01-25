import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTestPlansTable1737838400000 implements MigrationInterface {
  name = 'CreateTestPlansTable1737838400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'test_plans',
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
            name: 'milestone_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
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

    // Create index on project_id for faster project-based queries
    await queryRunner.createIndex(
      'test_plans',
      new TableIndex({
        name: 'IDX_TEST_PLANS_PROJECT_ID',
        columnNames: ['project_id'],
      }),
    );

    // Create index on milestone_id for faster milestone-based queries
    await queryRunner.createIndex(
      'test_plans',
      new TableIndex({
        name: 'IDX_TEST_PLANS_MILESTONE_ID',
        columnNames: ['milestone_id'],
      }),
    );

    // Create foreign key to projects table
    await queryRunner.createForeignKey(
      'test_plans',
      new TableForeignKey({
        name: 'FK_TEST_PLANS_PROJECT_ID',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to milestones table
    await queryRunner.createForeignKey(
      'test_plans',
      new TableForeignKey({
        name: 'FK_TEST_PLANS_MILESTONE_ID',
        columnNames: ['milestone_id'],
        referencedTableName: 'milestones',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('test_plans', 'FK_TEST_PLANS_MILESTONE_ID');
    await queryRunner.dropForeignKey('test_plans', 'FK_TEST_PLANS_PROJECT_ID');
    await queryRunner.dropIndex('test_plans', 'IDX_TEST_PLANS_MILESTONE_ID');
    await queryRunner.dropIndex('test_plans', 'IDX_TEST_PLANS_PROJECT_ID');
    await queryRunner.dropTable('test_plans');
  }
}
