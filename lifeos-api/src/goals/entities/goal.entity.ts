import {
  Column, CreateDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type GoalMetric =
  | 'sleep.avgHours'
  | 'gym.sessionsCount'
  | 'finance.monthSaved'
  | 'habits.completionRate'
  | 'journal.avgMood';

export type GoalOperator = 'gte' | 'lte';
export type GoalTimeframe = '7d' | '30d' | 'month';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused' | 'archived';

@Entity('goals')
@Index(['user', 'status'])
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 64 })
  metric: GoalMetric;

  @Column({ type: 'varchar', length: 8 })
  operator: GoalOperator;

  @Column({ type: 'float' })
  target: number;

  @Column({ type: 'varchar', length: 16 })
  timeframe: GoalTimeframe;

  @Column({ name: 'target_date', type: 'date', nullable: true })
  targetDate: string | null;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: GoalStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
