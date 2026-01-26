import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EntityType {
  TEST_CASE = 'test_case',
  TEST_RESULT = 'test_result',
  REQUIREMENT = 'requirement',
  DEFECT = 'defect',
}

@Entity('attachments')
@Index(['entityType', 'entityId'])
@Index(['mimeType'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: EntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 1000 })
  path: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
