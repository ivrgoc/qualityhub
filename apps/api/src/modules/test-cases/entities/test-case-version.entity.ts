import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TestCase } from './test-case.entity';

@Entity('test_case_versions')
@Index(['testCaseId'])
@Index(['testCaseId', 'version'])
export class TestCaseVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_case_id', type: 'uuid' })
  testCaseId: string;

  @ManyToOne(() => TestCase)
  @JoinColumn({ name: 'test_case_id' })
  testCase: TestCase;

  @Column()
  version: number;

  @Column({ type: 'jsonb' })
  data: Record<string, unknown>;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
