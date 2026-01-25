import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTestRunsTable1737838500000 implements MigrationInterface {
  name = 'CreateTestRunsTable1737838500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'test_runs',
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
            name: 'plan_id',
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
            name: 'config',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'assignee_id',
            type: 'uuid',
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
        ],
      }),
      true,
    );

    // Create index on project_id for faster project-based queries
    await queryRunner.createIndex(
      'test_runs',
      new TableIndex({
        name: 'IDX_TEST_RUNS_PROJECT_ID',
        columnNames: ['project_id'],
      }),
    );

    // Create index on plan_id for faster plan-based queries
    await queryRunner.createIndex(
      'test_runs',
      new TableIndex({
        name: 'IDX_TEST_RUNS_PLAN_ID',
        columnNames: ['plan_id'],
      }),
    );

    // Create index on assignee_id for faster assignee-based queries
    await queryRunner.createIndex(
      'test_runs',
      new TableIndex({
        name: 'IDX_TEST_RUNS_ASSIGNEE_ID',
        columnNames: ['assignee_id'],
      }),
    );

    // Create foreign key to projects table
    await queryRunner.createForeignKey(
      'test_runs',
      new TableForeignKey({
        name: 'FK_TEST_RUNS_PROJECT_ID',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to test_plans table
    await queryRunner.createForeignKey(
      'test_runs',
      new TableForeignKey({
        name: 'FK_TEST_RUNS_PLAN_ID',
        columnNames: ['plan_id'],
        referencedTableName: 'test_plans',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'test_runs',
      new TableForeignKey({
        name: 'FK_TEST_RUNS_ASSIGNEE_ID',
        columnNames: ['assignee_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('test_runs', 'FK_TEST_RUNS_ASSIGNEE_ID');
    await queryRunner.dropForeignKey('test_runs', 'FK_TEST_RUNS_PLAN_ID');
    await queryRunner.dropForeignKey('test_runs', 'FK_TEST_RUNS_PROJECT_ID');
    await queryRunner.dropIndex('test_runs', 'IDX_TEST_RUNS_ASSIGNEE_ID');
    await queryRunner.dropIndex('test_runs', 'IDX_TEST_RUNS_PLAN_ID');
    await queryRunner.dropIndex('test_runs', 'IDX_TEST_RUNS_PROJECT_ID');
    await queryRunner.dropTable('test_runs');
  }
}
