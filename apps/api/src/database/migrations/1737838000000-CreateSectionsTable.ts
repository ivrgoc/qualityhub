import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateSectionsTable1737838000000 implements MigrationInterface {
  name = 'CreateSectionsTable1737838000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sections',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'suite_id',
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
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'position',
            type: 'integer',
            isNullable: false,
            default: 0,
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

    // Create index on suite_id for faster suite-based queries
    await queryRunner.createIndex(
      'sections',
      new TableIndex({
        name: 'IDX_SECTIONS_SUITE_ID',
        columnNames: ['suite_id'],
      }),
    );

    // Create index on parent_id for hierarchical queries
    await queryRunner.createIndex(
      'sections',
      new TableIndex({
        name: 'IDX_SECTIONS_PARENT_ID',
        columnNames: ['parent_id'],
      }),
    );

    // Create foreign key to test_suites table
    await queryRunner.createForeignKey(
      'sections',
      new TableForeignKey({
        name: 'FK_SECTIONS_SUITE_ID',
        columnNames: ['suite_id'],
        referencedTableName: 'test_suites',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create self-referencing foreign key for parent_id
    await queryRunner.createForeignKey(
      'sections',
      new TableForeignKey({
        name: 'FK_SECTIONS_PARENT_ID',
        columnNames: ['parent_id'],
        referencedTableName: 'sections',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('sections', 'FK_SECTIONS_PARENT_ID');
    await queryRunner.dropForeignKey('sections', 'FK_SECTIONS_SUITE_ID');
    await queryRunner.dropIndex('sections', 'IDX_SECTIONS_PARENT_ID');
    await queryRunner.dropIndex('sections', 'IDX_SECTIONS_SUITE_ID');
    await queryRunner.dropTable('sections');
  }
}
