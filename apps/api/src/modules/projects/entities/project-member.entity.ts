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
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

export enum ProjectRole {
  VIEWER = 'viewer',
  TESTER = 'tester',
  LEAD = 'lead',
  ADMIN = 'admin',
}

@Entity('project_members')
@Unique(['projectId', 'userId'])
@Index(['projectId'])
@Index(['userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
    default: ProjectRole.TESTER,
  })
  role: ProjectRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
