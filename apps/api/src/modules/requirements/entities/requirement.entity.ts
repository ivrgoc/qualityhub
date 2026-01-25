import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum RequirementStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DEPRECATED = 'deprecated',
}

export enum RequirementSource {
  JIRA = 'jira',
  GITHUB = 'github',
  AZURE_DEVOPS = 'azure_devops',
  MANUAL = 'manual',
  CONFLUENCE = 'confluence',
  OTHER = 'other',
}

@Entity('requirements')
@Index(['projectId'])
@Index(['externalId'])
@Index(['status'])
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id', length: 255, nullable: true })
  externalId: string | null;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: RequirementSource,
    default: RequirementSource.MANUAL,
  })
  source: RequirementSource;

  @Column({
    type: 'enum',
    enum: RequirementStatus,
    default: RequirementStatus.DRAFT,
  })
  status: RequirementStatus;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_fields' })
  customFields: Record<string, unknown> | null;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany('RequirementCoverage', 'requirement')
  coverages: import('./requirement-coverage.entity').RequirementCoverage[];
}
