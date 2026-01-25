import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTestCasesTable1737838100000 implements MigrationInterface {
  name = 'CreateTestCasesTable1737838100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'test_cases',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'section_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'template_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'steps'",
          },
          {
            name: 'steps',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'medium'",
          },
          {
            name: 'version',
            type: 'integer',
            isNullable: false,
            default: 1,
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

    // Create index on section_id for faster section-based queries
    await queryRunner.createIndex(
      'test_cases',
      new TableIndex({
        name: 'IDX_TEST_CASES_SECTION_ID',
        columnNames: ['section_id'],
      }),
    );

    // Create index on priority for filtering
    await queryRunner.createIndex(
      'test_cases',
      new TableIndex({
        name: 'IDX_TEST_CASES_PRIORITY',
        columnNames: ['priority'],
      }),
    );

    // Create index on template_type for filtering
    await queryRunner.createIndex(
      'test_cases',
      new TableIndex({
        name: 'IDX_TEST_CASES_TEMPLATE_TYPE',
        columnNames: ['template_type'],
      }),
    );

    // Create foreign key to sections table
    await queryRunner.createForeignKey(
      'test_cases',
      new TableForeignKey({
        name: 'FK_TEST_CASES_SECTION_ID',
        columnNames: ['section_id'],
        referencedTableName: 'sections',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('test_cases', 'FK_TEST_CASES_SECTION_ID');
    await queryRunner.dropIndex('test_cases', 'IDX_TEST_CASES_TEMPLATE_TYPE');
    await queryRunner.dropIndex('test_cases', 'IDX_TEST_CASES_PRIORITY');
    await queryRunner.dropIndex('test_cases', 'IDX_TEST_CASES_SECTION_ID');
    await queryRunner.dropTable('test_cases');
  }
}
