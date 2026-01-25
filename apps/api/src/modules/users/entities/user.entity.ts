import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

export enum UserRole {
  VIEWER = 'viewer',
  TESTER = 'tester',
  LEAD = 'lead',
  PROJECT_ADMIN = 'project_admin',
  ORG_ADMIN = 'org_admin',
}

@Entity('users')
@Index(['orgId'])
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id', type: 'uuid' })
  orgId: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.TESTER,
  })
  role: UserRole;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
