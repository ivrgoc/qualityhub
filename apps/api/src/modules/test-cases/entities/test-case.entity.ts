import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum TestCaseTemplate {
  STEPS = 'steps',
  TEXT = 'text',
  BDD = 'bdd',
  EXPLORATORY = 'exploratory',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: TestCaseTemplate,
    default: TestCaseTemplate.STEPS,
    name: 'template_type',
  })
  templateType: TestCaseTemplate;

  @Column({ nullable: true })
  preconditions: string;

  @Column({ type: 'jsonb', nullable: true })
  steps: Record<string, unknown>[];

  @Column({ nullable: true, name: 'expected_result' })
  expectedResult: string;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({ nullable: true })
  estimate: number;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_fields' })
  customFields: Record<string, unknown>;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
