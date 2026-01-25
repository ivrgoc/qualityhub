import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Requirement } from './requirement.entity';
import { TestCase } from '../../test-cases/entities/test-case.entity';

@Entity('requirement_coverages')
@Index(['requirementId'])
@Index(['testCaseId'])
@Unique(['requirementId', 'testCaseId'])
export class RequirementCoverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requirement_id', type: 'uuid' })
  requirementId: string;

  @ManyToOne(() => Requirement, (requirement) => requirement.coverages)
  @JoinColumn({ name: 'requirement_id' })
  requirement: Requirement;

  @Column({ name: 'test_case_id', type: 'uuid' })
  testCaseId: string;

  @ManyToOne(() => TestCase)
  @JoinColumn({ name: 'test_case_id' })
  testCase: TestCase;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
