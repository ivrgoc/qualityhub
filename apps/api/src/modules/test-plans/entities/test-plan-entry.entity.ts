import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TestPlan } from './test-plan.entity';
import { TestCase } from '../../test-cases/entities/test-case.entity';

@Entity('test_plan_entries')
@Index(['testPlanId'])
@Index(['testCaseId'])
@Unique(['testPlanId', 'testCaseId'])
export class TestPlanEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_plan_id', type: 'uuid' })
  testPlanId: string;

  @ManyToOne(() => TestPlan, (testPlan) => testPlan.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'test_plan_id' })
  testPlan: TestPlan;

  @Column({ name: 'test_case_id', type: 'uuid' })
  testCaseId: string;

  @ManyToOne(() => TestCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_case_id' })
  testCase: TestCase;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
