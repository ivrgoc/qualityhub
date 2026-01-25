import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTestCaseVersionsTable1737838200000
  implements MigrationInterface
{
  name = 'CreateTestCaseVersionsTable1737838200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'test_case_versions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'case_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'changed_by',
            type: 'uuid',
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

    // Create index on case_id for faster test case-based queries
    await queryRunner.createIndex(
      'test_case_versions',
      new TableIndex({
        name: 'IDX_TEST_CASE_VERSIONS_CASE_ID',
        columnNames: ['case_id'],
      }),
    );

    // Create index on changed_by for user-based queries
    await queryRunner.createIndex(
      'test_case_versions',
      new TableIndex({
        name: 'IDX_TEST_CASE_VERSIONS_CHANGED_BY',
        columnNames: ['changed_by'],
      }),
    );

    // Create unique constraint on case_id and version combination
    await queryRunner.createIndex(
      'test_case_versions',
      new TableIndex({
        name: 'IDX_TEST_CASE_VERSIONS_CASE_VERSION_UNIQUE',
        columnNames: ['case_id', 'version'],
        isUnique: true,
      }),
    );

    // Create foreign key to test_cases table
    await queryRunner.createForeignKey(
      'test_case_versions',
      new TableForeignKey({
        name: 'FK_TEST_CASE_VERSIONS_CASE_ID',
        columnNames: ['case_id'],
        referencedTableName: 'test_cases',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'test_case_versions',
      new TableForeignKey({
        name: 'FK_TEST_CASE_VERSIONS_CHANGED_BY',
        columnNames: ['changed_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'test_case_versions',
      'FK_TEST_CASE_VERSIONS_CHANGED_BY',
    );
    await queryRunner.dropForeignKey(
      'test_case_versions',
      'FK_TEST_CASE_VERSIONS_CASE_ID',
    );
    await queryRunner.dropIndex(
      'test_case_versions',
      'IDX_TEST_CASE_VERSIONS_CASE_VERSION_UNIQUE',
    );
    await queryRunner.dropIndex(
      'test_case_versions',
      'IDX_TEST_CASE_VERSIONS_CHANGED_BY',
    );
    await queryRunner.dropIndex(
      'test_case_versions',
      'IDX_TEST_CASE_VERSIONS_CASE_ID',
    );
    await queryRunner.dropTable('test_case_versions');
  }
}
