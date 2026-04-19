import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type InsightCategory = 'health' | 'finance' | 'productivity';
export type InsightPriority = 'info' | 'warn' | 'urgent';

@Entity('insights')
@Index(['user', 'createdAt'])
@Index(['dedupeKey'], { unique: true })
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.insights, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'rule_id' })
  ruleId: string;

  @Column({ type: 'varchar', length: 32 })
  category: InsightCategory;

  @Column({ type: 'varchar', length: 16 })
  priority: InsightPriority;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @Column({ name: 'dedupe_key' })
  dedupeKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;
}
