import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TestSuite } from './test-suite.entity';

@Entity('sections')
@Index(['suiteId'])
@Index(['parentId'])
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'suite_id', type: 'uuid' })
  suiteId: string;

  @ManyToOne(() => TestSuite, (suite) => suite.sections)
  @JoinColumn({ name: 'suite_id' })
  suite: TestSuite;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Section, (section) => section.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Section | null;

  @OneToMany(() => Section, (section) => section.parent)
  children: Section[];

  @Column({ type: 'integer', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
