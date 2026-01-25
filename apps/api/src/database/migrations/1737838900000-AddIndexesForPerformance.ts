import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexesForPerformance1737838900000
  implements MigrationInterface
{
  name = 'AddIndexesForPerformance1737838900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index on users.role for filtering users by role
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_ROLE',
        columnNames: ['role'],
      }),
    );

    // Index on milestones.due_date for filtering upcoming/overdue milestones
    await queryRunner.createIndex(
      'milestones',
      new TableIndex({
        name: 'IDX_MILESTONES_DUE_DATE',
        columnNames: ['due_date'],
      }),
    );

    // Composite index on milestones for common query: active milestones per project
    await queryRunner.createIndex(
      'milestones',
      new TableIndex({
        name: 'IDX_MILESTONES_PROJECT_COMPLETED',
        columnNames: ['project_id', 'is_completed'],
      }),
    );

    // Index on test_cases.created_at for sorting test cases by creation date
    await queryRunner.createIndex(
      'test_cases',
      new TableIndex({
        name: 'IDX_TEST_CASES_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    // Composite index on test_cases for filtered queries within a section
    await queryRunner.createIndex(
      'test_cases',
      new TableIndex({
        name: 'IDX_TEST_CASES_SECTION_PRIORITY',
        columnNames: ['section_id', 'priority'],
      }),
    );

    // Index on test_runs.created_at for sorting/filtering test runs by date
    await queryRunner.createIndex(
      'test_runs',
      new TableIndex({
        name: 'IDX_TEST_RUNS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    // Index on test_results.executed_at for time-based queries on execution history
    await queryRunner.createIndex(
      'test_results',
      new TableIndex({
        name: 'IDX_TEST_RESULTS_EXECUTED_AT',
        columnNames: ['executed_at'],
      }),
    );

    // Composite index on test_results for status reports per run
    await queryRunner.createIndex(
      'test_results',
      new TableIndex({
        name: 'IDX_TEST_RESULTS_RUN_STATUS',
        columnNames: ['run_id', 'status'],
      }),
    );

    // Index on attachments.created_at for sorting attachments
    await queryRunner.createIndex(
      'attachments',
      new TableIndex({
        name: 'IDX_ATTACHMENTS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('attachments', 'IDX_ATTACHMENTS_CREATED_AT');
    await queryRunner.dropIndex('test_results', 'IDX_TEST_RESULTS_RUN_STATUS');
    await queryRunner.dropIndex('test_results', 'IDX_TEST_RESULTS_EXECUTED_AT');
    await queryRunner.dropIndex('test_runs', 'IDX_TEST_RUNS_CREATED_AT');
    await queryRunner.dropIndex(
      'test_cases',
      'IDX_TEST_CASES_SECTION_PRIORITY',
    );
    await queryRunner.dropIndex('test_cases', 'IDX_TEST_CASES_CREATED_AT');
    await queryRunner.dropIndex(
      'milestones',
      'IDX_MILESTONES_PROJECT_COMPLETED',
    );
    await queryRunner.dropIndex('milestones', 'IDX_MILESTONES_DUE_DATE');
    await queryRunner.dropIndex('users', 'IDX_USERS_ROLE');
  }
}
