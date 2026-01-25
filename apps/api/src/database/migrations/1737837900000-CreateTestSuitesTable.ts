import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTestSuitesTable1737837900000 implements MigrationInterface {
  name = 'CreateTestSuitesTable1737837900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'test_suites',
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
            name: 'description',
            type: 'text',
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

    // Create index on project_id for faster project-based queries
    await queryRunner.createIndex(
      'test_suites',
      new TableIndex({
        name: 'IDX_TEST_SUITES_PROJECT_ID',
        columnNames: ['project_id'],
      }),
    );

    // Create foreign key to projects table
    await queryRunner.createForeignKey(
      'test_suites',
      new TableForeignKey({
        name: 'FK_TEST_SUITES_PROJECT_ID',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('test_suites', 'FK_TEST_SUITES_PROJECT_ID');
    await queryRunner.dropIndex('test_suites', 'IDX_TEST_SUITES_PROJECT_ID');
    await queryRunner.dropTable('test_suites');
  }
}
