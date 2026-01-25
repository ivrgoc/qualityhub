import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTestResultsTable1737838600000 implements MigrationInterface {
  name = 'CreateTestResultsTable1737838600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'test_results',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'run_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'case_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'elapsed',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'defects',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'executed_at',
            type: 'timestamp with time zone',
            isNullable: true,
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

    // Create index on run_id for faster run-based queries
    await queryRunner.createIndex(
      'test_results',
      new TableIndex({
        name: 'IDX_TEST_RESULTS_RUN_ID',
        columnNames: ['run_id'],
      }),
    );

    // Create index on case_id for faster case-based queries
    await queryRunner.createIndex(
      'test_results',
      new TableIndex({
        name: 'IDX_TEST_RESULTS_CASE_ID',
        columnNames: ['case_id'],
      }),
    );

    // Create index on status for filtering by result status
    await queryRunner.createIndex(
      'test_results',
      new TableIndex({
        name: 'IDX_TEST_RESULTS_STATUS',
        columnNames: ['status'],
      }),
    );

    // Create foreign key to test_runs table
    await queryRunner.createForeignKey(
      'test_results',
      new TableForeignKey({
        name: 'FK_TEST_RESULTS_RUN_ID',
        columnNames: ['run_id'],
        referencedTableName: 'test_runs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to test_cases table
    await queryRunner.createForeignKey(
      'test_results',
      new TableForeignKey({
        name: 'FK_TEST_RESULTS_CASE_ID',
        columnNames: ['case_id'],
        referencedTableName: 'test_cases',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('test_results', 'FK_TEST_RESULTS_CASE_ID');
    await queryRunner.dropForeignKey('test_results', 'FK_TEST_RESULTS_RUN_ID');
    await queryRunner.dropIndex('test_results', 'IDX_TEST_RESULTS_STATUS');
    await queryRunner.dropIndex('test_results', 'IDX_TEST_RESULTS_CASE_ID');
    await queryRunner.dropIndex('test_results', 'IDX_TEST_RESULTS_RUN_ID');
    await queryRunner.dropTable('test_results');
  }
}
