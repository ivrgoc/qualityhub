import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TestRun } from './test-run.entity';
import { TestCase } from '../../test-cases/entities/test-case.entity';

export enum TestStatus {
  UNTESTED = 'untested',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  RETEST = 'retest',
  SKIPPED = 'skipped',
}

@Entity('test_results')
@Index(['testRunId'])
@Index(['testCaseId'])
@Index(['status'])
@Index(['executedBy'])
export class TestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_run_id', type: 'uuid' })
  testRunId: string;

  @ManyToOne(() => TestRun, (testRun) => testRun.results)
  @JoinColumn({ name: 'test_run_id' })
  testRun: TestRun;

  @Column({ name: 'test_case_id', type: 'uuid' })
  testCaseId: string;

  @ManyToOne(() => TestCase)
  @JoinColumn({ name: 'test_case_id' })
  testCase: TestCase;

  @Column({ name: 'test_case_version', type: 'int', default: 1 })
  testCaseVersion: number;

  @Column({
    type: 'enum',
    enum: TestStatus,
    default: TestStatus.UNTESTED,
  })
  status: TestStatus;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'elapsed_seconds', type: 'int', nullable: true })
  elapsedSeconds: number | null;

  @Column({ type: 'jsonb', nullable: true })
  defects: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Record<string, unknown>[] | null;

  @Column({ name: 'executed_by', type: 'uuid', nullable: true })
  executedBy: string | null;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
